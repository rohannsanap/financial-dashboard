
## 📊 Project: **Financial Dashboard**

**Repository:** [rohannsanap/financial-dashboard](https://github.com/rohannsanap/financial-dashboard)

---

## 1️⃣ Project Objective

A **Financial Dashboard** that:

* Tracks, analyzes, and visualizes user transactions and expenses.
* Helps users understand spending patterns.
* Provides a clean backend API and a responsive frontend for displaying charts and summaries.

---

## 2️⃣ Tech Stack

### 🖥️ Frontend

* **Next.js + TypeScript** – Framework and type safety.
* **Tailwind CSS** – Utility-first styling.
* **Chart.js / Recharts** – Data visualization libraries.

### 🗄️ Backend

* **Node.js + Express** – RESTful API.
* **MongoDB** – Database for storing users and transactions.
* **JWT** – JSON Web Tokens for authentication.
* **Bcrypt** – Password hashing.

---

## 3️⃣ Folder Structure

```bash
FINANCIAL-DASHBOARD/
├── Financial-Dashboard/
├── hooks/
├── lib/
├── node_modules/
├── public/
├── scripts/
├── styles/
├── .env.local
├── .gitattributes
├── .gitignore
├── components.json
├── eslint.config.js
├── jest.config.js
├── jest.setup.js
├── next-env.d.ts
├── next.config.mjs
├── next.config.ts
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

---

## 4️⃣ Key Features

### ✅ User Authentication

* Register and login with email and password.
* Passwords hashed using **bcrypt**.
* Sessions managed with **JWT**.

### ✅ Transaction Management

* Users can:

  * Add, update, delete transactions.
  * View all their financial entries.
* Transactions are user-linked for secure access.

### ✅ Expense Categorization

* Categories like Food, Travel, Bills, etc.
* Supports filtering and grouping by category.

### ✅ Data Visualization

* Intuitive charts:

  * 📅 Monthly spending
  * 📊 Category-wise distribution
  * 📈 Income vs. expense trends

### ✅ Secure API

* JWT-based route protection.
* Input validation for data integrity.

---

## 5️⃣ Typical API Endpoints

```http
POST   /api/auth/register         # Register a new user
POST   /api/auth/login            # Login and get JWT
POST   /api/transactions/         # Add a transaction
GET    /api/transactions/         # Get all transactions
PUT    /api/transactions/:id      # Update a transaction
DELETE /api/transactions/:id      # Delete a transaction
```

---

