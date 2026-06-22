import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny, z } from 'zod';

/**
 * Returns an Express handler that validates `req.body` against the given Zod
 * schema, replacing it with the parsed (typed, coerced) value. On failure it
 * responds 400 with flattened field errors.
 */
export function validateBody<Schema extends ZodTypeAny>(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'ValidationError',
        fields: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data as z.infer<Schema>;
    next();
  };
}
