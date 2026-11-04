# PENNYWISE

### Make Every Rupee Count.

A complete, full-stack personal finance management and wealth intelligence platform designed with a futuristic fintech aesthetic, inspired by flowing gradient waves and dynamic interconnected network visualizations.

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

## 🌟 Core Features & Modules

### 1. Authentication System
* **New User Sign-Up**: First Name, Last Name, Phone Number (+91), Email, Password with visibility toggle and real-time password strength meter, T&C agreement.
* **6-Digit OTP Verification**: Real SMS dispatch when Twilio is configured, with a dedicated **Simulated Test OTP Mode banner** for local development.
* **Existing User Login**: Authenticates via registered mobile number and securely hashed password.
* **Forgot Password Recovery Flow**: 3-step OTP-verified password reset without requiring old password.
* **Security**: PBKDF2-HMAC-SHA256 password hashing with unique 16-byte salt, JWT tokens, and user-isolated database records.

### 2. Bank Account Connection ("Connect Your Financial World")
* **RBI Account Aggregator Framework Simulation**: Authentic digital consent workflow (Setu / Sahamati / OneMoney pattern).
* Supported Indian Banks: HDFC Bank, State Bank of India, ICICI Bank, Axis Bank, Kotak Mahindra Bank, and Punjab National Bank.
* Displays masked account number, IFSC code, live account balance, and auto-syncs realistic transactions into ledger.
* Strict security posture: never collects passwords, ATM PINs, or UPI PINs.

### 3. Main Financial Dashboard
* Personalized greeting: `Welcome back, [First Name]!`
* **Financial Overview Cards**: Total Balance, Monthly Inflow, Monthly Outflow, and Net Monthly Savings with monthly % comparison badges.
* **Expense Velocity View**: Interactive toggle between Daily, Weekly, and Monthly spend distributions.
* **Income vs Expenses Line/Area Chart**: 6-month historical cashflow velocity using Recharts.
* **Spending Categories Donut Chart**: Visual sector breakdown (Groceries, Shopping, Dining, Rent & Bills, Transport, etc.).
* **Recent Transactions & Budget Progress**: Real-time progress bar with warning indicators.

### 4. Transactions & Expense Tracker
* Full CRUD: Record, edit, and delete transactions.
* Search and multi-criteria filters: search bar, category dropdown, transaction type (All, Expense, Income), and date range pickers.
* **CSV Import & Export**: One-click import for bank statement CSV files and one-click export for auditing.
* Indian Rupee (`₹`) formatting throughout.

### 5. "Your Monthly Money Wrap" (Spotify-Wrapped for Money)
* Comprehensive monthly visual debrief.
* Total Income, Spent, and Savings with savings percentage.
* Highest & Lowest spending categories.
* Daily average spend & total transaction volume.
* Month-over-month comparison with previous month.
* **Personalized Financial Insights**: "You spent 18% more on shopping compared to last month", "You saved 32.5% of your monthly income".
* **Financial Personality Badges**: *The Master Accumulator 🏆*, *The Balanced Strategist ⚖️*, *The Adaptive Builder 🛠️*.
* Month/Year archive selector.

### 6. "Pennywise Financial Companion" (AI Assistant)
* Interactive dark glassmorphic chat interface with pink-purple neon accents.
* Grounded in **actual user transaction data** from the database.
* Answers complex financial questions:
  * *"How much did I spend this month?"*
  * *"Where am I spending the most?"*
  * *"Can I afford a purchase of ₹5,000?"*
  * *"How can I reduce my expenses?"*
  * *"What should my budget be next month?"*
* Powered by Google Gemini API (`gemini-3.8-flash`) with automatic fallback to an intelligent domain-specific financial reasoning engine.

### 7. Budget Planner
* Monthly spending limit controls.
* Category-wise sub-budgets with real-time utilization progress bars.
* Threshold alerts (>80% warning, 100% exceeded).
* Actionable recommendations for the upcoming month.

### 8. Savings Goals
* Define milestones (Goal Title, Target Amount, Target Date, Category icon).
* Deposit funds towards goals.
* Auto-calculates the recommended monthly savings SIP required to achieve the goal on time.

### 9. Modern Sidebar Navigation (10 Sections)
1. Dashboard
2. Transactions
3. Budget Planner
4. Monthly Wrap
5. Financial Insights
6. Savings Goals
7. Financial Assistant
8. Bank Accounts
9. Settings
10. Sign Out

---

## 🚀 Quick Start Guide

### Option A: One-Click Desktop Launcher
Double-click `start_pennywise.bat` in the project root. It will start both backend and frontend servers and open `http://localhost:5173` in your browser.

### Option B: Manual Command Line Execution

#### 1. Start the Backend API (FastAPI)
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* API Root: `http://127.0.0.1:8000`
* Interactive OpenAPI Documentation: `http://127.0.0.1:8000/docs`

#### 2. Start the Frontend Client (Vite + React)
```bash
cd frontend
npm run dev
```
* Web App URL: `http://localhost:5173`

---

## 🧪 Automated End-to-End Verification

A comprehensive 13-point test suite is included in `backend/test_api.py`. Run it anytime with:
```bash
cd backend
python -u test_api.py
```
Validates OTP generation, registration, JWT login, dashboard calculations, transaction management, wrap generation, budget alerts, goal deposits, bank linking, and AI companion responses.

