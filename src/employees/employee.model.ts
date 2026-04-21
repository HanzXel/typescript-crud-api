import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface EmployeeAttributes {
  id: number;
  employeeId: string;
  email: string;
  position: string;
  dept: string;
  hireDate: string;
}

export type EmployeeCreationAttributes = Optional<EmployeeAttributes, 'id'>;

export class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes {
  public id!: number;
  public employeeId!: string;
  public email!: string;
  public position!: string;
  public dept!: string;
  public hireDate!: string;
}

export function initEmployeeModel(sequelize: Sequelize): void {
  Employee.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      employeeId: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      position: { type: DataTypes.STRING, allowNull: false },
      dept: { type: DataTypes.STRING, defaultValue: '' },
      hireDate: { type: DataTypes.STRING, defaultValue: '' },
    },
    { sequelize, modelName: 'Employee', tableName: 'employees' }
  );
}