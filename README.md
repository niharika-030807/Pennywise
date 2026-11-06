# PENNYWISE

### Make Every Rupee Count.

A modern, production-grade personal finance management and wealth intelligence platform designed with a futuristic fintech aesthetic, inspired by flowing gradient waves and dynamic interconnected network visualizations.

---

## 🏗️ Architectural Overview & Clean Folder Structure

Pennywise is structured following clean-code principles, layered architecture, strict separation of concerns, centralized state management, and typed, versioned API pipelines.

```text
Pennywise/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py                      # Reusable FastAPI dependencies (DB session, JWT auth)
│   │   │   └── v1/
│   │   │       ├── router.py                # Aggregated API v1 router
│   │   │       └── endpoints/               # Lean HTTP controllers
│   │   │           ├── auth.py              # Authentication, OTP, Registration, Login
│   │   │           ├── dashboard.py         # Main dashboard KPI telemetry
│   │   │           ├── transactions.py      # Expense & Income ledger CRUD, CSV import/export
│   │   │           ├── budgets.py           # Budget cap & category limit endpoints
│   │   │           ├── goals.py             # Savings goals & deposit endpoints
│   │   │           ├── bank.py              # RBI Account Aggregator connection endpoints
│   │   │           ├── wrap.py              # Monthly Money Wrap summary endpoints
│   │   │           └── assistant.py         # AI Companion & chat history endpoints
│   │   ├── core/
│   │   │   ├── config.py                    # Typed Settings loaded from environment variables
│   │   │   ├── database.py                  # SQLAlchemy engine, SessionLocal, declarative Base
│   │   │   ├── security.py                  # PBKDF2-HMAC-SHA256 password hashing & JWT encoding
│   │   │   └── exceptions.py                # Custom exceptions & centralized error handlers
│   │   ├── models/
│   │   │   ├── entities.py                  # User, Transaction, Budget, Goal, Bank, Chat, OTP
│   │   │   └── __init__.py
│   │   ├── schemas/
│   │   │   ├── auth.py, transaction.py, budget.py, goal.py, bank.py, wrap.py, assistant.py
│   │   │   └── __init__.py                  # Typed Pydantic request/response schemas
│   │   ├── services/                        # Decoupled business logic layer
│   │   │   ├── auth_service.py              # OTP generation, user validation & session issuing
│   │   │   ├── transaction_service.py       # Ledger operations, search, filters & CSV parser
│   │   │   ├── analytics_service.py         # Shared calculation engine (totals, metrics, trends)
│   │   │   ├── budget_service.py            # Budget evaluation & overspend warnings
│   │   │   ├── goal_service.py              # Savings milestone tracking & SIP calculation
│   │   │   ├── bank_service.py              # Account Aggregator bank integration logic
│   │   │   ├── wrap_service.py              # Spotify-style monthly wrap analysis & persona badge
│   │   │   ├── assistant_service.py         # Gemini AI with deterministic fintech fallback engine
│   │   │   └── sms_service.py               # Fast2SMS and Twilio telecom gateway integration
│   │   └── main.py                          # App entry point, CORS, exception handlers & routing
│   ├── .env.example                         # Environment configuration template
│   ├── requirements.txt
│   └── test_api.py                          # 13-suite automated fintech test runner
│
└── frontend/
    ├── src/
    │   ├── api/                             # Scalable API communication layer
    │   │   ├── httpClient.js                # Base client with auth interceptor & error formatting
    │   │   ├── auth.api.js                  # Authentication endpoints
    │   │   ├── transactions.api.js          # Transaction queries, mutations, CSV import
    │   │   ├── dashboard.api.js             # Telemetry & KPI queries
    │   │   ├── budgets.api.js               # Budget management endpoints
    │   │   ├── goals.api.js                 # Savings goals endpoints
    │   │   ├── bank.api.js                  # Bank connection endpoints
    │   │   ├── wrap.api.js                  # Monthly wrap endpoints
    │   │   ├── assistant.api.js             # AI Companion endpoints
    │   │   └── index.js                     # Unified API export
    │   ├── components/
    │   │   ├── common/                      # Reusable UI primitives
    │   │   │   ├── Button.jsx               # Variant-aware button with loading spinner
    │   │   │   ├── Input.jsx                # Form input with icon, label, and validation error
    │   │   │   ├── Select.jsx               # Styled dropdown selector
    │   │   │   ├── Card.jsx                 # Glassmorphic card container with hover effect
    │   │   │   ├── StatCard.jsx             # Metric stat card with trend indicator and glow
    │   │   │   ├── Badge.jsx                # Category and status indicator pill
    │   │   │   ├── EmptyState.jsx           # Clean zero-data placeholder illustration
    │   │   │   ├── LoadingSpinner.jsx       # Glowing neon loader
    │   │   │   ├── ErrorMessage.jsx         # Retryable error alert box
    │   │   │   └── ErrorBoundary.jsx        # Catch-all failsafe UI boundary
    │   │   ├── layout/                      # Application frame
    │   │   │   ├── AppLayout.jsx            # Layout wrapper (waves, sidebar, navbar)
    │   │   │   ├── Navbar.jsx               # Header with mobile drawer & quick actions
    │   │   │   ├── Sidebar.jsx              # Navigation drawer with brand identity
    │   │   │   └── NetworkBackground.jsx    # Animated canvas particle nodes
    │   │   └── modals/                      # Popups and dialogs
    │   │       ├── Modal.jsx                # Accessible modal container with backdrop blur
    │   │       └── TransactionModal.jsx     # Transaction create / edit dialog
    │   ├── context/                         # Centralized reactive state management
    │   │   ├── AuthContext.jsx              # Authentication state, login, logout, auto-expiry
    │   │   └── FinanceContext.jsx           # Reactive store (transactions, overview, budgets, goals)
    │   ├── hooks/                           # Decoupled business logic hooks
    │   │   ├── useTransactions.js           # Search, filters, pagination, CSV export/import
    │   │   ├── useDashboard.js              # Overview metrics, daily/weekly/monthly velocity
    │   │   ├── useBudgets.js                # Budget status, limit modification & validation
    │   │   ├── useGoals.js                  # Goals listing, creation, and deposits
    │   │   ├── useMonthlyWrap.js            # Monthly recap generation & archive navigation
    │   │   ├── useBankAccounts.js           # Account Aggregator bank discovery & sync
    │   │   └── useAssistant.js              # Chat history, message dispatch, suggested prompts
    │   ├── pages/                           # Pure UI presentation views
    │   │   ├── AuthPage.jsx                 # Login, Sign Up, and Password Reset
    │   │   ├── Dashboard.jsx                # Main financial dashboard
    │   │   ├── Transactions.jsx             # Expense tracker & ledger
    │   │   ├── BudgetPlanner.jsx            # Monthly budget planner
    │   │   ├── MonthlyWrap.jsx              # Spotify-style Monthly Money Wrap
    │   │   ├── FinancialInsights.jsx        # Predictive telemetry & forecasting
    │   │   ├── SavingsGoals.jsx             # Target savings goals & deposits
    │   │   ├── FinancialAssistant.jsx       # Pennywise Financial Companion AI
    │   │   ├── BankAccounts.jsx             # RBI Account Aggregator connection
    │   │   └── Settings.jsx                 # Profile & security settings
    │   └── utils/
    │       ├── constants.js                 # Categories, colors, payment methods, nav tabs
    │       ├── formatters.js                # Indian Rupee (₹), compact notation, dates
    │       └── validation.js                # Phone, email, password strength validators
    ├── .env.example                         # Frontend environment variables template
    └── vite.config.js                       # Vite bundler configuration
```

