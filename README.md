# Lender Matching Platform

A full-stack automated underwriting system that evaluates loan applications against dynamic lender credit policies.

## 🚀 Features

*   **Dynamic Rule Engine**: Configure lender criteria (FICO, Time in Business, Industry) via database without code changes.
*   **Real-time Matching**: Instant evaluation of applications against multiple lender programs.
*   **Fit Scoring**: Ranks eligible lenders based on suitability for the borrower.
*   **Transparent Reasoning**: Provides specific reasons for rejection (e.g., "Credit Score 650 < Required 700").

## 🛠️ Tech Stack

### Backend
*   **Language**: Python 3.10+
*   **Framework**: FastAPI
*   **Database**: PostgreSQL (SQLAlchemy ORM)
*   **Validation**: Pydantic

### Frontend
*   **Framework**: React (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **State/Form**: React Query, React Hook Form

## 📂 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/          # API Endpoints
│   │   ├── models/       # Database Models (The "Schema")
│   │   ├── services/     # Business Logic (Matching Engine)
│   │   └── schemas/      # Pydantic Models (Validation)
│   └── create_db.py      # Database initialization utility
│
├── frontend/
│   ├── src/
│   │   ├── pages/        # React Pages (Form, Results)
│   │   └── App.tsx       # Main Router
```

## ⚡ Getting Started

### Prerequisites
*   Python 3.10+
*   Node.js 16+
*   PostgreSQL installed and running

### 1. Database Setup
Create a PostgreSQL database named `loan_db`.
```bash
# Using psql terminal
CREATE DATABASE loan_db;
```
*Update `backend/.env` (or `app/core/config.py`) if your Postgres password is not `1234`.*

### 2. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Seed the database with sample lenders and policies
python seed_and_verify.py
# (Note: seed_and_verify.py defaults to SQLite for testing. 
# To use Postgres, edit the file to remove the DATABASE_URL override)

# Start the API server
uvicorn app.main:app --reload
```
The Backend API will run at `http://localhost:8000`.

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The Frontend will run at `http://localhost:5173`.

## 🧪 Testing the Matching Logic
You can run the verification script to test the engine logic in isolation:
```bash
python backend/seed_and_verify.py
```
This script creates sample lenders (Stearns, Apex, etc.) and runs test applications to verify the matching algorithms are working correctly.

## 📖 API Documentation
Once the backend is running, visit:
*   **Swagger UI**: `http://localhost:8000/docs`
*   **ReDoc**: `http://localhost:8000/redoc`
