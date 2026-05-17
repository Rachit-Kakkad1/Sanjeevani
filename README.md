# 🚀 MedClear Backend | Core API & Business Logic

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

The **MedClear Backend** is a high-performance REST API built on Express.js. It serves as the central nervous system of the MedClear ecosystem, orchestrating communication between the user interface, the OCR engine, and the persistent data store.

---

## 🏗️ Architecture

The backend follows a modular **Controller-Service-Model** pattern, ensuring scalability, maintainability, and clear separation of concerns.

### Key Responsibilities
-   **API Gateway**: Unified entry point for the frontend, handling routing and versioning (`/api/v1`).
-   **Security**: Implements **Helmet** for header security, **Rate Limiting** to prevent abuse, and **CORS** for controlled access.
-   **Orchestration**: Manages the lifecycle of a bill, from upload to OCR extraction and final audit.
-   **Audit Logic**: Contains the core algorithms for detecting billing errors, upcoding, and unbundled services.
-   **Persistent Storage**: Interfaces with MongoDB via Mongoose for structured data management.

## 🛠️ Tech Stack

| Feature | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | **Node.js** | Asynchronous, event-driven JavaScript runtime. |
| **Framework** | **Express 5** | Minimalist web framework with advanced middleware support. |
| **Database** | **MongoDB** | NoSQL database for flexible medical data schemas. |
| **Validation** | **Mongoose** | Elegant MongoDB object modeling for Node.js. |
| **Logging** | **Winston** | Multi-transport logging for production monitoring. |
| **Security** | **Helmet & Rate Limit** | Hardening the API against common vulnerabilities. |

---

## 📁 Project Structure

```text
backend/
├── src/
│   ├── config/             # Database and environment configurations
│   ├── controllers/        # Request handling and response orchestration
│   ├── middlewares/        # Auth, error handling, and file upload (Multer)
│   ├── models/             # Mongoose schemas (Bills, Users, References)
│   ├── routes/             # Express route definitions
│   ├── services/           # Heavy-lift business logic and external API calls
│   ├── utils/              # Shared helpers, loggers, and queue managers
│   └── app.js              # Express app initialization
├── server.js               # Application entry point & server bootstrap
├── .env                    # Environment variables (Internal use)
└── package.json            # Dependencies and scripts
```

---

## 🚦 Getting Started

### Prerequisites
-   **Node.js**: v18.0.0+
-   **MongoDB**: Local or Atlas instance
-   **OCR Service**: Must be running for bill processing

### Installation

1.  **Enter Directory**:
    ```bash
    cd backend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file based on the project requirements (DB URI, Port, OCR URL).

4.  **Launch Development Server**:
    ```bash
    npm run dev
    ```
    The API will be available at `http://localhost:5000`.

### Database Seeding
To populate the database with initial reference data (fair market costs, etc.):
```bash
npm run seed
```

---

## 🛡️ API Endpoints (v1)

-   `GET /health`: System health check.
-   `POST /api/v1/bills/upload`: Process a new medical bill.
-   `GET /api/v1/bills`: Retrieve billing history.
-   `GET /api/v1/bills/:id`: Get detailed audit report for a specific bill.

---

## ⚖️ License

© 2026 MedClear. All rights reserved. Proprietary and Confidential.
