import prisma from '../lib/prisma.js';

export const isProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.userId;

    if (req.user.role === 'ADMIN') return next();

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not a project member' });
    }

    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
};

export const isProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.userId;

    // Check if user is a global admin
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Check if user is a project admin
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });

    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Project admin privileges required.' });
    }

    req.membership = membership;
    next();
  } catch (error) {

    res.status(500).json({ message: 'Internal server error' });
  }
};