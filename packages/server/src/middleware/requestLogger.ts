import type { Request, Response, NextFunction } from "express";

/** Logs each request with method, path, status code, and duration */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[SDUI] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
}
