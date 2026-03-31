import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { AuthUser } from './firebase-auth';

vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn(() => 'mocked-jwks'),
  jwtVerify: vi.fn(),
}));

import { jwtVerify } from 'jose';
import { firebaseAuth } from './firebase-auth';
import { requireTenant } from './tenant';
import { errorHandler } from './error-handler';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockValidToken(payload: Record<string, unknown>) {
  vi.mocked(jwtVerify).mockResolvedValueOnce({ payload } as any);
  return 'Bearer mock.valid.token';
}

function makeApp() {
  type Vars = { user: AuthUser; tenantId: string };
  const app = new Hono<{ Variables: Vars }>();
  app.onError(errorHandler);
  app.use('*', firebaseAuth());
  app.use('*', requireTenant());
  app.get('/', (c) => c.json({ tenantId: c.get('tenantId') }));
  return app;
}

// ─── requireTenant() ─────────────────────────────────────────────────────────

describe('requireTenant() middleware', () => {
  beforeEach(() => vi.clearAllMocks());

  it('passes through and sets tenantId when tenant_id is present in token', async () => {
    const req = new Request('http://localhost/', {
      headers: {
        Authorization: mockValidToken({ sub: 'u1', tenant_id: 'mosque_alpha' }),
      },
    });
    const res = await makeApp().request(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.tenantId).toBe('mosque_alpha');
  });

  it('blocks with 403 when tenant_id is missing from token', async () => {
    const req = new Request('http://localhost/', {
      headers: {
        Authorization: mockValidToken({ sub: 'u1' }), // no tenant_id
      },
    });
    const res = await makeApp().request(req);
    expect(res.status).toBe(403);
    const body = (await res.json()) as any;
    expect(body.error).toMatch(/No tenant association/i);
  });

  it('blocks with 403 when tenant_id is empty string', async () => {
    const req = new Request('http://localhost/', {
      headers: {
        Authorization: mockValidToken({ sub: 'u1', tenant_id: '' }),
      },
    });
    const res = await makeApp().request(req);
    expect(res.status).toBe(403);
  });
});
