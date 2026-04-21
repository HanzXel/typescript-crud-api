import express, { Application } from 'express';
import cors from 'cors';
import { initialize } from './_helpers/db';
import { router as userRouter } from './users/users.controller';
import { errorHandler } from './_middleware/errorHandler';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/users', userRouter);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = 4000;

initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });