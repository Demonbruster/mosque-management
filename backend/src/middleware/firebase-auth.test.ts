import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { firebaseAuth, requireRole } from './firebase-auth';

// Helper to create a dummy token base64
function createToken(payload: object) {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString('base64');
  return `header.${b64}.signature`;
}

import { AuthUser } from './firebase-auth';

describe('Firebase Auth Middleware & RBAC', () => {
  it('should reject missing authorization header', async () => {
    const app = new Hono<{ Variables: { user: AuthUser } }>();
    app.use('*', firebaseAuth());
    app.get('/', (c) => c.text('ok'));

    const res = await app.request('/');
    expect(res.status).toBe(401);
  });

  it('should reject invalid token format', async () => {
    const app = new Hono<{ Variables: { user: AuthUser } }>();
    app.use('*', firebaseAuth());
    app.get('/', (c) => c.text('ok'));

    const req = new Request('http://localhost/', {
      headers: { Authorization: 'Bearer badtoken' },
    });
    const res = await app.request(req);
    expect(res.status).toBe(401);
  });

  it('should parse token and set user contextual data', async () => {
    const app = new Hono<{ Variables: { user: AuthUser } }>();
    app.use('*', firebaseAuth());
    app.get('/', (c) => {
      const user = c.get('user');
      return c.json(user);
    });

    const token = createToken({
      sub: 'user_123',
      email: 'test@example.com',
      role: 'admin',
      tenant_id: 'tenant_abc',
    });

    const req = new Request('http://localhost/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const res = await app.request(req);

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.uid).toBe('user_123');
    expect(data.email).toBe('test@example.com');
    expect(data.role).toBe('admin');
    expect(data.tenant_id).toBe('tenant_abc');
  });

  it('should enforce requireRole correctly (allow)', async () => {
    const app = new Hono<{ Variables: { user: AuthUser } }>();
    app.use('*', firebaseAuth());
    app.use('*', requireRole('admin'));
    app.get('/', (c) => c.text('ok'));

    const token = createToken({
      sub: 'user_123',
      role: 'admin',
    });

    const req = new Request('http://localhost/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const res = await app.request(req);
    expect(res.status).toBe(200);
  });

  it('should enforce requireRole correctly (deny)', async () => {
    const app = new Hono<{ Variables: { user: AuthUser } }>();
    app.use('*', firebaseAuth());
    app.use('*', requireRole('admin'));
    app.get('/', (c) => c.text('ok'));

    // User is "member", but route requires "admin"
    const token = createToken({
      sub: 'user_123',
      role: 'member',
    });

    const req = new Request('http://localhost/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const res = await app.request(req);
    expect(res.status).toBe(403);
  });
});
