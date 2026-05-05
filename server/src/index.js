import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import path, { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import seed from '../prisma/seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

const app = express();

// ✅ CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ✅ Health check
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ✅ SEED ROUTE (ADD HERE)
app.get('/api/seed', async (req, res) => {
  try {
    await seed();
    res.json({ message: 'Database seeded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Seeding failed' });
  }
});

// 🔥 Production static file serving (KEEP AFTER API ROUTES)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../../client/dist/index.html'));
  });
}

// ✅ Cron job
cron.schedule('0 * * * *', async () => {
  try {
    await prisma.task.updateMany({
      where: {
        dueDate: { lt: new Date() },
        status: { notIn: ['DONE', 'OVERDUE'] }
      },
      data: { status: 'OVERDUE' }
    });
  } catch (error) {
    console.error('Cron error:', error);
  }
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ✅ Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});