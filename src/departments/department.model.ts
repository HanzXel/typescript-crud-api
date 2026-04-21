import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface DepartmentAttributes {
  id: number;
  name: string;
  description: string;
}

export type DepartmentCreationAttributes = Optional<DepartmentAttributes, 'id'>;

export class Department extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
}

export function initDepartmentModel(sequelize: Sequelize): void {
  Department.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.STRING, defaultValue: '' },
    },
    { sequelize, modelName: 'Department', tableName: 'departments' }
  );
}