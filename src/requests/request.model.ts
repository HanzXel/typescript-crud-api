import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface RequestAttributes {
  id: number;
  employeeEmail: string;
  type: string;
  items: string;
  status: string;
  date: string;
}

export type RequestCreationAttributes = Optional<RequestAttributes, 'id'>;

export class Request extends Model<RequestAttributes, RequestCreationAttributes>
  implements RequestAttributes {
  public id!: number;
  public employeeEmail!: string;
  public type!: string;
  public items!: string;
  public status!: string;
  public date!: string;
}

export function initRequestModel(sequelize: Sequelize): void {
  Request.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      employeeEmail: { type: DataTypes.STRING, allowNull: false },
      type: { type: DataTypes.STRING, allowNull: false },
      items: { type: DataTypes.TEXT, allowNull: false },
      status: { type: DataTypes.STRING, defaultValue: 'Pending' },
      date: { type: DataTypes.STRING, allowNull: false },
    },
    { sequelize, modelName: 'Request', tableName: 'requests' }
  );
}