---

## 🎨 Visual Identity & Design System

Pennywise combines the two visual design references into a cohesive, glassmorphic SaaS interface:

1. **Flowing Abstract Waves (Reference Image 2):**
   * Midnight Black (`#050509`) and Dark Navy (`#080B24`, `#101536`) backdrop
   * Deep Purple (`#35004F`), Electric Purple (`#7800B8`), Magenta (`#D900A8`), Hot Pink (`#FF1493`), and Soft Pink (`#FF69B4`) flowing gradients
   * Glassmorphism cards with backdrop blur, subtle neon borders, and glowing shadows

2. **Animated Network Visualization (Reference Video 1):**
   * Interactive HTML5 Canvas component (`NetworkBackground.jsx`) rendered smoothly in the background
   * Interconnected nodes with distance-based dynamic linking
   * Multi-colored particle nodes (Orange `#FF8C00`, Blue `#00BFFF`, Teal `#00F0FF`, Purple `#9D00FF`, Pink `#FF1493`)
   * Responsive particle motion and subtle cursor-proximity attraction

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)
Create a file named `.env` in `backend/` based on `backend/.env.example`:

```env
# Application Settings
ENVIRONMENT=development
DEBUG=true
SECRET_KEY=pennywise_production_super_secret_jwt_key_2026
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Database
DATABASE_URL=sqlite:///./pennywise.db

# Gemini AI (for Pennywise Financial Companion)
GEMINI_API_KEY=your_gemini_api_key_here

# SMS Gateway (For Real Phone OTP Delivery)
# Option 1: Fast2SMS (Recommended for Indian numbers +91)
FAST2SMS_API_KEY=your_fast2sms_api_key_here

# Option 2: Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### Frontend Configuration (`frontend/.env`)
Create a file named `.env` in `frontend/` based on `frontend/.env.example`:

```env
VITE_API_BASE_URL=/api
```

---

## 🚀 Running the Project

### 1. Start Backend Server
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* API Documentation: `http://127.0.0.1:8000/docs`
* Health Check: `http://127.0.0.1:8000/health`

### 2. Start Frontend Development Server
```bash
cd frontend
npm run dev
```
* Application: `http://localhost:5173`

### 3. Run Backend Test Suite
```bash
cd backend
python test_api.py
```
* Runs all 13 end-to-end integration test suites across authentication, ledger, wrap, budgets, goals, bank sync, and AI companion.

---

## 🛡️ Security Best Practices
* **Passwords**: Hashed with PBKDF2-HMAC-SHA256 (100,000 iterations + 16-byte random salt).
* **Tokens**: Signed HS256 JWT tokens with auto-expiration and automatic client invalidation on 401.
* **OTP Security**: 6-digit codes stored with cryptographic expiration; OTP codes are **never** leaked in client API responses.
* **Bank Integration**: Simulated under the RBI Account Aggregator framework—never requests or stores passwords, ATM PINs, or UPI PINs.
