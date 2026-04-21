import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface AccountAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: string;
  verified: boolean;
}

export type AccountCreationAttributes = Optional<AccountAttributes, 'id' | 'passwordHash'>;

export class Account extends Model<AccountAttributes, AccountCreationAttributes>
  implements AccountAttributes {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public passwordHash!: string;
  public role!: string;
  public verified!: boolean;
}

export function initAccountModel(sequelize: Sequelize): void {
  Account.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.STRING, defaultValue: 'user' },
      verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: 'Account',
      tableName: 'accounts',
      defaultScope: {
        attributes: { exclude: ['passwordHash'] }
      }
    }
  );
}