
# 🚀 Team Task Manager

> A production-ready team collaboration tool built with modern full-stack technologies.

A **full-stack SaaS application** for managing team projects and tasks with role-based permissions, analytics dashboard, and real-time overdue tracking.

---

## 🌐 Live Demo

- **Frontend (Vercel):**  
  https://team-task-manager-sigma-six.vercel.app  

- **Backend API (Railway):**  
  https://team-task-manager-production-2301.up.railway.app/api  

- **Health Check:**  
  https://team-task-manager-production-2301.up.railway.app/api/health  

---

## 🔐 Test Credentials

| Role | Email | Password |
|------|------|---------|
| Admin | admin@test.com | Admin@123 |
| Member | member1@test.com | Member@123 |

---

## ✨ Features

### 🔑 Authentication & Security
- JWT-based authentication
- Secure password hashing using bcrypt
- Role-based access control (ADMIN / MEMBER)

### 📁 Project Management
- Create and manage projects
- Add/remove team members
- Assign project roles (Admin / Member)

### ✅ Task Management
- Create, update, delete tasks
- Assign tasks to members
- Priority levels (LOW / MEDIUM / HIGH)
- Status tracking (TODO, IN_PROGRESS, DONE, OVERDUE)

### 📊 Dashboard
- Project & task statistics
- Tasks grouped by status
- Overdue task tracking
- Recent activity overview

### ⏱ Automation
- Cron job automatically marks overdue tasks

### 🎨 UI/UX
- Responsive design (Tailwind CSS)
- Modal-based interactions
- Clean dashboard layout

---

## 🧱 Tech Stack

| Layer | Technology | Purpose |
|------|------------|--------|
| Frontend | React + Vite + React Query + Tailwind | UI, state, API caching |
| Backend | Node.js + Express | REST API |
| Database | MySQL + Prisma ORM | Data persistence |
| Auth | JWT + bcrypt | Authentication |
| Validation | Zod | Request validation |
| Deployment | Railway + Vercel | Hosting |

---

## 🧑‍💻 Local Development

### 1. Clone repo
```bash
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager
````

### 2. Install dependencies

```bash
npm install
```

### 3. Setup backend

```bash
cd server
cp .env.example .env
```

Update `.env`:

```env
DATABASE_URL=your_mysql_url
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

### 4. Setup frontend

```bash
cd ../client
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### 5. Run database

```bash
cd ../server
npx prisma migrate dev
npm run seed
```

### 6. Start app

```bash
npm run dev
```

---

## 📡 API Reference

| Method | Endpoint                               | Auth | Role           | Description     |
| ------ | -------------------------------------- | ---- | -------------- | --------------- |
| POST   | /api/auth/signup                       | ❌    | -              | Register        |
| POST   | /api/auth/login                        | ❌    | -              | Login           |
| GET    | /api/auth/me                           | ✅    | -              | Current user    |
| GET    | /api/projects                          | ✅    | Member         | User projects   |
| POST   | /api/projects                          | ✅    | -              | Create project  |
| GET    | /api/projects/:id                      | ✅    | Member         | Project details |
| PUT    | /api/projects/:id                      | ✅    | Admin          | Update project  |
| DELETE | /api/projects/:id                      | ✅    | Admin          | Delete project  |
| POST   | /api/projects/:id/members              | ✅    | Admin          | Add member      |
| DELETE | /api/projects/:id/members/:userId      | ✅    | Admin          | Remove member   |
| GET    | /api/projects/:id/tasks                | ✅    | Member         | List tasks      |
| POST   | /api/projects/:id/tasks                | ✅    | Member         | Create task     |
| GET    | /api/projects/:id/tasks/:taskId        | ✅    | Member         | Task detail     |
| PUT    | /api/projects/:id/tasks/:taskId        | ✅    | Creator/Admin  | Update task     |
| DELETE | /api/projects/:id/tasks/:taskId        | ✅    | Creator/Admin  | Delete task     |
| PATCH  | /api/projects/:id/tasks/:taskId/status | ✅    | Assignee/Admin | Update status   |
| GET    | /api/dashboard                         | ✅    | -              | Dashboard data  |

---

## 🚀 Deployment

### Backend (Railway)

1. Push repo to GitHub
2. Create project in Railway
3. Add MySQL plugin
4. Set environment variables:

```env
DATABASE_URL=...
JWT_SECRET=...
CLIENT_URL=https://team-task-manager-sigma-six.vercel.app
NODE_ENV=production
```

### Frontend (Vercel)

1. Import repo in Vercel
2. Set root directory: `client`
3. Add env:

```env
VITE_API_BASE_URL=https://team-task-manager-production-2301.up.railway.app/api
```

4. Deploy

---

## 🔐 Role Permissions

| Action             | Admin | Member           |
| ------------------ | ----- | ---------------- |
| View projects      | ✅     | ✅                |
| Create project     | ✅     | ✅                |
| Delete project     | ✅     | ❌                |
| Add/remove members | ✅     | ❌                |
| Create task        | ✅     | ✅                |
| Update any task    | ✅     | Creator/Assignee |
| Delete task        | ✅     | Creator only     |
| Change status      | ✅     | Assignee only    |
| View dashboard     | ✅     | ✅                |

---

## 🗄 Database Schema

* **User**
* **Project**
* **ProjectMember**
* **Task**

Relationships:

```
User → Project (owner)
User ↔ Project (via ProjectMember)
Project → Task
Task → creator + assignee
```

---

## ⚠️ Known Issues / Improvements

* No real-time updates (WebSockets not implemented)
* Limited filtering/search in tasks
* No email notifications
* No file attachments

---

## 🚀 Future Enhancements

* Real-time updates (Socket.io)
* Task comments & activity log
* Notifications system
* Advanced filters & search
* Role-based UI controls

