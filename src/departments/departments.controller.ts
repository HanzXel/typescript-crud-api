import express, { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validateRequest } from '../_middleware/validateRequest';
import db from '../_helpers/db';

export const router = express.Router();

router.get('/', getAll);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

function createSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    name:        Joi.string().required(),
    description: Joi.string().empty('').default('')
  });
  validateRequest(req, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    name:        Joi.string().empty(''),
    description: Joi.string().empty('')
  });
  validateRequest(req, next, schema);
}

function getAll(req: Request, res: Response, next: NextFunction): void {
  db.Department.findAll()
    .then(depts => res.json(depts))
    .catch(next);
}

function create(req: Request, res: Response, next: NextFunction): void {
  db.Department.create(req.body)
    .then(dept => res.json(dept))
    .catch(next);
}

function update(req: Request, res: Response, next: NextFunction): void {
  db.Department.findByPk(Number(req.params.id))
    .then(dept => {
      if (!dept) throw new Error('Department not found');
      return dept.update(req.body);
    })
    .then(dept => res.json(dept))
    .catch(next);
}

function _delete(req: Request, res: Response, next: NextFunction): void {
  db.Department.findByPk(Number(req.params.id))
    .then(dept => {
      if (!dept) throw new Error('Department not found');
      return dept.destroy();
    })
    .then(() => res.json({ message: 'Department deleted' }))
    .catch(next);
}