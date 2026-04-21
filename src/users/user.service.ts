import bcrypt from 'bcryptjs';
import db from '../_helpers/db';
import { User, UserCreationAttributes } from './user.model';
import { Role } from '../_helpers/role';

interface CreateParams extends UserCreationAttributes {
  password: string;
}

interface UpdateParams extends Partial<UserCreationAttributes> {
  password?: string;
}

export async function getAll(): Promise<User[]> {
  return await db.User.findAll();
}

export async function getById(id: number): Promise<User> {
  const user = await db.User.findByPk(id);
  if (!user) throw new Error('User not found');
  return user;
}

export async function create(params: CreateParams): Promise<void> {
  const existing = await db.User.findOne({ where: { email: params.email } });
  if (existing) throw new Error(`Email "${params.email}" is already registered`);

  const passwordHash = await bcrypt.hash(params.password, 10);

  await db.User.create({
    firstName: params.firstName,
    lastName: params.lastName,
    email: params.email,
    role: params.role ?? Role.User,
    passwordHash
  });
}

export async function update(id: number, params: UpdateParams): Promise<void> {
  const user = await db.User.unscoped().findByPk(id);
  if (!user) throw new Error('User not found');

  if (params.email && params.email !== user.email) {
    const existing = await db.User.findOne({ where: { email: params.email } });
    if (existing) throw new Error(`Email "${params.email}" is already registered`);
  }

  if (params.password) {
    (params as any).passwordHash = await bcrypt.hash(params.password, 10);
    delete params.password;
  }

  await user.update(params);
}

export async function _delete(id: number): Promise<void> {
  const user = await db.User.unscoped().findByPk(id);
  if (!user) throw new Error('User not found');
  await user.destroy();
}