// ============================================
// Global Error Handler Middleware
// ============================================

import type { ErrorHandler } from "hono";

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(`[ERROR] ${err.message}`, {
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  });

  const status = "status" in err ? (err as any).status : 500;
  const message =
    status === 500 ? "Internal Server Error" : err.message;

  return c.json(
    {
      success: false,
      error: message,
      ...(c.env.ENVIRONMENT !== "production" && { stack: err.stack }),
    },
    status
  );
};
