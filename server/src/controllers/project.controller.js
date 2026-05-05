import prisma from '../lib/prisma.js';

export const getAllProjects = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ projects });
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user.userId;

    const result = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name,
          description,
          ownerId
        }
      });

      await tx.projectMember.create({
        data: {
          userId: ownerId,
          projectId: project.id,
          role: 'ADMIN'
        }
      });

      return project;
    });

    res.status(201).json({ project: result });
  } catch (error) {
    console.error('createProject error:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('getProjectById error:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { name, description, status } = req.body;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status })
      }
    });

    res.json({ project });
  } catch (error) {
    console.error('updateProject error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).json({ message: 'Failed to update project' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    await prisma.$transaction(async (tx) => {
      // Delete all tasks first
      await tx.task.deleteMany({
        where: { projectId }
      });

      // Delete all project members
      await tx.projectMember.deleteMany({
        where: { projectId }
      });

      // Delete the project
      await tx.project.delete({
        where: { id: projectId }
      });
    });

    res.status(204).send();
  } catch (error) {
    console.error('deleteProject error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).json({ message: 'Failed to delete project' });
  }
};

export const addMember = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { email, role } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId
        }
      }
    });

    if (existingMember) {
      return res.status(409).json({ message: 'User is already a member of this project' });
    }

    // Add member
    const membership = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId,
        role
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({ membership });
  } catch (error) {
    console.error('addMember error:', error);
    res.status(500).json({ message: 'Failed to add member' });
  }
};

export const removeMember = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.params.userId;

    // Get project to check owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Cannot remove project owner
    if (project.ownerId === userId) {
      return res.status(400).json({ message: 'Cannot remove project owner' });
    }

    // Remove member
    await prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('removeMember error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.status(500).json({ message: 'Failed to remove member' });
  }
};