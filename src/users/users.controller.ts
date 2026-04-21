import express, { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validateRequest } from '../_middleware/validateRequest';
import * as userService from './user.service';
import { Role } from '../_helpers/role';

export const router = express.Router();

// Routes
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

// Schema middleware
function createSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName:  Joi.string().required(),
    email:     Joi.string().email().required(),
    role:      Joi.string().valid(Role.Admin, Role.User).required(),
    password:  Joi.string().min(6).required()
  });
  validateRequest(req, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    firstName: Joi.string().empty(''),
    lastName:  Joi.string().empty(''),
    email:     Joi.string().email().empty(''),
    role:      Joi.string().valid(Role.Admin, Role.User).empty(''),
    password:  Joi.string().min(6).empty('')
  });
  validateRequest(req, next, schema);
}

// Route handlers
function getAll(req: Request, res: Response, next: NextFunction): void {
  userService.getAll()
    .then(users => res.json(users))
    .catch(next);
}

function getById(req: Request, res: Response, next: NextFunction): void {
  userService.getById(Number(req.params.id))
    .then(user => res.json(user))
    .catch(next);
}

function create(req: Request, res: Response, next: NextFunction): void {
  userService.create(req.body)
    .then(() => res.json({ message: 'User created successfully' }))
    .catch(next);
}

function update(req: Request, res: Response, next: NextFunction): void {
  userService.update(Number(req.params.id), req.body)
    .then(() => res.json({ message: 'User updated successfully' }))
    .catch(next);
}

function _delete(req: Request, res: Response, next: NextFunction): void {
  userService._delete(Number(req.params.id))
    .then(() => res.json({ message: 'User deleted successfully' }))
    .catch(next);
}