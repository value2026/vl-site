# Virtual Labs Platform

A comprehensive Virtual Labs portal featuring interactive simulations, role-based access control, analytics, and content management.

## Prerequisites

If you plan to run this locally without Docker, you will need:

- **Node.js** (v18 or higher)
- **PostgreSQL** (running locally or a cloud instance like Neon)
- **Git**

Alternatively, you can run the entire stack using **Docker** and **Docker Compose**.

---

## 🛠 Option 1: Local Development Setup (Manual)

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

## 🐳 Option 2: Docker Setup (Production/Quick Start)

The easiest way to get the platform running with zero configuration is using Docker. This will automatically spin up PostgreSQL, the Node.js backend, and the React frontend (served via Nginx).

1. In the root of the project, configure your environment variables:

   ```bash
   cp .env.example .env
   ```

   _(Optional)_ Edit the `.env` file to customize your `JWT_SECRET` or `FRONTEND_URL`.

2. Build and start the containers in the background:

   ```bash
   docker-compose up -d --build
   ```

3. **Important: Seed the Docker Database**
   Once the containers are running, you must seed the database inside the backend container to create the initial experiments and admin accounts:

   ```bash
   docker exec -it vl-backend npm run db:seed
   ```

4. Access the platform:
   Open your browser and navigate to `http://localhost`

---

## 🔑 Default Credentials

After running `npm run db:seed`, the following default accounts are available:

| Role             | Email                    | Password         |
| ---------------- | ------------------------ | ---------------- |
| **Super Admin**  | `admin@virtuallabs.in`   | `VLAdmin@2024`   |
| **VL Manager**   | `manager@virtuallabs.in` | `VLManager@2024` |
| **Nodal Centre** | `nodal@amrita.edu`       | `VLNodal@2024`   |
| **Teacher**      | `teacher@virtuallabs.in` | `VLTeacher@2024` |
| **Student**      | `student@virtuallabs.in` | `VLStudent@2024` |

_Note: It is highly recommended to change these passwords after your first login._

## 📂 Project Structure

- `vl-app/` - React frontend (Vite, TailwindCSS, Lucide Icons)
- `vl-backend/` - Express backend (Prisma, PostgreSQL, Multer for zip uploads)
- `vl-backend/uploads/` - Contains the extracted interactive HTML5 simulations and markdown documentation for the experiments.
