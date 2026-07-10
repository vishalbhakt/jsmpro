# JSM Shiksha Academy ERP — Complete System Documentation & README

JSM Shiksha Academy ERP is a production-grade, enterprise-ready School Management System designed to connect and streamline administrative, pedagogical, and student activities. The platform integrates a Next.js 16 frontend with a Django 6 / Django REST Framework (DRF) backend, enforcing role-based security policies and supplying dynamic modules for all academic, financial, and CMS resources.

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Features Overview](#-features-overview)
3. [Technology Stack](#-technology-stack)
4. [Project Architecture](#-project-architecture)
5. [Folder Structure](#-folder-structure)
6. [Installation & Local Setup Guide](#-installation--local-setup-guide)
7. [Environment Variables Configuration](#-environment-variables-configuration)
8. [Database Setup & Migrations](#-database-setup--migrations)
9. [Development Workflow & Running Servers](#-development-workflow--running-servers)
10. [Production Deployment Guide](#-production-deployment-guide)
11. [Authentication & Authorization Flow](#-authentication--authorization-flow)
12. [API Integration & Media Handling](#-api-integration--media-handling)
13. [Detailed Portal Workflows](#-detailed-portal-workflows)
    - [Student Portal](#-student-portal)
    - [Teacher Portal](#-teacher-portal)
    - [Admin Portal](#-admin-portal)
14. [Troubleshooting & Common Errors](#-troubleshooting--common-errors)
15. [Testing Instructions](#-testing-instructions)
16. [GitHub Contribution Guide](#-github-contribution-guide)
17. [Production Checklist](#-production-checklist)

---

## 🏫 Project Overview
JSM Shiksha Academy ERP is a multi-tenant education management software. It orchestrates user registration, class assignments, course syllabus tracking, assignment submissions, digital notes, video lectures, student grading systems, tuition ledgers, notifications, activity logs, and a public website CMS.

The system is configured with three distinct access roles:
1. **Student**: Access to grades, video lectures, learning content, fee statements, and attendance records.
2. **Teacher**: Manage class modules, create course content, issue assignments, score exams, and track attendance.
3. **Administrator**: Global system configuration, registry approval, financial plan setup, system logs, and CMS content.

---

## 🚀 Features Overview
* **Role-Based Routing Guards**: Front-end layouts and dashboard routing are secured dynamically based on user JWT roles.
* **Bulk Attendance Processing**: Teachers mark registers for classes in a single request, updating academic logs in database bulk transactions.
* **File & Resource Management**: Secure PDFs and media uploads for classroom assignments and study sheets.
- **Academic Ledgering**: Track tuition, online transactions, payment statuses, and fee plan configurations.
- **Inquiry & Lead Capturing**: Public admissions pipeline connected straight to DB inquiry logs.

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | Next.js (App Router) | 16.2.7 | SSR and dynamic client rendering |
| **JS Runtime** | React | 19.0.0 | User interface components |
| **State Manager** | Zustand | 5.0.2 | Global auth state management & token storage |
| **Backend Engine** | Django | 6.0.5 | Core framework, ORM, and admin panel |
| **Web API Toolkit** | Django REST Framework | 3.17.1 | API routing, serializers, and controller logic |
| **Authentication** | Django SimpleJWT | 5.5.1 | JWT generation, token rotation, and refresh |
| **Database** | SQLite (Dev) / PostgreSQL (Prod)| 3.x / 14+ | Relational data persistence |
| **Asset Service** | WhiteNoise | 6.12.0 | Serving compressed static assets directly |
| **Image Toolkit** | Pillow | 12.2.0 | Profile photo and gallery image handling |

---

## 🗺️ Project Architecture
The system employs a client-server architecture separating UI views from database transactions:

```mermaid
graph TD
    Client[Next.js 16 Frontend Client] -->|HTTP REST Requests + JWT| Gateway[Django DRF API Gateway]
    Gateway -->|Authentication / CORS| Security[SimpleJWT / CORS Middleware]
    Security -->|Routing & Serializers| Controllers[Django Views]
    Controllers -->|ORM Queries| DB[(SQLite / PostgreSQL)]
```

1. **Client Layer**: A Single Page Application (SPA) utilizing Next.js app routing. Zustand handles frontend persistence of credentials.
2. **API Layer**: Requests are intercepted and verified against JWT tokens before execution.
3. **Data Layer**: Relational schemas linked with foreign keys representing academic hierarchies.

---

## 📂 Folder Structure

```
jsm_production/
├── backend/                   # Python Django Project
│   ├── academics/             # Class, Subject, Assessment, Result models & views
│   ├── attendance/            # AttendanceSession & Record models & bulk logic
│   ├── cms/                   # Pages, Courses, Facilities, Gallery, Contact, Inquiries
│   ├── communication/         # Activity logs, Announcements, Notifications
│   ├── config/                # Main settings.py, urls.py, wsgi.py
│   ├── finance/               # FeePlans and Payment models
│   ├── learning/              # Assignments, Quizzes, VideoLectures, Notes
│   ├── users/                 # Custom User models, profiles, login backends
│   ├── requirements.txt       # Python package list
│   └── manage.py              # CLI utility for backend management
└── frontend/                  # Next.js Frontend
    ├── public/                # Static assets
    ├── src/
    │   ├── app/               # Next.js App Router Page components
    │   ├── components/        # Shared components (Sidebar, Navbar, Cards)
    │   ├── lib/               # API layer config (axios client)
    │   ├── store/             # Global stores (Zustand useAuthStore)
    │   └── styles/            # Global styling stylesheets
    ├── package.json           # Node.js dependencies
    └── tailwind.config.js     # Tailwind framework configurations
```

---

## ⚙️ Environment Variables Configuration

### Backend Environment (`backend/.env`)
Create a file named `.env` in the `backend/` directory:
```ini
DJANGO_SECRET_KEY=your-django-production-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000

# PostgreSQL (Leave commented to default to local db.sqlite3)
# DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME

JWT_ACCESS_MINUTES=60
JWT_REFRESH_DAYS=7
DJANGO_SECURE_SSL_REDIRECT=False
DJANGO_SESSION_COOKIE_SECURE=False
DJANGO_CSRF_COOKIE_SECURE=False
```

### Frontend Environment (`frontend/.env.local`)
Create a file named `.env.local` in the `frontend/` directory:
```ini
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 🚀 Installation & Local Setup Guide

### Backend Setup
1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```
2. **Install Python packages**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Run database migrations**:
   ```bash
   python manage.py migrate
   ```
4. **Seed local database with demo profiles**:
   ```bash
   python manage.py seed_demo
   ```
5. **Start the local server**:
   ```bash
   python manage.py runserver 8000
   ```

### Frontend Setup
1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```
2. **Install Node modules**:
   ```bash
   npm install
   ```
3. **Start Next.js development server**:
   ```bash
   npm run dev
   ```
   *Frontend is now listening on [http://localhost:3000](http://localhost:3000).*

### Create Superuser
To create an administrative dashboard user manually:
```bash
cd backend
python manage.py createsuperuser
```
Follow the CLI instructions to define username, email, and password.

---

## 📡 Production Deployment Guide

### Vercel Deployment (Frontend)
1. Link your GitHub repository to Vercel.
2. Select `/frontend` as the root directory.
3. Configure the `Build Command` as `npm run build` and `Output Directory` as `.next`.
4. Add the environment variable `NEXT_PUBLIC_API_URL` pointing to your production Django server (e.g. `https://api.jsmshiksha.com/api`).
5. Deploy.

### PythonAnywhere Deployment (Backend)
1. Clone the project onto PythonAnywhere.
2. Set up a Virtual Environment and install packages:
   ```bash
   mkvirtualenv --python=/usr/bin/python3.10 jsm-env
   pip install -r requirements.txt
   ```
3. Configure WSGI configuration file in Web tab to load Django:
   ```python
   import os
   import sys
   path = '/home/yourusername/jsm_production/backend'
   if path not in sys.path:
       sys.path.append(path)
   os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
   from django.core.wsgi import get_wsgi_application
   application = get_wsgi_application()
   ```
4. Set environmental variables via the PythonAnywhere console or WSGI settings file. Set `DJANGO_DEBUG=False`.
5. Point static files pathway in Web tab to `/home/yourusername/jsm_production/backend/staticfiles/`.

---

## 🔐 Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant User as Frontend Client
    participant API as Django API
    participant DB as SQLite/Postgres

    User->>API: POST /api/users/token/ (username, password)
    API->>DB: Fetch user record & check password
    DB-->>API: Active user matching query
    API-->>User: Return Access Token & Refresh Token
    Note over User: Access Token expires in 60 mins.<br/>Refresh Token rotates.
    User->>API: GET /api/academics/subjects/ [With Auth Header]
    API-->>User: Response with data payload
```

- **JWT Authentication Flow**: Access tokens are included as Bearer values. The client attempts to silently request a replacement token from `POST /api/users/token/refresh/` using a stored secure refresh token if an HTTP 401 response is returned by the API.

### 🛡️ Role-Based Access System (RBAC)
User access control is structured on role tags defined on the custom User model: `admin`, `teacher`, and `student`.
1. **Model-Level Filters**: System queries utilize the active session token role to segment records. For example, students can query learning items only within their enrolled classroom.
2. **View-Level Handlers**: Custom permission rules in [permissions.py](file:///E:/deploy/jsm_production/backend/users/permissions.py) block incoming request types. For instance, `IsTeacherOrAdmin` allows write actions on lessons and assignments, while `IsStudent` raises HTTP 403 Forbidden checks for these methods.

### 🔌 API Integration Overview
Communication is driven by the REST standard.
- **Base Endpoint**: Root endpoints are configured in `config/urls.py` routing requests to specific app scopes.
- **Zustand & Axios Client**: The client wrapper handles headers, content serialization, and payload conversion dynamically.

### 📁 Media & File Upload Handling
Academic study notes and assignment task sheet files utilize Django’s filesystem upload interface:
1. **Model Integration**: File locations are handled by `FileField` paths pointing to `media/` repositories.
2. **Processing Pipeline**: Standard payloads use the multipart/form-data schema to upload media. Django renames files uniquely, checks storage limits, and processes image adjustments (using Pillow).
3. **Static Distribution**: In local execution mode, static/media files are served locally by the development server. In production, WhiteNoise compresses and serves cached resources.

### 🔄 Project & Development Workflow
The system utilizes a structured iteration sequence:
1. **Local Modification**: Code edits are made inside local directory scopes.
2. **Database Verification**: Changing schemas requires creating migration files (`makemigrations`) and executing them (`migrate`).
3. **API Contracts**: Views and Serializers must align with interface expectations on the Next.js side.
4. **Build Check**: Pre-deployment validation includes frontend linting (`npm run lint`) and production builds (`npm run build`).

---

## 📦 Detailed Portal Workflows

---

### 🎓 Student Portal

#### 1. Overview Dashboard
* **Purpose**: General hub for students to check attendance rates, class announcements, and overall performance.
* **User Actions**: View stats widgets, toggle dashboard cards, inspect global announcements.
* **Backend Workflow**: Reads dashboard aggregates, queries global announcements, and logs system action.
* **API Interaction**: `GET /api/users/dashboard/student/`
* **CRUD Permissions**: Read-only access.

#### 2. Notes Section
* **Purpose**: Access study guides, notes, and worksheets uploaded by subject teachers.
* **User Actions**: Browse subject list, view study material descriptions, download PDFs.
* **Backend Workflow**: Query `Note` model filtered by the student's current classroom.
* **API Interaction**: `GET /api/learning/notes/`
* **CRUD Permissions**: Read-only.

#### 3. Assignments Workspace
* **Purpose**: View assignments, check submission deadlines, and submit completed tasks.
* **User Actions**: Click assignment link, inspect instructions, select upload file, submit homework.
* **Backend Workflow**: Retrieves `Assignment` entries for the classroom. Creating submission inserts an `AssignmentSubmission` record linked to the student.
* **API Interaction**: `GET /api/learning/assignments/`, `POST /api/learning/submissions/`
* **CRUD Permissions**: Read assignments; Create and Read submissions.

#### 4. Video Lectures Hub
* **Purpose**: Watch educational content and recorded lecture resources.
* **User Actions**: Browse lecture list, play YouTube or mp4 video streams.
* **Backend Workflow**: Fetches `VideoLecture` entries matching the student's enrolled `ClassRoom`.
* **API Interaction**: `GET /api/learning/videos/`
* **CRUD Permissions**: Read-only.

#### 5. Attendance Summary
* **Purpose**: Personal calendar showing past attendance markings.
* **User Actions**: Toggle calendars, monitor present/absent trends.
* **Backend Workflow**: Queries `AttendanceRecord` matching student profile.
* **API Interaction**: `GET /api/attendance/records/my-attendance/`
* **CRUD Permissions**: Read-only.

#### 6. Result Portal
* **Purpose**: Check scores and marks from assessments.
* **User Actions**: View marks by subject, check class grades and remarks.
* **Backend Workflow**: Query `Result` objects matching student identifier, prefetching corresponding `Assessment` details.
* **API Interaction**: `GET /api/academics/results/`
* **CRUD Permissions**: Read-only.

#### 7. Payments & Billing Ledger
* **Purpose**: Keep track of tuition fees, term payments, and transaction history.
* **User Actions**: View invoice list, download payment receipts, click online pay options.
* **Backend Workflow**: Queries `Payment` tables filtered by student, linking back to assigned `FeePlan`.
* **API Interaction**: `GET /api/finance/payments/`
* **CRUD Permissions**: Read-only.

#### 8. Notifications Tray
* **Purpose**: Instant updates on classroom notifications and announcements.
* **User Actions**: View listing, mark alerts as read.
* **Backend Workflow**: Updates `is_read` column on `Notification` entries.
* **API Interaction**: `GET /api/communication/notifications/`, `PATCH /api/communication/notifications/{id}/`
* **CRUD Permissions**: Read and Update notifications.

#### 9. My Profile
* **Purpose**: Manage personal student information and contact details.
* **User Actions**: Review name, roll number, classroom, and contact parameters.
* **Backend Workflow**: Queries database `StudentProfile` and associated `User` model.
* **API Interaction**: `GET /api/users/profile/`
* **CRUD Permissions**: Read profile info.

---

### 🍎 Teacher Portal

#### 1. Overview Dashboard
* **Purpose**: Hub providing teachers with tools to check assigned courses, student counts, and schedule details.
* **User Actions**: Inspect active courses list, click quick-action shortcuts for classes.
* **Backend Workflow**: Aggregates classrooms associated with the teacher's profile.
* **API Interaction**: `GET /api/users/dashboard/teacher/`
* **CRUD Permissions**: Read-only access.

#### 2. Students Registry
* **Purpose**: List students enrolled in the teacher's classroom sections.
* **User Actions**: Look up student database, view academic records.
* **Backend Workflow**: Fetches `StudentProfile` filtered by `classroom` where current teacher is assigned.
* **API Interaction**: `GET /api/users/students/`
* **CRUD Permissions**: Read-only.

#### 3. Attendance Manager
* **Purpose**: Run and submit classroom attendance sheets.
* **User Actions**: Initiate attendance session, check present/absent statuses, submit register.
* **Backend Workflow**: Create `AttendanceSession` then issue bulk database writes to write matching `AttendanceRecord` models.
* **API Interaction**: `POST /api/attendance/sessions/`, `POST /api/attendance/records/bulk_mark/`
* **CRUD Permissions**: Create, Read, and Update attendance records.

#### 4. Assignment Manager
* **Purpose**: Create assignments, grade student submissions, and write feedback.
* **User Actions**: Publish worksheets, download submissions, enter grades/marks.
* **Backend Workflow**: Creates `Assignment` objects. Submissions endpoint updates `marks_obtained` and comments.
* **API Interaction**: `POST /api/learning/assignments/`, `PATCH /api/learning/submissions/{id}/`
* **CRUD Permissions**: Create, Read, Update, Delete assignments and submissions.

#### 5. Study Notes Manager
* **Purpose**: Upload PDFs, notes, and study sheets.
* **User Actions**: Fill note title, choose file attachments, assign target class/subject, upload.
* **Backend Workflow**: Inserts `Note` file references using Django core media directory settings.
* **API Interaction**: `POST /api/learning/notes/`
* **CRUD Permissions**: Create, Read, Update, Delete study notes.

#### 6. Videos Hub Manager
* **Purpose**: Share external links and local videos for lecture streams.
* **User Actions**: Enter lecture info, paste video source URLs, select classroom.
* **Backend Workflow**: Creates `VideoLecture` entries.
* **API Interaction**: `POST /api/learning/videos/`
* **CRUD Permissions**: Create, Read, Update, Delete video lecture objects.

#### 7. Results Dashboard
* **Purpose**: Set exam tests, compile grade values, and publish results.
* **User Actions**: Set assessment limits, enter student marks, publish results.
* **Backend Workflow**: Writes to `Assessment` table and issues batch writes to the `Result` database.
* **API Interaction**: `POST /api/academics/assessments/`, `POST /api/academics/results/`
* **CRUD Permissions**: Create, Read, Update, Delete assessments and results.

#### 8. Announcements
* **Purpose**: Issue important alerts and messages to class groups.
* **User Actions**: Create messages, toggle pinning options, select target audiences.
* **Backend Workflow**: Creates `Announcement` object.
* **API Interaction**: `POST /api/communication/announcements/`
* **CRUD Permissions**: Create, Read, Update, Delete announcements.

#### 9. Notifications
* **Purpose**: Receive relevant warnings, system notifications, or alerts.
* **User Actions**: View notification listings, mark individual items as read.
* **Backend Workflow**: Queries and flags `Notification` models directed to the teacher user.
* **API Interaction**: `GET /api/communication/notifications/`, `PATCH /api/communication/notifications/{id}/`
* **CRUD Permissions**: Read and Update permissions.

#### 10. My Profile
* **Purpose**: Access and inspect employee details, qualifications, and class designations.
* **User Actions**: View qualifications, check start/join dates.
* **Backend Workflow**: Fetches related `TeacherProfile` record linked with user account.
* **API Interaction**: `GET /api/users/profile/`
* **CRUD Permissions**: Read-only.

#### 🔬 Subject Assignment Workflow
Teachers do not assign subjects to themselves. 
1. **Administrative Setup**: Administrators create `Subject` records, linking each to a `ClassRoom` and a specific `Teacher` profile via the Admin dashboard.
2. **Access Control**: Once mapped, the backend unlocks that subject's scope for the teacher. When a teacher attempts to mark attendance or create tests, the API checks that the teacher's profile is the designated operator on the respective `Subject` model.

---

### 👑 Admin Portal

The administrative portal serves as the root controller for the school infrastructure:

| Dashboard Submenu | Purpose | CRUD Permissions | Key API Endpoint |
| :--- | :--- | :--- | :--- |
| **Dashboard** | Visual display of student counts, ledger status, system logs | Read-only | `GET /api/users/dashboard/admin/` |
| **Users** | System registry account control, role assignments | Read, Update | `GET /api/users/accounts/` |
| **Students** | Complete database profile of all registered students | Create, Read, Update, Delete | `GET /api/users/students/` |
| **Teachers** | Qualifications, designations, and department logs | Create, Read, Update, Delete | `GET /api/users/teachers/` |
| **Classes** | ClassRoom registry configurations (sections, limits) | Create, Read, Update, Delete | `GET /api/academics/classrooms/` |
| **Subjects** | Register class subjects and connect teaching profiles | Create, Read, Update, Delete | `GET /api/academics/subjects/` |
| **Assessments** | Standardize exam assessments and grading structures | Create, Read, Update, Delete | `GET /api/academics/assessments/` |
| **Attendance Sessions**| View lists of classrooms and attendance sessions | Create, Read, Update, Delete | `GET /api/attendance/sessions/` |
| **Attendance Records** | Modify individual student attendance markers | Create, Read, Update, Delete | `GET /api/attendance/records/` |
| **Assignments** | Manage all posted assignments across classrooms | Create, Read, Update, Delete | `GET /api/learning/assignments/` |
| **Submissions** | Review student submission histories globally | Read, Update | `GET /api/learning/submissions/` |
| **Notes** | Access all distributed PDF study guides | Create, Read, Update, Delete | `GET /api/learning/notes/` |
| **Videos** | Retrieve full list of educational video items | Create, Read, Update, Delete | `GET /api/learning/videos/` |
| **Quizzes** | Oversee formative quiz configurations | Create, Read, Update, Delete | `GET /api/learning/quizzes/` |
| **Results** | Compile, verify, and modify student academic marks | Create, Read, Update, Delete | `GET /api/academics/results/` |
| **Fee Plans** | Create tuition fees and select target classroom groups | Create, Read, Update, Delete | `GET /api/finance/fee-plans/` |
| **Payments** | Process transactions, update invoice files | Create, Read, Update, Delete | `GET /api/finance/payments/` |
| **Announcements** | Issue public web notices or internal notices | Create, Read, Update, Delete | `GET /api/communication/announcements/` |
| **Notifications** | Direct notifications to specific user accounts | Create, Read, Update, Delete | `GET /api/communication/notifications/` |
| **Activity Logs** | Trace user updates, login patterns, DB updates | Read-only | `GET /api/communication/logs/` |
| **Pages** | Edit custom informational site content (About us, policy) | Create, Read, Update, Delete | `GET /api/cms/pages/` |
| **Courses** | List study course pathways on main public site | Create, Read, Update, Delete | `GET /api/cms/courses/` |
| **Facilities** | Showcase laboratory, transport, library resources | Create, Read, Update, Delete | `GET /api/cms/facilities/` |
| **Gallery** | Upload project images and categorize active events | Create, Read, Update, Delete | `GET /api/cms/gallery/` |
| **Contact Messages** | Retrieve messages sent through portal contact sheets | Read, Delete | `GET /api/cms/contact-messages/` |
| **Inquiries** | Manage admission requests and register leads | Create, Read, Update, Delete | `GET /api/cms/inquiries/` |
| **Reports** | Download system spreadsheets and billing charts | Read-only | `GET /api/users/dashboard/admin/reports/` |

#### ⚙️ Admin Portal Specifications
- **Purpose**: To coordinate infrastructure settings, approve incoming accounts, monitor transactions, oversee website assets, and check security logs.
- **User Actions**: Toggle authorization statuses on User profiles, add/remove classes or subjects, update public web pages, configure fee structures, record manual payments, read incoming candidate inquiries, and view system activity tracking logs.
- **Backend Workflow**: Directly alters DB objects via Django ORM. Write actions in the Admin dashboard bypass subject assignment checks but validate relational integrity (e.g. preventing the delete of a class if active enrollments remain).
- **API Interaction**: Communicates via standard DRF viewsets under the `/api/` path.
- **CRUD Permissions**: Holds unrestricted **Create, Read, Update, and Delete (CRUD)** permissions across all models.
- **System Administration Responsibilities**:
  1. Managing student and teacher credential cycles.
  2. Allocating subjects to teachers in ClassRoom records.
  3. Configuring fee templates and compiling academic analytics report cards.
  4. Monitoring security logs (`ActivityLog`) to preserve repository compliance.

---

## 🛠️ Troubleshooting & Common Errors

### 1. Database Lock Errors (`database is locked`)
- **Cause**: Multiple write transactions running concurrently on SQLite.
- **Solution**: Restart backend server process or migrate production deployment to a PostgreSQL service database instance.

### 2. CORS Errors (`Origin http://localhost:3000 is not allowed`)
- **Cause**: Missing origins in Django configuration setup.
- **Solution**: Ensure your frontend domain is added to `CORS_ALLOWED_ORIGINS` inside `.env`.

### 3. JWT Token Verification Failures
- **Cause**: Discrepancy between system clocks or expired tokens.
- **Solution**: The frontend automatically issues a refresh call. If issues persist, check system clock times.

---

## 🧪 Testing Instructions

Run the Django backend testing modules:
```bash
cd backend
python manage.py test
```

For frontend linting verification tests:
```bash
cd frontend
npm run lint
```

---

## 🤝 GitHub Contribution Guide
1. Create a descriptive feature branch from main:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Write clean code conforming to project style rules (PEP 8 for Python; Prettier/ESLint for TypeScript).
3. Commit with concise message prefixes (e.g. `feat: add assignment rubric backend schema`).
4. Push and create a Pull Request detailing the changes.

---

## ✨ Recent Platform Enhancements
The system has recently been updated with the following portal improvements and bug fixes:
* **Admin Classroom Management CRUD**: Fully integrated classroom creation (with modal), updating, and deleting directly in the Admin Portal under `Classes` section.
* **Announcements Fixes**: Resolved `TypeError` in the announcements admin workflow and verified dynamic real data loading on the portal.
* **Unified Status Indicators**: Standardized visual filter icons for status filters to `🚦` (traffic light status) across all admin modules (Subjects, Courses, Inquiries, Contact Messages, Payments, Fee Plans) for clean and professional consistency.
* **Subjects Management Improvements**: Verified and updated the subject registry code checking and dashboard components.

---

## 📋 Production Checklist
- [ ] Set `DJANGO_DEBUG=False` in production `.env`.
- [ ] Generate a secure unique string for `DJANGO_SECRET_KEY`.
- [ ] Configure PostgreSQL database engine and set `DATABASE_URL`.
- [ ] Ensure `CORS_ALLOWED_ORIGINS` is configured with production frontend domains.
- [ ] Set `DJANGO_SECURE_SSL_REDIRECT=True` and configure production SSL certs.
- [ ] Execute `python manage.py collectstatic --noinput` to prepare WhiteNoise static assets.
