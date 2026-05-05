import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
      description: 'Modernize the company website with a refreshed design and new features.',
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
      description: 'Build and release the mobile version of our task management app.',
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
        description: 'Create layout and visual design for the landing page.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        projectId: projectA.id,
        creatorId: admin.id,
        assigneeId: member1.id
      },
      {
        title: 'Write app onboarding copy',
        description: 'Prepare onboarding screens and help text for the mobile app.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
        projectId: projectB.id,
        creatorId: member1.id,
        assigneeId: member2.id
      },
      {
        title: 'Review user feedback',
        description: 'Evaluate initial user tests and collect improvement ideas.',
        status: 'DONE',
        priority: 'LOW',
        dueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
        projectId: projectA.id,
        creatorId: admin.id,
        assigneeId: member1.id
      },
      {
        title: 'Implement push notifications',
        description: 'Add push notification support to the mobile app.',
        status: 'TODO',
        priority: 'HIGH',
        projectId: projectB.id,
        creatorId: member1.id,
        assigneeId: member2.id
      },
      {
        title: 'Fix task sync issue',
        description: 'Resolve bug causing tasks to disappear when switching projects.',
        status: 'OVERDUE',
        priority: 'HIGH',
        dueDate: new Date(new Date().setDate(new Date().getDate() - 1)),
        projectId: projectA.id,
        creatorId: admin.id,
        assigneeId: member1.id
      }
    ],
    skipDuplicates: true
  });

  console.log('Seed data created successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
