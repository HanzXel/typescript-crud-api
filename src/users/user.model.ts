import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Role } from '../_helpers/role';

export interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  passwordHash: string;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'passwordHash'>;

export class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public role!: Role;
  public passwordHash!: string;
}

export function initUserModel(sequelize: Sequelize): void {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      role: {
        type: DataTypes.ENUM(...Object.values(Role)),
        allowNull: false,
        defaultValue: Role.User
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      defaultScope: {
        attributes: { exclude: ['passwordHash'] }
      }
    }
  );
}