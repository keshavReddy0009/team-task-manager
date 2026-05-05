import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getTasks = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;
    const userId = req.user.userId;
    const { status, priority, assigneeId } = req.query;

    // STRICT_MODE=true: members only see tasks they created or are assigned to.
    const STRICT_MODE = true;

    const whereCondition = { projectId };

    if (status) whereCondition.status = status;
    if (priority) whereCondition.priority = priority;
    if (assigneeId) whereCondition.assigneeId = assigneeId;

    if (req.user.role !== 'ADMIN' && STRICT_MODE) {
      whereCondition.OR = [{ creatorId: userId }, { assigneeId: userId }];
    }

    const tasks = await prisma.task.findMany({
      where: whereCondition,
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;
    const { title, description, priority, dueDate, assigneeId } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (assigneeId) {
      const member = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: assigneeId,
            projectId
          }
        }
      });

      if (!member) {
        return res.status(400).json({
          message: 'Assignee must be a project member'
        });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        creatorId: req.user.userId,
        assigneeId: assigneeId || null
      }
    });

    return res.status(201).json({ task });
  } catch (err) {

    next(err);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const { id: projectId, taskId } = req.params;
    const userId = req.user.userId;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
        ...(req.user.role === 'ADMIN'
          ? {}
          : {
              OR: [{ creatorId: userId }, { assigneeId: userId }]
            })
      },
      include: {
        assignee: true,
        creator: true
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or access denied' });
    }

    return res.json({ task });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res) => {
  try {
    const projectId = req.params.id;
    const taskId = req.params.taskId;
    const userId = req.user.userId;

    // Get task to check permissions
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId
      },
      include: {
        project: {
          include: {
            members: {
              where: { userId }
            }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.membership?.role !== 'ADMIN' && task.creatorId !== userId && task.assigneeId !== userId) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    // Validate assignee is a member if provided
    if (req.body.assigneeId) {
      const member = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: req.body.assigneeId,
            projectId
          }
        }
      });
      if (!member) {
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: req.body,
      include: {
        assignee: {
          select: {
            name: true,
            email: true
          }
        },
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json({ task: updatedTask });
  } catch (error) {

    res.status(500).json({ message: 'Failed to update task' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const projectId = req.params.id;
    const taskId = req.params.taskId;
    const userId = req.user.userId;

    // Get task to check permissions
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId
      },
      include: {
        project: {
          include: {
            members: {
              where: { userId }
            }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.membership?.role !== 'ADMIN' && task.creatorId !== userId && task.assigneeId !== userId) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.status(204).send();
  } catch (error) {

    res.status(500).json({ message: 'Failed to delete task' });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const projectId = req.params.id;
    const taskId = req.params.taskId;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { status } = req.body;

    // Get task to check permissions
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId
      },
      include: {
        project: {
          include: {
            members: {
              where: { userId }
            }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.membership?.role !== 'ADMIN' && task.assigneeId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update task status' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        assignee: {
          select: {
            name: true,
            email: true
          }
        },
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json({ task: updatedTask });
  } catch (error) {

    res.status(500).json({ message: 'Failed to update task status' });
  }
};