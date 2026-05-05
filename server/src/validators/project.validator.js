import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional()
});

const updateProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional()
});

const addMemberSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: z.enum(['ADMIN', 'MEMBER'])
});

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message
    }));
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }
  next();
};

export { createProjectSchema, updateProjectSchema, addMemberSchema, validate };