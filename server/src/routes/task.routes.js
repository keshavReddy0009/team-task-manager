import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { isProjectMember } from '../middleware/projectAccess.js';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
} from '../controllers/task.controller.js';
import { createTaskSchema, updateTaskSchema, updateStatusSchema, validate } from '../validators/task.validator.js';

const router = express.Router();

// Task routes
router.get('/:id/tasks', verifyToken, isProjectMember, getTasks);
router.post('/:id/tasks', verifyToken, isProjectMember, validate(createTaskSchema), createTask);
router.get('/:id/tasks/:taskId', verifyToken, isProjectMember, getTaskById);
router.put('/:id/tasks/:taskId', verifyToken, isProjectMember, validate(updateTaskSchema), updateTask);
router.delete('/:id/tasks/:taskId', verifyToken, isProjectMember, deleteTask);
router.patch('/:id/tasks/:taskId/status', verifyToken, isProjectMember, validate(updateStatusSchema), updateTaskStatus);

export default router;