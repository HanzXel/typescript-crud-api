import { Sequelize } from 'sequelize';
import { initUserModel, User } from '../users/user.model';
import { initAccountModel, Account } from '../accounts/account.model';
import { initDepartmentModel, Department } from '../departments/department.model';
import { initEmployeeModel, Employee } from '../employees/employee.model';
import { initRequestModel, Request } from '../requests/request.model';

const config = require('../../config.json');

export interface Database {
  sequelize: Sequelize;
  User: typeof User;
  Account: typeof Account;
  Department: typeof Department;
  Employee: typeof Employee;
  Request: typeof Request;
}

const db = {} as Database;

export async function initialize(): Promise<void> {
  const { host, port, user, password, database } = config.database;

  const sequelize = new Sequelize(database, user, password, {
    host,
    port,
    dialect: 'mysql',
    logging: false
  });

  await sequelize.authenticate();
  console.log('✅ Database connected!');

  initUserModel(sequelize);
  initAccountModel(sequelize);
  initDepartmentModel(sequelize);
  initEmployeeModel(sequelize);
  initRequestModel(sequelize);

  db.sequelize = sequelize;
  db.User = User;
  db.Account = Account;
  db.Department = Department;
  db.Employee = Employee;
  db.Request = Request;

  await sequelize.sync({ alter: true });
  console.log('✅ Database synced!');
}

export default db;