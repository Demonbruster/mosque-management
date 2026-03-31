import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { AuthUser } from './firebase-auth';

// ─── Mock jose BEFORE importing the middleware ───────────────────────────────
// Prevents real HTTP calls to Google's JWKS endpoint during tests.
vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn(() => 'mocked-jwks'),
  jwtVerify: vi.fn(),
}));

import { jwtVerify } from 'jose';
import { firebaseAuth, requireRole } from './firebase-auth';
import { errorHandler } from './error-handler';

// Reset the lazy JWKS cache between tests so mock is always used fresh
beforeEach(() => {
  vi.clearAllMocks();
  // Force the lazy JWKS getter to re-call createRemoteJWKSet with the mock
  vi.resetModules();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

type MockPayload = {
  sub: string;
  email?: string;
  role?: string;
  tenant_id?: string;
};

function mockValidToken(payload: MockPayload) {
  vi.mocked(jwtVerify).mockResolvedValueOnce({ payload } as any);
  return 'Bearer mock.valid.token';
}

function mockExpiredToken() {
  vi.mocked(jwtVerify).mockRejectedValueOnce(new Error('JWT expired'));
  return 'Bearer mock.expired.token';
}

function mockInvalidSignature() {
  vi.mocked(jwtVerify).mockRejectedValueOnce(new Error('signature verification failed'));
  return 'Bearer mock.forged.token';
}

function makeApp() {
  const app = new Hono<{ Variables: { user: AuthUser } }>();
  app.onError(errorHandler);
  app.use('*', firebaseAuth());
  app.get('/', (c) => c.json(c.get('user')));
  return app;
}

// ─── firebaseAuth() ───────────────────────────────────────────────────────────

describe('firebaseAuth() middleware', () => {
  // beforeEach already at top-level above

  // ── 1. Header validation ──────────────────────────────────────────────────

  it('rejects request with no Authorization header → 401', async () => {
    const res = await makeApp().request('/');
    expect(res.status).toBe(401);
    const body = (await res.json()) as any;
    expect(body.error).toMatch(/Missing/i);
  });

  it('rejects Authorization header without Bearer prefix → 401', async () => {
    const req = new Request('http://localhost/', {
      headers: { Authorization: 'Token some-random-value' },
    });
    const res = await makeApp().request(req);
    expect(res.status).toBe(401);
  });

  // ── 2. Signature / jose validation ───────────────────────────────────────

  it('rejects expired token → 401', async () => {
    const req = new Request('http://localhost/', {
      headers: { Authorization: mockExpiredToken() },
    });
    const res = await makeApp().request(req);
    expect(res.status).toBe(401);
    const body = (await res.json()) as any;
    expect(body.error).toMatch(/Invalid or expired/i);
  });

  it('rejects forged token (bad signature) → 401', async () => {
    const req = new Request('http://localhost/', {
      headers: { Authorization: mockInvalidSignature() },
    });
    const res = await makeApp().request(req);
    expect(res.status).toBe(401);
  });

  // ── 3. Valid token → context population ──────────────────────────────────

  it('sets user on context from valid token', async () => {
    const req = new Request('http://localhost/', {
      headers: {
        Authorization: mockValidToken({
          sub: 'uid_abc',
          email: 'imam@mosque.com',
          role: 'admin',
          tenant_id: 'tenant_001',
        }),
      },
    });
    const res = await makeApp().request(req);
    expect(res.status).toBe(200);
    const user = (await res.json()) as AuthUser;
    expect(user.uid).toBe('uid_abc');
    expect(user.email).toBe('imam@mosque.com');
    expect(user.role).toBe('admin');
    expect(user.tenant_id).toBe('tenant_001');
  });

  it('defaults role to "member" when no role claim present', async () => {
    const req = new Request('http://localhost/', {
      headers: { Authorization: mockValidToken({ sub: 'uid_xyz' }) },
    });
    const res = await makeApp().request(req);
    const user = (await res.json()) as AuthUser;
    expect(user.role).toBe('member');
  });

  it('leaves tenant_id undefined when not present in token', async () => {
    const req = new Request('http://localhost/', {
      headers: { Authorization: mockValidToken({ sub: 'uid_xyz' }) },
    });
    const res = await makeApp().request(req);
    const user = (await res.json()) as AuthUser;
    expect(user.tenant_id).toBeUndefined();
  });
});

// ─── requireRole() ───────────────────────────────────────────────────────────

describe('requireRole() middleware', () => {
  // beforeEach already at top-level above

  function makeRoleApp(...roles: string[]) {
    const app = new Hono<{ Variables: { user: AuthUser } }>();
    app.onError(errorHandler);
    app.use('*', firebaseAuth());
    app.use('*', requireRole(...roles));
    app.get('/', (c) => c.text('authorized'));
    return app;
  }

  it('allows request when user has required role', async () => {
    const req = new Request('http://localhost/', {
      headers: { Authorization: mockValidToken({ sub: 'u1', role: 'admin' }) },
    });
    const res = await makeRoleApp('admin').request(req);
    expect(res.status).toBe(200);
  });

  it('allows request when user has one of multiple accepted roles', async () => {
    const req = new Request('http://localhost/', {
      headers: { Authorization: mockValidToken({ sub: 'u1', role: 'treasurer' }) },
    });
    const res = await makeRoleApp('admin', 'treasurer').request(req);
    expect(res.status).toBe(200);
  });

  it('denies request when user role is insufficient → 403', async () => {
    const req = new Request('http://localhost/', {
      headers: { Authorization: mockValidToken({ sub: 'u1', role: 'member' }) },
    });
    const res = await makeRoleApp('admin').request(req);
    expect(res.status).toBe(403);
    const body = (await res.json()) as any;
    expect(body.error).toMatch(/Insufficient/i);
  });

  it('denies when default "member" role tries to access admin route → 403', async () => {
    const req = new Request('http://localhost/', {
      headers: { Authorization: mockValidToken({ sub: 'u1' }) }, // no role → defaults to member
    });
    const res = await makeRoleApp('admin').request(req);
    expect(res.status).toBe(403);
  });
});
