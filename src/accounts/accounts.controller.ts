import express, { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validateRequest } from '../_middleware/validateRequest';
import * as accountService from './account.service';

export const router = express.Router();

// Routes
router.post('/register', registerSchema, register);
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/verify-email', verifyEmail);
router.get('/', getAll);
router.get('/:id', getById);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

function registerSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName:  Joi.string().required(),
    email:     Joi.string().email().required(),
    password:  Joi.string().min(6).required(),
    role:      Joi.string().valid('admin', 'user').default('user'),
    verified:  Joi.boolean().default(false)
  });
  validateRequest(req, next, schema);
}

function authenticateSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required()
  });
  validateRequest(req, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    firstName: Joi.string().empty(''),
    lastName:  Joi.string().empty(''),
    email:     Joi.string().email().empty(''),
    password:  Joi.string().min(6).empty(''),
    role:      Joi.string().valid('admin', 'user').empty(''),
    verified:  Joi.boolean()
  });
  validateRequest(req, next, schema);
}

function register(req: Request, res: Response, next: NextFunction): void {
  accountService.register(req.body)
    .then(() => res.json({ message: 'Registration successful. Please verify your email.' }))
    .catch(next);
}

function authenticate(req: Request, res: Response, next: NextFunction): void {
  accountService.authenticate(req.body.email, req.body.password)
    .then(account => res.json(account))
    .catch(next);
}

function verifyEmail(req: Request, res: Response, next: NextFunction): void {
  accountService.verifyEmail(req.body.email)
    .then(() => res.json({ message: 'Email verified successfully' }))
    .catch(next);
}

function getAll(req: Request, res: Response, next: NextFunction): void {
  accountService.getAll()
    .then(accounts => res.json(accounts))
    .catch(next);
}

function getById(req: Request, res: Response, next: NextFunction): void {
  accountService.getById(Number(req.params.id))
    .then(account => res.json(account))
    .catch(next);
}

function update(req: Request, res: Response, next: NextFunction): void {
  accountService.update(Number(req.params.id), req.body)
    .then(() => res.json({ message: 'Account updated successfully' }))
    .catch(next);
}

function _delete(req: Request, res: Response, next: NextFunction): void {
  accountService._delete(Number(req.params.id))
    .then(() => res.json({ message: 'Account deleted successfully' }))
    .catch(next);
}