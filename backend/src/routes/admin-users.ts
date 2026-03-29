import { Hono } from 'hono';
import admin from 'firebase-admin';
import { firebaseAuth, requireRole } from '../middleware/firebase-auth';
import type { Env } from '../db/client';

// Initialize Firebase Admin (lazy loaded to prevent early crash if config missing)
let appInitialized = false;
function getAuth() {
  if (!appInitialized) {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        // Assumes FIREBASE_* env vars are available in process.env or via binding
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    appInitialized = true;
  }
  return admin.auth();
}

import { AuthUser } from '../middleware/firebase-auth';

const router = new Hono<{
  Bindings: Env;
  Variables: { user: AuthUser };
}>();

// All admin routes are protected and strictly require "admin" role
router.use('*', firebaseAuth());
router.use('*', requireRole('admin'));

// ST-3.1: POST /api/admin/users/invite - admin creates a Firebase user
router.post('/invite', async (c) => {
  const body = await c.req.json();
  const { email, password, role, name } = body;

  const user = c.get('user') as any;
  const tenant_id = user?.tenant_id;

  if (!email || !password || !role) {
    return c.json({ error: 'Email, password, and role are required' }, 400);
  }

  if (!tenant_id) {
    return c.json({ error: 'Admin must belong to a tenant' }, 400);
  }

  try {
    const auth = getAuth();
    // 1. Create a Firebase user
    const newUser = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Set custom claims (tenant_id from the admin making the request)
    await auth.setCustomUserClaims(newUser.uid, {
      role,
      tenant_id,
    });

    return c.json(
      {
        uid: newUser.uid,
        email: newUser.email,
        role,
        message: 'User invited successfully',
      },
      201,
    );
  } catch (err: any) {
    console.error('Invite User Error:', err);
    return c.json({ error: err.message || 'Failed to invite user' }, 500);
  }
});

// ST-3.2: GET /api/admin/users - list all users for the tenant
router.get('/', async (c) => {
  const userContext = c.get('user') as any;
  const tenant_id = userContext?.tenant_id;

  if (!tenant_id) {
    return c.json({ error: 'Admin must belong to a tenant' }, 400);
  }

  try {
    const auth = getAuth();
    const result = await auth.listUsers(1000);

    // Filter users by tenant_id
    const tenantUsers = result.users
      .filter((u) => u.customClaims?.tenant_id === tenant_id)
      .map((u) => ({
        uid: u.uid,
        email: u.email,
        name: u.displayName,
        role: u.customClaims?.role || 'member',
        tenant_id: u.customClaims?.tenant_id,
        createdAt: u.metadata.creationTime,
        lastSignInTime: u.metadata.lastSignInTime,
      }));

    return c.json(tenantUsers);
  } catch (err: any) {
    console.error('List Users Error:', err);
    return c.json({ error: err.message || 'Failed to list users' }, 500);
  }
});

// ST-3.3: PATCH /api/admin/users/:uid/role - update a user's role
router.patch('/:uid/role', async (c) => {
  const uid = c.req.param('uid');
  const { role } = await c.req.json();
  const userContext = c.get('user') as any;
  const tenant_id = userContext?.tenant_id;

  if (!role) {
    return c.json({ error: 'Role is required' }, 400);
  }

  try {
    const auth = getAuth();
    // Verify user belongs to same tenant
    const targetUser = await auth.getUser(uid);
    if (targetUser.customClaims?.tenant_id !== tenant_id) {
      return c.json({ error: 'User not found or access denied' }, 403);
    }

    await auth.setCustomUserClaims(uid, {
      ...targetUser.customClaims,
      role,
    });

    return c.json({ message: `Role updated to ${role}` });
  } catch (err: any) {
    console.error('Update Role Error:', err);
    return c.json({ error: err.message || 'Failed to update role' }, 500);
  }
});

export { router as adminUsersRoutes };
