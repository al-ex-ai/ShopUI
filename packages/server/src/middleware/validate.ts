import type { Request, Response, NextFunction } from "express";
import { z } from "zod/v4";

interface ValidateOptions {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
}

/**
 * Express middleware factory for Zod-based request validation.
 * Validates body, params, and/or query against provided schemas.
 */
export function validate(schemas: ValidateOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = z.parse(schemas.body, req.body);
      }
      if (schemas.params) {
        req.params = z.parse(schemas.params, req.params) as typeof req.params;
      }
      if (schemas.query) {
        req.query = z.parse(schemas.query, req.query) as typeof req.query;
      }
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const messages = err.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: messages.join("; "),
            details: err.issues,
          },
        });
        return;
      }
      next(err);
    }
  };
}
