# Team Task Manager

Full-stack SaaS app for team project and task management with role-based permissions, real-time overdue detection, and dashboard analytics.

## Live Demo
- Frontend: [Vercel URL]
- Backend API: [Railway URL]
- Test credentials:
  Admin: admin@test.com / Admin@123
  Member: member1@test.com / Member@123

## Features
- JWT Authentication with role-based access (ADMIN/MEMBER)
- Create/manage projects with member invitation
- CRUD tasks with assignee/project linking
- Dashboard with stats, overdue alerts, recent tasks
- RBAC: Admins manage members/tasks, members create/view assigned
- Auto-overdue cron job
- Responsive Tailwind UI with modals/charts

## Tech Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React + Vite + React Query + Tailwind | UI, state, API caching |
| Backend | Node.js + Express | API server |
| Database | MySQL + Prisma ORM | Persistent data |
| Auth | JWT + bcrypt | Secure sessions |
| Validation | Zod | Input sanitization |
| Deployment | Railway + Vercel | Prod hosting |

## Local Development
1. Clone repo
2. `npm install` (root)
3. Setup server: `cd team-task-manager/server`, copy `.env.example` to `.env`, fill DATABASE_URL/JWT_SECRET
4. Setup client: `cd team-task-manager/client`, copy `.env.example` to `.env`
5. Run migrations: `cd team-task-manager/server && npx prisma migrate dev`
6. Seed database: `npm run seed`
7. Start both: `npm run dev`

## API Reference
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/auth/signup | No | - | Create user |
| POST | /api/auth/login | No | - | Login |
| GET | /api/auth/me | Yes | - | User profile |
| GET | /api/projects | Yes | Member | List user projects |
| POST | /api/projects | Yes | - | Create project |
| GET | /api/projects/:id | Yes | Member | Project details |
| PUT | /api/projects/:id | Yes | Admin | Update project |
| DELETE | /api/projects/:id | Yes | Admin | Delete project |
| POST | /api/projects/:id/members | Yes | Admin | Add member |
| DELETE | /api/projects/:id/members/:userId | Yes | Admin | Remove member |
| GET | /api/projects/:id/tasks | Yes | Member | List tasks |
| POST | /api/projects/:id/tasks | Yes | Member | Create task |
| GET | /api/projects/:id/tasks/:taskId | Yes | Member | Task details |
| PUT | /api/projects/:id/tasks/:taskId | Yes | Creator/Admin | Update task |
| DELETE | /api/projects/:id/tasks/:taskId | Yes | Creator/Admin | Delete task |
| PATCH | /api/projects/:id/tasks/:taskId/status | Yes | Assignee/Admin | Update status |
| GET | /api/dashboard | Yes | - | Dashboard stats |

## Deployment Steps
### Railway (Backend + MySQL)
1. Push to GitHub
2. Railway project → Add MySQL → copy DATABASE_URL to service vars
3. New Service → GitHub repo
4. Env: DATABASE_URL, JWT_SECRET, NODE_ENV=production, CLIENT_URL=https://your-vercel.app
5. Deploy

### Vercel (Frontend)
1. Import GitHub repo
2. Root dir: `team-task-manager/client`
3. Env: VITE_API_BASE_URL=https://your-railway.up.railway.app/api
4. Deploy

## Role Permissions
| Action | Admin | Member |
|--------|-------|--------|
| View projects | Owner/member | Owner/member |
| Create project | Yes | Yes |
| Delete project | Yes (own) | No |
| Add/remove members | Yes | No |
| Create task | Yes | Yes |
| Update any task | Yes | Creator/assignee only |
| Delete task | Yes | Creator only |
| Change status | Yes | Assignee only |
| View dashboard | Yes | Yes |

## Database Schema
**User** → owns **Project** → has-many **ProjectMember** (role ADMIN/MEMBER, unique user/project) ↔ **Task** (creator/assignee)
