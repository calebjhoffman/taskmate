# ✅ TaskMate – Full Stack Task Management Platform

TaskMate is a modern, full-stack task management application built from the ground up using a production-ready JavaScript stack. It allows users to organize tasks, manage priorities, track progress, and stay productive through a clean, responsive interface backed by a secure REST API.

This project was built to demonstrate real-world full stack development skills including authentication, database design, API architecture, responsive UI development, and Dockerized deployment.

---

## 🚀 Features

- ✅ Secure JWT Authentication (Access + Refresh Tokens)
- 👤 User Accounts & Protected Routes
- 📋 Create, Edit, Delete, and Organize Tasks
- 🎯 Task Status & Priority Management
- 📅 Due Dates and Task Tracking
- 🔍 Fast Task Filtering and Search
- 📱 Fully Responsive Design
- 🌓 Dark / Light Theme Support
- ⚡ RESTful Express API
- 🗄️ PostgreSQL Database with Prisma ORM
- 🐳 Fully Dockerized Development Environment
- ☁️ Production-Ready Architecture

---

## 📸 Screenshots

> Add screenshots of:
>
> - Dashboard
> - Task List
> - Create/Edit Task
> - Mobile View
> - Dark Mode

---

# 🧱 Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React + Vite + Material UI v10 |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT Access Tokens + Refresh Cookies |
| State Management | React Hooks |
| Styling | Material UI |
| Development | Docker + Docker Compose |
| Version Control | Git & GitHub |

---

# 🏗️ Architecture

TaskMate follows a modern client/server architecture.

```
Client (React)
        │
 REST API (Express)
        │
     Prisma ORM
        │
   PostgreSQL Database
```

The frontend communicates exclusively through REST endpoints while authentication is handled using short-lived access tokens stored in memory and secure HttpOnly refresh cookies.

---

# 🐳 Docker Architecture

```
/client       → React + Vite
/server       → Express API
/db           → PostgreSQL
/pgadmin      → Database Administration
```

Everything runs through Docker Compose, providing a consistent development environment across machines.

---

# 🧪 Local Development

## Clone the repository

```bash
git clone https://github.com/yourusername/taskmate.git

cd taskmate
```

## Configure Environment Variables

### Server

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/taskmate

JWT_ACCESS_SECRET=your_access_secret

JWT_REFRESH_SECRET=your_refresh_secret

ACCESS_TOKEN_EXPIRES_IN=12h

REFRESH_TOKEN_EXPIRES_IN=7d

CLIENT_ORIGIN=http://localhost:5173
```

### Client

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Start the application

```bash
docker compose up --build
```

Application URLs

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:3000/api
```

pgAdmin

```
http://localhost:5050
```

---

# 🔒 Authentication

TaskMate uses an industry-standard authentication flow:

- JWT Access Tokens
- Secure HttpOnly Refresh Cookies
- Protected API Routes
- Persistent Login Sessions
- Automatic Token Refresh

This approach provides improved security while maintaining a seamless user experience.

---

# 💡 Engineering Decisions

Some architectural decisions made during development include:

- Docker-first development environment
- Prisma ORM for type-safe database access
- Modular Express API structure
- RESTful endpoint design
- Reusable React components
- Material UI design system
- Responsive layouts for desktop and mobile
- Separation of authentication and business logic

---

# 🙋 About the Developer

TaskMate was developed as part of my journey toward building production-quality SaaS applications. The project focuses on writing clean, maintainable code while following modern full stack development practices and real-world architecture patterns.

**Built by Caleb Hoffman**

Full Stack JavaScript Developer

Specializing in React, Node.js, Express, PostgreSQL, Prisma, Docker, and modern SaaS application development.

---

# 📄 License

MIT License

Feel free to fork, modify, and build upon this project.
