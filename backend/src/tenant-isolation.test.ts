import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock jose before importing app (which imports middleware that calls createRemoteJWKSet)
vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn(() => 'mocked-jwks'),
  jwtVerify: vi.fn(),
}));

import { jwtVerify } from 'jose';
import app from './index';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockTokenForTenant(tenantId: string, role = 'admin') {
  vi.mocked(jwtVerify).mockResolvedValueOnce({
    payload: { sub: `user_${tenantId}`, role, tenant_id: tenantId },
  } as any);
  return `Bearer mock.${tenantId}.token`;
}

// ─── Cross-Tenant Isolation ───────────────────────────────────────────────────

describe('Cross-Tenant Isolation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 for all protected /api/* routes without Authorization', async () => {
    const routes = ['/api/households', '/api/persons', '/api/transactions'];
    for (const route of routes) {
      const res = await app.request(route);
      expect(res.status, `${route} should be 401`).toBe(401);
    }
  });

  it('returns 403 when authenticated user has no tenant_id claim', async () => {
    vi.mocked(jwtVerify).mockResolvedValueOnce({
      payload: { sub: 'orphan_user', role: 'admin' }, // No tenant_id
    } as any);

    const res = await app.request('/api/households', {
      headers: { Authorization: 'Bearer mock.orphan.token' },
    });
    expect(res.status).toBe(403);
    const body = (await res.json()) as any;
    expect(body.error).toMatch(/No tenant association/i);
  });

  it('/api/health is accessible without auth → 200', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
  });

  it('/api/whatsapp/webhook is accessible without auth → 200', async () => {
    const res = await app.request('/api/whatsapp/webhook');
    expect(res.status).toBe(200);
  });

  it('Tenant A token scopes to tenant A — middleware does not return 403', async () => {
    // Validates that tenantId flows correctly through the middleware chain.
    // Full DB cross-tenant access tests belong in backend/tests/integration/.
    const res = await app.request('/api/households', {
      headers: { Authorization: mockTokenForTenant('mosque_alpha') },
    });
    // The middleware accepted the request (tenantId was set correctly).
    // Status may be 500 in test env (no real DB), but must NOT be 403.
    expect(res.status).not.toBe(403);
    expect(res.status).not.toBe(401);
  });
});
