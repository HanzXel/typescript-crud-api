import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../_helpers/db';
import { AccountCreationAttributes } from './account.model';

const config = require('../../config.json');

interface RegisterParams extends AccountCreationAttributes {
  password: string;
}

interface UpdateParams extends Partial<AccountCreationAttributes> {
  password?: string;
}

export async function register(params: RegisterParams): Promise<void> {
  const existing = await db.Account.findOne({ where: { email: params.email } });
  if (existing) throw new Error(`Email "${params.email}" is already registered`);

  const passwordHash = await bcrypt.hash(params.password, 10);

  await db.Account.create({
    firstName: params.firstName,
    lastName: params.lastName,
    email: params.email,
    role: params.role ?? 'user',
    verified: params.verified ?? false,
    passwordHash
  });
}

export async function authenticate(email: string, password: string): Promise<object> {
  const account = await db.Account.unscoped().findOne({ where: { email } });

  if (!account) throw new Error('Email or password is incorrect');
  if (!account.verified) throw new Error('Please verify your email before logging in');

  const isValid = await bcrypt.compare(password, account.passwordHash);
  if (!isValid) throw new Error('Email or password is incorrect');

  const token = jwt.sign(
    { id: account.id, email: account.email, role: account.role },
    config.secret,
    { expiresIn: '7d' }
  );

  return {
    id: account.id,
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
    role: account.role,
    verified: account.verified,
    token
  };
}

export async function getAll(): Promise<object[]> {
  return await db.Account.findAll();
}

export async function getById(id: number): Promise<object> {
  const account = await db.Account.findByPk(id);
  if (!account) throw new Error('Account not found');
  return account;
}

export async function update(id: number, params: UpdateParams): Promise<void> {
  const account = await db.Account.unscoped().findByPk(id);
  if (!account) throw new Error('Account not found');

  if (params.email && params.email !== account.email) {
    const existing = await db.Account.findOne({ where: { email: params.email } });
    if (existing) throw new Error(`Email "${params.email}" is already registered`);
  }

  if (params.password) {
    (params as any).passwordHash = await bcrypt.hash(params.password, 10);
    delete params.password;
  }

  await account.update(params);
}

export async function _delete(id: number): Promise<void> {
  const account = await db.Account.unscoped().findByPk(id);
  if (!account) throw new Error('Account not found');
  await account.destroy();
}

export async function verifyEmail(email: string): Promise<void> {
  const account = await db.Account.unscoped().findOne({ where: { email } });
  if (!account) throw new Error('Account not found');
  await account.update({ verified: true });
}