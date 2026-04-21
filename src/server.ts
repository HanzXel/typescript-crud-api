import express, { Application } from 'express';
import cors from 'cors';
import { initialize } from './_helpers/db';
import { router as userRouter } from './users/users.controller';
import { router as accountRouter } from './accounts/accounts.controller';
import { router as departmentRouter } from './departments/departments.controller';
import { router as employeeRouter } from './employees/employees.controller';
import { router as requestRouter } from './requests/requests.controller';
import { errorHandler } from './_middleware/errorHandler';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/users', userRouter);
app.use('/accounts', accountRouter);
app.use('/departments', departmentRouter);
app.use('/employees', employeeRouter);
app.use('/requests', requestRouter);

// Global error handler
app.use(errorHandler);

const PORT = 4000;

initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });