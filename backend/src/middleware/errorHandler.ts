import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/httpError.js';

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'NotFound' });
}

/**
 * Centralised error handler. Express identifies it by its four-arg signature,
 * so `next` must stay in the signature even though it is unused.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.name, message: err.message });
    return;
  }
  const message = err instanceof Error ? err.message : 'Unexpected error';
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'InternalServerError', message });
}
