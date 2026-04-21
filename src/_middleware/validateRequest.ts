import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export function validateRequest(
  req: Request,
  next: NextFunction,
  schema: Joi.ObjectSchema
): void {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    next(new Error(error.details.map(d => d.message).join(', ')));
  } else {
    next();
  }
}