# Virtual Labs Platform

A comprehensive Virtual Labs portal featuring interactive simulations, role-based access control, analytics, and content management.

## Prerequisites

If you plan to run this locally without Docker, you will need:

- **Node.js** (v18 or higher)
- **PostgreSQL** (running locally or a cloud instance like Neon)
- **Git**

Alternatively, you can run the entire stack using **Docker** and **Docker Compose**.

---

## Option 1: Local Development Setup (Manual)

### 1. Database & Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd vl-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and set your `DATABASE_URL` to point to your PostgreSQL database.
4. Push the database schema:
   ```bash
   npx prisma db push
   ```
5. Seed the database (IMPORTANT: This populates the roles, default users, and experiment configurations):
   ```bash
   npm run db:seed
   ```
6. Start the backend server:
   ```bash
   npm run dev
   ```
   _The backend will now be running on `http://localhost:5000`._

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd vl-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   _The frontend will now be running on `http://localhost:5173`._

---

## Docker Setup (Production/Quick Start)

The easiest way to get the platform running with zero configuration is using Docker. This will automatically spin up PostgreSQL, the Node.js backend, and the React frontend.

1. In the root of the project, configure your environment variables:

   ```bash
   cp .env.example .env
   ```

   _(Optional)_ Edit the `.env` file to customize your `JWT_SECRET` or `FRONTEND_URL`.

2. Build and start the containers in the background:

   ```bash
   docker-compose up -d --build
   ```

   (The database migrations and seed script will automatically run when the container starts)

3. Access the platform:
   Open your browser and navigate to `http://localhost`

---

## Default Credentials

After running `npm run db:seed`, the following default accounts are available:

| Role             | Email                    | Password         | Dashboard Access                                                                 |
| ---------------- | ------------------------ | ---------------- | -------------------------------------------------------------------------------- |
| **Super Admin**  | `admin@virtuallabs.in`   | `VLAdmin@2024`   | User Management, Institutions, Workshops, Lab Management, Contact Messages, Usage Analytics, Manage Pages |
| **VL Manager**   | `manager@virtuallabs.in` | `VLManager@2024` | User Management, Institutions, Workshops, Lab Management, Contact Messages, Usage Analytics, Learning Workspace |
| **Nodal Centre** | `nodal@amrita.edu`       | `VLNodal@2024`   | Teachers, Students, Learning Workspace, Usage Analytics, Academic Reports |
| **Teacher**      | `teacher@virtuallabs.in` | `VLTeacher@2024` | My Students, Assignments, Learning Workspace, Usage Analytics, Academic Reports |
| **Student**      | `student@virtuallabs.in` | `VLStudent@2024` | Learning Workspace (labs, experiments, quizzes)                                  |

_Note: It is highly recommended to change these passwords after your first login._

### Additional Test Students

The seed script also creates extra student accounts for testing analytics and reports:

| Name           | Email                    | Password         |
| -------------- | ------------------------ | ---------------- |
| Alice Johnson  | `alice@virtuallabs.in`   | `VLStudent@2024` |
| Bob Roberts    | `bob@virtuallabs.in`     | `VLStudent@2024` |
| Charlie Brown  | `charlie@virtuallabs.in` | `VLStudent@2024` |

---

## Role-Based Access Control

Each role has restricted sidebar navigation and route protection. Users attempting to access unauthorized routes are automatically redirected to their own dashboard.

| Role            | Sidebar Sections                                                           |
| --------------- | -------------------------------------------------------------------------- |
| **admin**       | Overview, User Management, Institutions, Workshops, Lab Management, Contact Messages, Usage Analytics, Manage Pages |
| **vl_manager**  | Overview, User Management, Institutions, Workshops, Lab Management, Learning Workspace, Contact Messages, Usage Analytics |
| **content_admin** | Overview, Lab Management, Usage Analytics                                |
| **nodal_centre** | Overview, Teachers, Students, Learning Workspace, Usage Analytics, Academic Reports |
| **teacher**     | Overview, My Students, Assignments, Learning Workspace, Usage Analytics, Academic Reports |
| **student**     | Learning Workspace                                                         |

---

## Project Structure

- `vl-app/` - React frontend (Vite, TailwindCSS, Lucide Icons)
- `vl-backend/` - Express backend (Prisma, PostgreSQL, Multer for zip uploads)
- `vl-backend/uploads/` - Contains the extracted interactive HTML5 simulations and markdown documentation for the experiments.
