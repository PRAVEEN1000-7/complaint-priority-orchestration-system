# Complaint Priority Orchestration System

An AI-powered complaint management system that automatically analyzes complaints, assigns priorities, and routes them to the appropriate domain heads for resolution.

## Features

- **Anonymous Complaint Submission** — Complaint creator identity is hidden throughout
- **Agentic AI Analysis** — 5 specialized AI agents powered by Gemini + LangGraph orchestrator
- **Automatic Priority Assignment** — P1 (Critical) to P4 (Low)
- **Domain-Based Routing** — Complaints automatically assigned to domain heads
- **Role-Based Access** — User, Domain Head, and Admin roles with JWT authentication
- **Real-Time Dashboard** — Statistics and recent complaints per role
- **Priority-Sorted Notifications** — Domain heads see P1 complaints first

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL |
| AI | Gemini API, LangGraph |
| Auth | JWT (python-jose), bcrypt |

## Quick Start

### 1. Prerequisites

- Python 3.10+
- PostgreSQL 14+

### 2. Database Setup

```bash
# Create the database
createdb complaint_priority_db

# Run the schema
psql -d complaint_priority_db -f database/schema.sql
```

### 3. Configuration

Edit `.env` with your settings:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/complaint_priority_db
SECRET_KEY=your-secret-key-change-in-production
GEMINI_API_KEY=your-gemini-api-key-here
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Run the Application

```bash
uvicorn backend.main:app --reload
```

The app will start at `http://localhost:8000`. 

- Frontend: `http://localhost:8000/static/login.html`
- API Docs: `http://localhost:8000/docs`

### 6. Default Admin Login

- **Email:** admin@system.com
- **Password:** admin123

## Project Structure

```
complaint-priority-system/
├── backend/
│   ├── agents/             # 5 AI agents
│   ├── orchestrator/       # LangGraph workflow
│   ├── routes/             # API endpoints
│   ├── models/             # SQLAlchemy models
│   ├── schemas/            # Pydantic validation
│   ├── services/           # Business logic
│   ├── auth/               # JWT & password hashing
│   ├── database/           # DB config & connection
│   ├── utils/              # Logger & helpers
│   └── main.py             # FastAPI entry point
├── frontend/
│   ├── css/style.css       # Design system
│   ├── js/                 # API client & utilities
│   └── *.html              # Pages
├── database/
│   └── schema.sql          # PostgreSQL schema
├── requirements.txt
└── .env
```

## API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/register | Register user | Public |
| POST | /api/login | Login | Public |
| GET | /api/domains | List domains | Auth |
| POST | /api/domains | Create domain | Admin |
| PUT | /api/domains/{id} | Update domain | Admin |
| DELETE | /api/domains/{id} | Delete domain | Admin |
| POST | /api/complaints | Submit complaint | Auth |
| GET | /api/complaints | List complaints | Auth |
| GET | /api/complaints/{id} | Complaint details | Auth |
| PUT | /api/complaints/{id} | Update complaint | DH/Admin |
| GET | /api/notifications | Get notifications | Auth |
| GET | /api/dashboard | Dashboard stats | Auth |
| GET | /api/domain-head/complaints | Assigned complaints | DH |
| PUT | /api/domain-head/status/{id} | Update status | DH |
| POST | /api/admin/domain-heads | Create domain head | Admin |
| GET | /api/admin/domain-heads | List domain heads | Admin |
| GET | /api/admin/users | List users | Admin |
| GET | /api/admin/statistics | Admin stats | Admin |

## AI Workflow

```
User submits complaint
        ↓
   Intake Agent      → Clean & normalize text
        ↓
  Category Agent     → Detect complaint domain
        ↓
  Priority Agent     → Assign P1-P4 priority
        ↓
 Assignment Agent    → Find domain head
        ↓
Explanation Agent    → Generate AI explanation
        ↓
   Save to DB + Create Notification
```
