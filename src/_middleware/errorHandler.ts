import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const status = err.message === 'User not found' ? 404 : 400;
  res.status(status).json({ message: err.message });
}