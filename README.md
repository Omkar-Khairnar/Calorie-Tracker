# 🥗 Calorie Tracker — AI-Powered Nutrition Logger

A full-stack personal nutrition tracking application built with **React**, **FastAPI**, and **PostgreSQL**, featuring Gemini AI for intelligent meal analysis, photo-based calorie extraction, and conversational nutrition guidance.

---

## ✨ Features

### 🍽️ Meal Logging
- Log meals manually with name, type (Breakfast / Lunch / Dinner / Snack), calories, and macros (protein, carbs, fat)
- Upload a **photo** of your meal — Gemini AI identifies food items and estimates nutrition automatically
- Import an entire **food diary from a PDF** (MyFitnessPal exports, Cronometer, etc.) via Gemini AI parsing
- Edit and delete individual meal entries

### 📊 Dashboard & Analytics
- Daily calorie summary with goal progress bar
- Recent meal feed on the home dashboard
- Dedicated **Analytics** view with charts:
  - Weekly calorie trend (bar chart)
  - Macronutrient breakdown (pie chart)
  - Average daily intake over any time range

### 🎯 Health Goals
- Set a personal calorie goal with height, weight, age, activity level, and diet type
- View full goal history with pagination

### 🤖 AI Chat Assistant
- Conversational interface powered by Gemini — ask anything about nutrition, meal planning, macros, or fitness
- Maintains chat history within the session
- Renders responses with full Markdown formatting

### 📅 Meal History
- Paginated and filterable meal log (by date preset or custom date range via calendar picker)
- Search meals by name or food item
- Filter by meal type

### 🌙 Dark Mode
- Full dark/light theme toggle, respects system preferences on first load

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** (Vite) | UI framework |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **TanStack Query (React Query)** | Server state & caching |
| **Zustand** | Client state (theme) |
| **Recharts** | Analytics charts |
| **React Markdown + remark-gfm** | AI chat message rendering |
| **Lucide React** | Icons |
| **Axios** | HTTP client (with JWT interceptor) |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | REST API framework |
| **SQLAlchemy** | ORM |
| **PostgreSQL** | Primary database |
| **Alembic** | Database migrations |
| **Pydantic v2** | Request/response validation |
| **Python Jose** | JWT authentication |
| **Passlib + bcrypt** | Password hashing |
| **pdfplumber** | PDF text/table extraction |
| **python-dateutil** | Date parsing |

### AI
| Technology | Purpose |
|---|---|
| **Google Gemini API** (`gemini-1.5-flash`) | Photo calorie extraction, PDF diary parsing, AI chat |

---

## 📂 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/routes/       # FastAPI route handlers (meals, goals, ai, auth, bulk)
│   │   ├── core/             # Config, security, JWT
│   │   ├── crud/             # Database access layer
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # AI service (Gemini)
│   │   └── main.py           # App entry point
│   ├── requirements.txt
│   └── migrate_db.py
└── frontend/
    └── calorie-tracker/
        ├── src/
        │   ├── api/           # Axios service modules
        │   ├── components/    # Reusable UI (Pagination, DateRangePicker, etc.)
        │   ├── containers/    # Complex modal components
        │   ├── views/         # Page-level views
        │   ├── store/         # Zustand stores
        │   ├── hooks/         # Custom React hooks
        │   └── types/         # Shared TypeScript types
        └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **Python** 3.10+
- **PostgreSQL** (running locally or via Docker)
- A **Google Gemini API key** — get one free at [ai.google.dev](https://ai.google.dev)

---

### 1. Clone the repository

```bash
git clone https://github.com/Omkar-Khairnar/Calorie-Tracker.git
cd Calorie-Tracker
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/calorie_tracker
SECRET_KEY=your-super-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

Run database migrations:

```bash
python migrate_db.py
```

Start the API server:

```bash
uvicorn app.main:app --reload
```

The API will be available at **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

---

### 3. Frontend Setup

```bash
cd frontend/calorie-tracker

# Install dependencies
npm install
```

Start the dev server:

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

> The Vite dev server proxies all `/api/*` requests to `http://localhost:8000` automatically — no CORS configuration needed during development.

---

## 🔑 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET/POST` | `/api/meals/` | List / create meal logs |
| `DELETE` | `/api/meals/{id}` | Delete a meal |
| `POST` | `/api/meals/bulk-import` | Bulk import from PDF |
| `GET/POST` | `/api/goals/` | Get / set health goal |
| `GET` | `/api/goals/history` | Paginated goal history |
| `GET` | `/api/reports/summary` | Daily nutrition summary |
| `GET` | `/api/reports/weekly` | Weekly trend data |
| `POST` | `/api/ai/extract-photo` | Extract nutrition from meal photo |
| `POST` | `/api/ai/parse-pdf-diary` | Parse food diary PDF |
| `POST` | `/api/ai/chat` | AI nutrition chat |

---

## 📝 License

MIT License — feel free to use, modify, and distribute.
