import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { isProjectMember, isProjectAdmin } from '../middleware/projectAccess.js';
import {
  getAllProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} from '../controllers/project.controller.js';
import { createProjectSchema, updateProjectSchema, addMemberSchema, validate } from '../validators/project.validator.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/projects - Get all projects for the authenticated user
router.get('/', getAllProjects);

// POST /api/projects - Create a new project
router.post('/', validate(createProjectSchema), createProject);

// GET /api/projects/:id - Get a specific project (member access)
router.get('/:id', isProjectMember, getProjectById);

// PUT /api/projects/:id - Update a project (admin access)
router.put('/:id', isProjectAdmin, validate(updateProjectSchema), updateProject);

// DELETE /api/projects/:id - Delete a project (admin access)
router.delete('/:id', isProjectAdmin, deleteProject);

// POST /api/projects/:id/members - Add a member to project (admin access)
router.post('/:id/members', isProjectAdmin, validate(addMemberSchema), addMember);

// DELETE /api/projects/:id/members/:userId - Remove a member from project (admin access)
router.delete('/:id/members/:userId', isProjectAdmin, removeMember);

export default router;