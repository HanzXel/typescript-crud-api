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
    employeeEmail: Joi.string().email().required(),
    type:          Joi.string().required(),
    items:         Joi.string().required(),
    status:        Joi.string().default('Pending'),
    date:          Joi.string().required()
  });
  validateRequest(req, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    status: Joi.string().valid('Pending', 'Approved', 'Rejected')
  });
  validateRequest(req, next, schema);
}

function getAll(req: Request, res: Response, next: NextFunction): void {
  db.Request.findAll()
    .then(requests => res.json(requests))
    .catch(next);
}

function create(req: Request, res: Response, next: NextFunction): void {
  db.Request.create(req.body)
    .then(request => res.json(request))
    .catch(next);
}

function update(req: Request, res: Response, next: NextFunction): void {
  db.Request.findByPk(Number(req.params.id))
    .then(request => {
      if (!request) throw new Error('Request not found');
      return request.update(req.body);
    })
    .then(request => res.json(request))
    .catch(next);
}

function _delete(req: Request, res: Response, next: NextFunction): void {
  db.Request.findByPk(Number(req.params.id))
    .then(request => {
      if (!request) throw new Error('Request not found');
      return request.destroy();
    })
    .then(() => res.json({ message: 'Request deleted' }))
    .catch(next);
}