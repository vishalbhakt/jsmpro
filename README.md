# JSM Shiksha Academy ERP — Complete System Documentation & README

JSM Shiksha Academy ERP is a production-grade, enterprise-ready School Management System designed to connect and streamline administrative, pedagogical, and student activities. The platform is built as a monolithic Django 6 web application, serving dynamically rendered HTML templates with custom interactive widgets, enforcing role-based security policies, and supplying dynamic modules for all academic, financial, and CMS resources.

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
12. [Media Handling & Upload Pipeline](#-media-handling--upload-pipeline)
13. [Detailed Portal Workflows](#-detailed-portal-workflows)
    - [Student Portal](#-student-portal)
    - [Teacher Portal](#-teacher-portal)
    - [Admin Portal](#-admin-portal)
14. [Troubleshooting & Common Errors](#-troubleshooting--common-errors)
15. [Testing Instructions](#-testing-instructions)
16. [GitHub Contribution Guide](#-github-contribution-guide)
17. [Production Checklist](#-production-checklist)
18. [Recent Platform Enhancements](#-recent-platform-enhancements)

---

## 🏫 Project Overview
JSM Shiksha Academy ERP is a multi-tenant education management software. It orchestrates user registration, class assignments, course syllabus tracking, assignment submissions, digital notes, video lectures, student grading systems, tuition ledgers, notifications, activity logs, and a public website CMS.

The system is configured with three distinct access roles:
1. **Student**: Access to grades, video lectures, learning content, fee statements, and attendance records.
2. **Teacher**: Manage class modules, create course content, issue assignments, score exams, and track attendance.
3. **Administrator**: Global system configuration, registry approval, financial plan setup, system logs, and CMS content.

---

## 🚀 Features Overview
*   **Role-Based Security Guards**: Core views and backend actions are secured dynamically based on Django login status and custom role-based view guards.
*   **Bulk Attendance Processing**: Teachers mark registers for classes in a single request, updating academic logs in database bulk transactions.
*   **File & Resource Management**: Secure PDFs and media uploads for classroom assignments and study sheets.
*   - **Academic Ledgering**: Track tuition, online transactions, payment statuses, and fee plan configurations.
*   - **Inquiry & Lead Capturing**: Public admissions pipeline connected straight to DB inquiry logs.

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Web Server Framework** | Django | 6.0.5 | Core MVC framework, ORM database interface, and routing |
| **API Toolkit (Optional)**| Django REST Framework | 3.17.1 | Optional REST endpoints for mobile app integrations |
| **API Authentication** | Django SimpleJWT | 5.5.1 | Optional JWT token generation and verification |
| **Database** | SQLite (Dev) / PostgreSQL (Prod)| 3.x / 14+ | Relational data persistence |
| **Production WSGI** | Gunicorn | 26.0.0 | High-performance production application server |
| **Asset Service** | WhiteNoise | 6.12.0 | Serving compressed static assets directly |
| **Image Toolkit** | Pillow | 12.2.0 | Profile photo and gallery image handling |
| **Frontend Styling** | Bootstrap | 5.x | Responsive layouts and premium dashboard styling |
| **Frontend Icons** | FontAwesome | 6.x | System icons and vector graphics |
| **Frontend Fonts** | Google Fonts (Outfit) | — | Typography layer for custom dashboard UI |

---

## 🗺️ Project Architecture
The system employs a monolithic Model-View-Template (MVT) architecture serving HTML views dynamically:

```mermaid
graph TD
    Client[Browser Client] -->|GET/POST Requests + Session Cookies| Middleware[Django Middleware & Auth Guards]
    Middleware -->|Routing & Authorization| Views[Django Views]
    Views -->|Querysets & ORM| DB[(SQLite / PostgreSQL)]
    Views -->|Data Payload Context| Templates[Django HTML Templates]
    Templates -->|Rendered HTML/CSS/JS| Client
```

1. **Client Layer**: Responsive client UI built using Bootstrap and custom premium CSS.
2. **Controller Layer**: Django views receive inputs, query data from the ORM, validate business logic, and direct templates.
3. **Data Layer**: Relational schemas linked with foreign keys representing academic hierarchies.

---

## 📂 Folder Structure

```
jsm_production/
├── backend/                   # Python Django Project (Core Application Root)
│   ├── academics/             # Class, Subject, Assessment, Result models & views
│   ├── attendance/            # AttendanceSession & Record models & bulk logic
│   ├── cms/                   # Pages, Courses, Facilities, Gallery, Contact, Inquiries
│   ├── communication/         # Activity logs, Announcements, Notifications
│   ├── config/                # Main settings.py, urls.py, wsgi.py
│   ├── dashboard/             # Main portal dashboard views, urls, and forms
│   ├── finance/               # FeePlans and Payment models
│   ├── learning/              # Assignments, Quizzes, VideoLectures, Notes
│   ├── templates/             # Server-Side HTML Templates
│   │   ├── accounts/          # Login, Register, Profile completion wizard
│   │   ├── admin/             # Administrator dashboard pages
│   │   ├── student/           # Student portal pages
│   │   ├── teacher/           # Teacher portal pages
│   │   └── home/              # Public CMS pages (Home, About, Contact, etc.)
│   ├── static/                # Static assets (CSS/JS/images)
│   ├── users/                 # Custom User models, profiles, login backends
│   ├── verification/          # ID card verification models and views
│   ├── requirements.txt       # Python package list
│   ├── manage.py              # CLI utility for backend management
│   └── db.sqlite3             # Local SQLite database (development)
└── README.md                  # Comprehensive Documentation File
```

---

## ⚙️ Environment Variables Configuration

Create a file named `.env` in the `backend/` directory:
```ini
DJANGO_SECRET_KEY=your-django-production-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL (Leave commented to default to local db.sqlite3)
# DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME

DJANGO_SECURE_SSL_REDIRECT=False
DJANGO_SESSION_COOKIE_SECURE=False
DJANGO_CSRF_COOKIE_SECURE=False
```

---

## 🚀 Installation & Local Setup Guide

1. **Clone/Navigate to the backend directory**:
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
   *The system is now listening on [http://127.0.0.1:8000](http://127.0.0.1:8000).*

### Create Superuser
To create an administrative dashboard user manually:
```bash
python manage.py createsuperuser
```
Follow the CLI instructions to define username, email, and password.

---

## 📡 Production Deployment Guide

### 1. General Linux Deployment (Gunicorn, Systemd & Nginx)

For standard production environments (e.g. AWS EC2, DigitalOcean Droplet, Linode running Ubuntu/Debian), follow this robust hosting recipe:

#### Step A: System Packages Setup
Install Nginx, supervisor, git, and required python dependencies:
```bash
sudo apt update
sudo apt install -y python3-pip python3-venv nginx git curl
```

#### Step B: Project Installation & Virtualenv
Clone the project to your chosen location (e.g. `/var/www/jsm_production`), set ownership, and initialize the virtual environment:
```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone https://github.com/vishalbhakt/jsmpro.git jsm_production
cd jsm_production/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### Step C: Environment Configuration
Create a `.env` file inside the `backend/` directory:
```env
DJANGO_DEBUG=False
DJANGO_SECRET_KEY="replace-this-with-a-secure-random-64-character-string"
ALLOWED_HOSTS="yourdomain.com,www.yourdomain.com,12.34.56.78"
# For SQLite:
DATABASE_URL="sqlite:///db.sqlite3"
# For PostgreSQL:
# DATABASE_URL="postgres://db_user:db_password@localhost:5432/db_name"
```

#### Step D: Static Assets & Database Migration
Collect static files for WhiteNoise/Nginx and run database migrations:
```bash
python manage.py collectstatic --noinput
python manage.py migrate
```

#### Step E: Configure Gunicorn with Systemd
Create a Systemd service file to manage the Gunicorn background processes:
```bash
sudo nano /etc/systemd/system/gunicorn.service
```
Paste the following configurations:
```ini
[Unit]
Description=Gunicorn daemon for JSM Shiksha Academy ERP
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/var/www/jsm_production/backend
ExecStart=/var/www/jsm_production/backend/venv/bin/gunicorn \
          --access-logfile - \
          --workers 3 \
          --bind unix:/run/gunicorn.sock \
          config.wsgi:application

[Install]
WantedBy=multi-user.target
```
Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl start gunicorn
```

#### Step F: Configure Nginx as Reverse Proxy
Create a virtual host configuration:
```bash
sudo nano /etc/nginx/sites-available/jsm_production
```
Paste the server configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    # Static files served directly by Nginx
    location /static/ {
        alias /var/www/jsm_production/backend/staticfiles/;
    }

    # Media files (uploads) served directly by Nginx
    location /media/ {
        alias /var/www/jsm_production/backend/media/;
    }

    # Proxy all dynamic requests to Gunicorn
    location / {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
    }
}
```
Link and activate the server block, then restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/jsm_production /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step G: SSL/HTTPS Installation
Install Let's Encrypt Certbot and activate SSL redirection:
```bash
sudo apt install snapd
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### 2. PythonAnywhere Deployment

For hosting on PythonAnywhere shared server architecture:

1. **Clone project**: In a Bash console, clone the project under `/home/yourusername/jsm_production`.
2. **Virtualenv Setup**:
   ```bash
   mkvirtualenv --python=/usr/bin/python3.10 jsm-env
   pip install -r requirements.txt
   ```
3. **WSGI Setup**: In the Web tab, edit the python WSGI script file:
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
4. **Environment settings**: Set environment variables (`DJANGO_DEBUG=False`, etc.) directly inside the WSGI script file using Python's `os.environ` or load them from a `.env` file using `python-dotenv`.
5. **Static files**: In the Web tab static files table, map the URL `/static/` to the directory `/home/yourusername/jsm_production/backend/staticfiles/`.
6. **Collect Static & Migrate**: Run `python manage.py collectstatic` and `python manage.py migrate` in your console.
7. **Reload Web App**: Hit the green reload button in the Web tab.

---

## 🔐 Authentication & Authorization Flow

- **Session-based Authentication**: User session state is tracked via secure HTTP session cookies. Standard views use the `@login_required` decorator.
- **Role-Based Access System (RBAC)**: User access control is structured on role tags defined on the custom User model: `admin`, `teacher`, and `student`.
  1. **Model-Level Filters**: System queries utilize the active session user profile to segment records. For example, students can view learning items only within their enrolled classroom.
  2. **View-Level Handlers**: Views intercept incoming requests to verify user role permission tags (e.g. `request.user.role == 'admin'`). The custom `ProfileOnboardingMiddleware` redirects incomplete profiles to the onboarding wizard.

---

## 📁 Media Handling & Upload Pipeline
Academic study notes and assignment task sheet files utilize Django’s filesystem upload interface:
1. **Model Integration**: File locations are handled by `FileField` paths pointing to `media/` repositories.
2. **Processing Pipeline**: Payloads use the standard `multipart/form-data` schema. Django handles file storage, checks limits, and processes image adjustments (using Pillow).
3. **Static Distribution**: In local execution mode, static/media files are served locally. In production, WhiteNoise compresses and serves cached static assets.

---

## 📦 Detailed Portal Workflows

---

### 🎓 Student Portal

#### 1. Overview Dashboard
*   **Purpose**: General hub for students to check attendance rates, class announcements, and overall performance.
*   **User Actions**: View stats widgets, toggle dashboard cards, inspect global announcements.
*   **Backend Workflow**: Reads dashboard aggregates, queries global announcements, and logs system action.
*   **CRUD Permissions**: Read-only access.

#### 2. Notes Section
*   **Purpose**: Access study guides, notes, and worksheets uploaded by subject teachers.
*   **User Actions**: Browse subject list, view study material descriptions, download PDFs.
*   **Backend Workflow**: Query `Note` model filtered by the student's current classroom.
*   **CRUD Permissions**: Read-only.

#### 3. Assignments Workspace
*   **Purpose**: View assignments, check submission deadlines, and submit completed tasks.
*   **User Actions**: Click assignment link, inspect instructions, select upload file, submit homework.
*   **Backend Workflow**: Retrieves `Assignment` entries for the classroom. Creating submission inserts an `AssignmentSubmission` record linked to the student.
*   **CRUD Permissions**: Read assignments; Create and Read submissions.

#### 4. Video Lectures Hub
*   **Purpose**: Watch educational content and recorded lecture resources.
*   **User Actions**: Browse lecture list, play YouTube or mp4 video streams.
*   **Backend Workflow**: Fetches `VideoLecture` entries matching the student's enrolled `ClassRoom`.
*   **CRUD Permissions**: Read-only.

#### 5. Attendance Summary
*   **Purpose**: Personal calendar showing past attendance markings.
*   **User Actions**: Toggle calendars, monitor present/absent trends.
*   **Backend Workflow**: Queries `AttendanceRecord` matching student profile.
*   **CRUD Permissions**: Read-only.

#### 6. Result Portal
*   **Purpose**: Check scores and marks from assessments.
*   **User Actions**: View marks by subject, check class grades and remarks.
*   **Backend Workflow**: Query `Result` objects matching student identifier, prefetching corresponding `Assessment` details.
*   **CRUD Permissions**: Read-only.

#### 7. Payments & Billing Ledger
*   **Purpose**: Keep track of tuition fees, term payments, and transaction history.
*   **User Actions**: View invoice list, download payment receipts, click online pay options.
*   **Backend Workflow**: Queries `Payment` tables filtered by student, linking back to assigned `FeePlan`.
*   **CRUD Permissions**: Read-only.

#### 8. Notifications Tray
*   **Purpose**: Instant updates on classroom notifications and announcements.
*   **User Actions**: View listing, mark alerts as read.
*   **Backend Workflow**: Updates `is_read` column on `Notification` entries.
*   **CRUD Permissions**: Read and Update notifications.

#### 9. My Profile
*   **Purpose**: Manage personal student information and contact details.
*   **User Actions**: Review name, roll number, classroom, and contact parameters.
*   **Backend Workflow**: Queries database `StudentProfile` and associated `User` model.
*   **CRUD Permissions**: Read profile info.

---

### 🍎 Teacher Portal

#### 1. Overview Dashboard
*   **Purpose**: Hub providing teachers with tools to check assigned courses, student counts, and schedule details.
*   **User Actions**: Inspect active courses list, click quick-action shortcuts for classes.
*   **Backend Workflow**: Aggregates classrooms associated with the teacher's profile.
*   **CRUD Permissions**: Read-only access.

#### 2. Students Registry
*   **Purpose**: List students enrolled in the teacher's classroom sections.
*   **User Actions**: Look up student database, view academic records.
*   **Backend Workflow**: Fetches `StudentProfile` filtered by `classroom` where current teacher is assigned.
*   **CRUD Permissions**: Read-only.

#### 3. Attendance Manager
*   **Purpose**: Run and submit classroom attendance sheets.
*   **User Actions**: Initiate attendance session, check present/absent statuses, submit register.
*   **Backend Workflow**: Create `AttendanceSession` then issue bulk database writes to write matching `AttendanceRecord` models.
*   **CRUD Permissions**: Create, Read, and Update attendance records.

#### 4. Assignment Manager
*   **Purpose**: Create assignments, grade student submissions, and write feedback.
*   **User Actions**: Publish worksheets, download submissions, enter grades/marks.
*   **Backend Workflow**: Creates `Assignment` objects. Submissions endpoint updates `marks_obtained` and comments.
*   **CRUD Permissions**: Create, Read, Update, Delete assignments and submissions.

#### 5. Study Notes Manager
*   **Purpose**: Upload PDFs, notes, and study sheets.
*   **User Actions**: Fill note title, choose file attachments, assign target class/subject, upload.
*   **Backend Workflow**: Inserts `Note` file references using Django core media directory settings.
*   **CRUD Permissions**: Create, Read, Update, Delete study notes.

#### 6. Videos Hub Manager
*   **Purpose**: Share external links and local videos for lecture streams.
*   **User Actions**: Enter lecture info, paste video source URLs, select classroom.
*   **Backend Workflow**: Creates `VideoLecture` entries.
*   **CRUD Permissions**: Create, Read, Update, Delete video lecture objects.

#### 7. Results Dashboard
*   **Purpose**: Set exam tests, compile grade values, and publish results.
*   **User Actions**: Set assessment limits, enter student marks, publish results.
*   **Backend Workflow**: Writes to `Assessment` table and issues batch writes to the `Result` database.
*   **CRUD Permissions**: Create, Read, Update, Delete assessments and results.

#### 8. Announcements
*   **Purpose**: Issue important alerts and messages to class groups.
*   **User Actions**: Create messages, toggle pinning options, select target audiences.
*   **Backend Workflow**: Creates `Announcement` object.
*   **CRUD Permissions**: Create, Read, Update, Delete announcements.

#### 9. Notifications
*   **Purpose**: Receive relevant warnings, system notifications, or alerts.
*   **User Actions**: View notification listings, mark individual items as read.
*   **Backend Workflow**: Queries and flags `Notification` models directed to the teacher user.
*   **CRUD Permissions**: Read and Update permissions.

#### 10. My Profile
*   **Purpose**: Access and inspect employee details, qualifications, and class designations.
*   **User Actions**: View qualifications, check start/join dates.
*   **Backend Workflow**: Fetches related `TeacherProfile` record linked with user account.
*   **CRUD Permissions**: Read-only.

---

### 👑 Admin Portal

The administrative portal serves as the root controller for the school infrastructure:

| Dashboard Submenu | Purpose | CRUD Permissions |
| :--- | :--- | :--- |
| **Dashboard** | Visual display of student counts, ledger status, system logs | Read-only |
| **Users** | System registry account control, role assignments | Create, Read, Update, Delete |
| **Students** | Complete database profile of all registered students | Create, Read, Update, Delete |
| **Teachers** | Qualifications, designations, and department logs | Create, Read, Update, Delete |
| **Classes** | ClassRoom registry configurations (sections, limits) | Create, Read, Update, Delete |
| **Subjects** | Register class subjects and connect teaching profiles | Create, Read, Update, Delete |
| **Assessments** | Standardize exam assessments and grading structures | Create, Read, Update, Delete |
| **Attendance Sessions**| View lists of classrooms and attendance sessions | Create, Read, Update, Delete |
| **Attendance Records** | Modify individual student attendance markers | Create, Read, Update, Delete |
| **Assignments** | Manage all posted assignments across classrooms | Create, Read, Update, Delete |
| **Submissions** | Review student submission histories globally | Read, Update |
| **Notes** | Access all distributed PDF study guides | Create, Read, Update, Delete |
| **Videos** | Retrieve full list of educational video items | Create, Read, Update, Delete |
| **Quizzes** | Oversee formative quiz configurations | Create, Read, Update, Delete |
| **Results** | Compile, verify, and modify student academic marks | Create, Read, Update, Delete |
| **Fee Plans** | Create tuition fees and select target classroom groups | Create, Read, Update, Delete |
| **Payments** | Process transactions, update invoice files | Create, Read, Update, Delete |
| **Announcements** | Issue internal notices to students/teachers | Create, Read, Update, Delete |
| **Notifications** | Direct notifications to specific user accounts | Create, Read, Update, Delete |
| **Pages** | Edit custom informational site content (About us, policy) | Create, Read, Update, Delete |
| **Courses** | List study course pathways on main public site | Create, Read, Update, Delete |
| **Facilities** | Showcase laboratory, transport, library resources | Create, Read, Update, Delete |
| **Gallery** | Upload project images and categorize active events | Create, Read, Update, Delete |
| **Contact Messages** | Retrieve messages sent through portal contact sheets | Read, Delete |
| **Inquiries** | Manage admission requests and register leads | Create, Read, Update, Delete |

---

## 🛠️ Troubleshooting & Common Errors

### 1. Database Lock Errors (`database is locked`)
- **Cause**: Multiple write transactions running concurrently on SQLite.
- **Solution**: Restart backend server process or migrate production deployment to a PostgreSQL service database instance.

### 2. Static File Resolution
- **Cause**: Missing stylesheet styles or script files in production environment.
- **Solution**: Execute `python manage.py collectstatic --noinput` to allow WhiteNoise to compress and serve static resources correctly.

---

## 🧪 Testing Instructions

Run the Django backend testing modules:
```bash
python manage.py test
```

---

## 🤝 GitHub Contribution Guide
1. Create a descriptive feature branch from main:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Write clean code conforming to PEP 8 styles.
3. Commit with concise message prefixes (e.g. `feat: add classroom modal`).
4. Push and create a Pull Request detailing the changes.

---

## 📋 Production Checklist
- [ ] Set `DJANGO_DEBUG=False` in production `.env`.
- [ ] Generate a secure unique string for `DJANGO_SECRET_KEY`.
- [ ] Configure PostgreSQL database engine and set `DATABASE_URL`.
- [ ] Set `DJANGO_SECURE_SSL_REDIRECT=True` and configure production SSL certs.
- [ ] Execute `python manage.py collectstatic --noinput` to prepare WhiteNoise static assets.

---

## ✨ Recent Platform Enhancements
* **Admin Classroom Management CRUD**: Fully integrated classroom creation (with modal), updating, and deleting directly in the Admin Portal under `Classes` section.
* **Announcements Fixes**: Resolved `TypeError` in the announcements admin workflow and verified dynamic real data loading on the portal.
* **Unified Status Indicators**: Standardized visual filter icons for status filters to `🚦` (traffic light status) across all admin modules (Subjects, Courses, Inquiries, Contact Messages, Payments, Fee Plans) for clean and professional consistency.
* **Subjects Management Improvements**: Verified and updated the subject registry code checking and dashboard components.
* **Classroom-Based Payments Configuration**: Added a bulk classroom configuration feature to allow linking and custom adjustments (discounts/scholarships) class-by-class directly from the payments ledger dashboard.
