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
    employeeId: Joi.string().required(),
    email:      Joi.string().email().required(),
    position:   Joi.string().required(),
    dept:       Joi.string().empty('').default(''),
    hireDate:   Joi.string().empty('').default('')
  });
  validateRequest(req, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    employeeId: Joi.string().empty(''),
    email:      Joi.string().email().empty(''),
    position:   Joi.string().empty(''),
    dept:       Joi.string().empty(''),
    hireDate:   Joi.string().empty('')
  });
  validateRequest(req, next, schema);
}

function getAll(req: Request, res: Response, next: NextFunction): void {
  db.Employee.findAll()
    .then(employees => res.json(employees))
    .catch(next);
}

function create(req: Request, res: Response, next: NextFunction): void {
  db.Employee.create(req.body)
    .then(employee => res.json(employee))
    .catch(next);
}

function update(req: Request, res: Response, next: NextFunction): void {
  db.Employee.findByPk(Number(req.params.id))
    .then(emp => {
      if (!emp) throw new Error('Employee not found');
      return emp.update(req.body);
    })
    .then(emp => res.json(emp))
    .catch(next);
}

function _delete(req: Request, res: Response, next: NextFunction): void {
  db.Employee.findByPk(Number(req.params.id))
    .then(emp => {
      if (!emp) throw new Error('Employee not found');
      return emp.destroy();
    })
    .then(() => res.json({ message: 'Employee deleted' }))
    .catch(next);
}