import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

dotenv.config();

const prisma = new PrismaClient();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Schedule cron job to update overdue tasks every hour
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Running cron job: updating overdue tasks');
    const result = await prisma.task.updateMany({
      where: {
        dueDate: {
          lt: new Date()
        },
        status: {
          notIn: ['DONE', 'OVERDUE']
        }
      },
      data: {
        status: 'OVERDUE'
      }
    });
    console.log(`Updated ${result.count} tasks to OVERDUE status`);
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
