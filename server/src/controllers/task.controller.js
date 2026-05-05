import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getTasks = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { status, priority, assigneeId } = req.query;

    const where = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.task.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ tasks });
  } catch (error) {
    console.error('getTasks error:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

export const createTask = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { title, description, priority, dueDate, assigneeId } = req.body;
    const creatorId = req.user.userId;

    // Validate assignee is a member if provided
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
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate,
        assigneeId,
        creatorId,
        projectId
      },
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

    res.status(201).json({ task });
  } catch (error) {
    console.error('createTask error:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const projectId = req.params.id;
    const taskId = req.params.taskId;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId
      },
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

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error('getTaskById error:', error);
    res.status(500).json({ message: 'Failed to fetch task' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const projectId = req.params.id;
    const taskId = req.params.taskId;
    const userId = req.user.userId;
    const userRole = req.user.role;

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

    // Check permissions: creator, assignee, or project admin
    const isCreator = task.creatorId === userId;
    const isAssignee = task.assigneeId === userId;
    const isProjectAdmin = task.project.members[0]?.role === 'ADMIN' || userRole === 'ADMIN';

    if (!isCreator && !isAssignee && !isProjectAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
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
    console.error('updateTask error:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const projectId = req.params.id;
    const taskId = req.params.taskId;
    const userId = req.user.userId;
    const userRole = req.user.role;

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

    // Check permissions: creator or project admin
    const isCreator = task.creatorId === userId;
    const isProjectAdmin = task.project.members[0]?.role === 'ADMIN' || userRole === 'ADMIN';

    if (!isCreator && !isProjectAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.status(204).send();
  } catch (error) {
    console.error('deleteTask error:', error);
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

    // Check permissions: assignee or project admin
    const isAssignee = task.assigneeId === userId;
    const isProjectAdmin = task.project.members[0]?.role === 'ADMIN' || userRole === 'ADMIN';

    if (!isAssignee && !isProjectAdmin) {
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
    console.error('updateTaskStatus error:', error);
    res.status(500).json({ message: 'Failed to update task status' });
  }
};