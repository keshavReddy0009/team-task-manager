import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getDashboard } from '../controllers/dashboard.controller.js';

const router = express.Router();

// Dashboard route requires authentication
router.get('/', verifyToken, getDashboard);

export default router;