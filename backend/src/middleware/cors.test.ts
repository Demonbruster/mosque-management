import { describe, it, expect, vi, beforeEach } from 'vitest';
import { corsMiddleware } from './cors';
import { Hono } from 'hono';

// Mock DB client and schema
vi.mock('../db/client', () => ({
  createDb: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockImplementation(async (n) => {
      // Simulate DB result based on mocked behavior
      return mockedDbResult;
    }),
  })),
}));

let mockedDbResult: any[] = [];

describe('corsMiddleware', () => {
  const env = {
    DATABASE_URL: 'postgres://localhost',
    CORS_ORIGIN: 'https://admin.mosquesystem.com',
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockedDbResult = [];
  });

  it('should allow localhost', async () => {
    const middleware = corsMiddleware(env);
    const app = new Hono();
    app.use('*', middleware);
    app.get('/', (c) => c.text('ok'));

    const res = await app.request('/', {
      headers: { Origin: 'http://localhost:5173' },
      method: 'OPTIONS',
    });

    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
  });

  it('should allow CORS_ORIGIN from env', async () => {
    const middleware = corsMiddleware(env);
    const app = new Hono();
    app.use('*', middleware);
    app.get('/', (c) => c.text('ok'));

    const res = await app.request('/', {
      headers: { Origin: 'https://admin.mosquesystem.com' },
      method: 'OPTIONS',
    });

    expect(res.headers.get('access-control-allow-origin')).toBe('https://admin.mosquesystem.com');
  });

  it('should allow custom domain found in DB', async () => {
    mockedDbResult = [{ id: 'tenant-1' }];

    const middleware = corsMiddleware(env);
    const app = new Hono();
    app.use('*', middleware);
    app.get('/', (c) => c.text('ok'));

    const res = await app.request('/', {
      headers: { Origin: 'https://custom-mosque.org' },
      method: 'OPTIONS',
    });

    expect(res.headers.get('access-control-allow-origin')).toBe('https://custom-mosque.org');
  });

  it('should allow subdomain matching tenant slug', async () => {
    mockedDbResult = [{ id: 'tenant-1' }];

    const middleware = corsMiddleware(env);
    const app = new Hono();
    app.use('*', middleware);
    app.get('/', (c) => c.text('ok'));

    // If the origin is https://al-noor.app.com, it should check for slug 'al-noor'
    const res = await app.request('/', {
      headers: { Origin: 'https://al-noor.app.com' },
      method: 'OPTIONS',
    });

    expect(res.headers.get('access-control-allow-origin')).toBe('https://al-noor.app.com');
  });

  it('should reject unknown origins', async () => {
    mockedDbResult = [];

    const middleware = corsMiddleware(env);
    const app = new Hono();
    app.use('*', middleware);
    app.get('/', (c) => c.text('ok'));

    const res = await app.request('/', {
      headers: { Origin: 'https://malicious-site.com' },
      method: 'OPTIONS',
    });

    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });
});
