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

// All routes require authentication and project membership
router.use(verifyToken);
router.use('/:id', isProjectMember);

// Task routes
router.get('/:id/tasks', getTasks);
router.post('/:id/tasks', validate(createTaskSchema), createTask);
router.get('/:id/tasks/:taskId', getTaskById);
router.put('/:id/tasks/:taskId', validate(updateTaskSchema), updateTask);
router.delete('/:id/tasks/:taskId', deleteTask);
router.patch('/:id/tasks/:taskId/status', validate(updateStatusSchema), updateTaskStatus);

export default router;