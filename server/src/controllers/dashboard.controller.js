import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch all data in parallel
    const [
      totalProjects,
      totalTasks,
      tasksByStatusResult,
      overdueTasks,
      myTasks,
      recentTasks
    ] = await Promise.all([
      // Total projects user is part of
      prisma.projectMember.count({
        where: { userId }
      }),

      // Total tasks assigned to user
      prisma.task.count({
        where: { assigneeId: userId }
      }),

      // Tasks grouped by status
      prisma.task.groupBy({
        by: ['status'],
        where: { assigneeId: userId },
        _count: {
          status: true
        }
      }),

      // Overdue tasks
      prisma.task.findMany({
        where: {
          assigneeId: userId,
          status: {
            notIn: ['DONE', 'OVERDUE']
          },
          dueDate: {
            lt: new Date()
          }
        },
        include: {
          project: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          dueDate: 'asc'
        }
      }),

      // My tasks (top 10 by due date)
      prisma.task.findMany({
        where: { assigneeId: userId },
        include: {
          project: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          dueDate: 'asc'
        },
        take: 10
      }),

      // Recent tasks in user's projects (top 5 by updatedAt)
      prisma.task.findMany({
        where: {
          project: {
            members: {
              some: { userId }
            }
          }
        },
        include: {
          project: {
            select: {
              name: true
            }
          },
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
          updatedAt: 'desc'
        },
        take: 5
      })
    ]);

    // Format tasks by status
    const tasksByStatus = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
      OVERDUE: 0
    };

    tasksByStatusResult.forEach(group => {
      tasksByStatus[group.status] = group._count.status;
    });

    res.json({
      totalProjects,
      totalTasks,
      tasksByStatus,
      overdueTasks,
      myTasks,
      recentTasks
    });
  } catch (error) {
    console.error('getDashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
};