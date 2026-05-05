import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function seed() {
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const memberPassword = await bcrypt.hash('Member@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@test.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  const member1 = await prisma.user.upsert({
    where: { email: 'member1@test.com' },
    update: {},
    create: {
      name: 'Member One',
      email: 'member1@test.com',
      password: memberPassword,
      role: 'MEMBER'
    }
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'member2@test.com' },
    update: {},
    create: {
      name: 'Member Two',
      email: 'member2@test.com',
      password: memberPassword,
      role: 'MEMBER'
    }
  });

  const projectA = await prisma.project.upsert({
    where: { id: 'project-a' },
    update: {},
    create: {
      id: 'project-a',
      name: 'Website Redesign',
      description: 'Modernize the company website.',
      ownerId: admin.id,
      status: 'ACTIVE',
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: member1.id, role: 'MEMBER' }
        ]
      }
    }
  });

  const projectB = await prisma.project.upsert({
    where: { id: 'project-b' },
    update: {},
    create: {
      id: 'project-b',
      name: 'Mobile App Launch',
      description: 'Build mobile app.',
      ownerId: member1.id,
      status: 'ACTIVE',
      members: {
        create: [
          { userId: member1.id, role: 'ADMIN' },
          { userId: member2.id, role: 'MEMBER' }
        ]
      }
    }
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Design homepage',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: projectA.id,
        creatorId: admin.id,
        assigneeId: member1.id
      }
    ],
    skipDuplicates: true
  });

  console.log('Seed data created successfully');
}