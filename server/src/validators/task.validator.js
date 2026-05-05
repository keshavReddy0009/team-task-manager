import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
  dueDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  assigneeId: z.string().optional()
});

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  assigneeId: z.string().optional()
});

const updateStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'OVERDUE'])
});

const validate = (schema) => {
  return (req, res, next) => {
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
    req.body = result.data;
    next();
  };
};

export { createTaskSchema, updateTaskSchema, updateStatusSchema, validate };