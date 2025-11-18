# ☁️ Cloud Chaser

**Cloud Chaser** is a robust full-stack web platform designed for managing marketing services, subscriptions, and campaigns. It features a Role-Based Access Control system that facilitates distinct workflows for Clients, Operatives, and Administrators.

## 🚀 Project Overview

The application serves as a bridge between a marketing agency and its clients.
* **Clients** can browse marketing packages, subscribe to services, and launch campaigns based on those subscriptions.
* **Operatives** manage the inventory of service components, define products, and bundle them into packages.
* **Admins** oversee the entire system, managing user accounts and monitoring all campaign activities.

## 🛠️ Tech Stack

### Frontend
* **Framework:** React
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **State Management:** React Context API (for Authentication)

### Backend
* **Framework:** FastAPI (Python)
* **ORM:** SQLAlchemy
* **Data Validation:** Pydantic
* **Authentication:** OAuth2 with JWT (JSON Web Tokens)

### Database
* **System:** MySQL
* **Structure:** Relational DB with complex relationships
* **Version Control:** Alembic

---

## ✨ Key Features

### 🔐 Authentication & Authorization
* Secure Login and Registration.
* **Role-Based Access Control:**
    * `CLIENT`: Standard user access (Browse products, Manage campaigns).
    * `OPERATIVE`: Worker/Manager access (Inventory & Product management).
    * `ADMIN`: System administrator access (User management, System oversight).
* Protected Routes in Frontend (auto-redirect based on role).

### 👤 Client Dashboard
* **Product Browser:** View available marketing products with dynamic pricing.
* **Subscriptions:** Purchase products (creates a subscription record).
* **Campaign Management:** Create new marketing campaigns based on active subscriptions. View campaign status (Pending, Active, Completed).

### 👷 Operative Dashboard
* **Component Inventory (CRUD):** Manage atomic service units (e.g., "Social Media Post", "Analytics Report").
* **Product Management (CRUD):** Define high-level products (e.g., "Growth Package") and their pricing.
* **Package Builder:** Link components to products with specific quantities (e.g., 1 Product = 10 Posts + 1 Report).

### 🛡️ Admin Dashboard
* **Client Management:** View, Edit, and Delete system users.
* **Campaign Oversight:** Monitor all campaigns across the platform, edit statuses, or delete inappropriate entries.

---

## 🗄️ Database Schema

The application relies on a relational structure:

* **Users:** Stores credentials and roles.
* **Products & Components:** The catalog inventory.
* **Products_Components:** Junction table linking components to products with quantities.
* **Subscriptions:** Links a User to a Product (with start/end dates).
* **Campaigns:** Created by a User, linked specifically to a valid **Subscription**.
* **Alembic Version:** Stores versions of the database.

---

## ⚙️ Installation & Setup

### Prerequisites
* Node.js (v18+)
* Python (v3.9+)
* MySQL Server

### 1. Database Setup
Run the provided SQL initialization script to seed the database with required tables and default data).

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
cd ..
uvicorn backend.main:app --reload
```
*The API will run at `http://localhost:8000`*
*Swagger Documentation available at `http://localhost:8000/docs`*

### 3. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Add necessary shadcn components
npx shadcn@latest add button input card dialog table dropdown-menu select alert-dialog switch

# Run the development server
npm run dev
```
*The application will run at `http://localhost:3000`*

---

## 🔑 Environment Variables

Create a `.env` file in your `backend` directory:

```env
DATABASE_URL="mysql+pymysql://user:password@localhost:3306/cloud_chaser_db"
SECRET_KEY="your_generated_secret_key_here" (you can generate key with openssl rand -hex 32 in the terminal)
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 🧪 API Structure (Router Organization)

To ensure scalability, the backend logic is separated into distinct routers using the Repository Pattern:

* `routers/auth.py`: Login and Registration logic.
* `routers/admin.py`: Protected endpoints for Admin users (User/Campaign management).
* `routers/users.py`: Reading current user.
* `routers/products_management.py`: CRUD for products (Operative access).
* `routers/packages_management.py`: Logic for linking components to products (Operative access).
* `routers/components_management.py`:  CRUD for individual components (Operative access).
* `routers/subscriptions.py`: Handling user purchases.
* `routers/campaigns.py`: CRUD for campaigns (Clients access)
* `routers/products.py`: Get products for Clients.
---

## 🔮 Features to be Implemented

This project is a solid foundation, but there are several exciting features planned for future updates:

* **Payment Gateway Integration:** Integrating Stripe or PayPal to handle real-time payments for subscriptions instead of simulated purchases.
* **Advanced Analytics Dashboard:** Implementing visual charts (using Recharts or Chart.js) to visualize campaign performance and sales data.
* **Social Media API Integration:** Automating the actual posting of content to platforms like Facebook, Instagram, and LinkedIn directly from the dashboard.
* **Email Notification System:** Sending automated emails to clients when their campaign status changes (e.g., from "Pending" to "Active").
* **Docker Containerization:** Creating a Dockerfile and docker-compose setup to simplify deployment across different environments.
* **OAuth 2.0 / Social Authentication:** Integrating external providers like Google, GitHub, or Microsoft to allow users to sign up and log in without creating a new password.
---

## 🎓 Learning Outcomes

The development of **Cloud Chaser** facilitated the mastery of several advanced Full-Stack concepts:

* **Scalable Application Architecture:** Learned to structure a large codebase by separating concerns. Implemented the **Repository Pattern** in the backend (separating Routers from CRUD logic) and component-based architecture in the frontend, making the code modular, testable, and easier to maintain.
* **Stateless Authentication with JWT:** Gained a solid understanding of **JSON Web Tokens (JWT)**. Implemented a secure OAuth2 flow where the server remains stateless, verifying tokens for protected routes via HTTP headers instead of server-side sessions.
* **Database Relationship Modeling:** Mastered the implementation of complex SQL relationships, specifically **Many-to-Many** associations (via junction tables) and **One-to-Many** constraints, ensuring data integrity across the entire platform.
* **Secure API Design:** Developed a RESTful API with **FastAPI**, implementing Dependency Injection for granular permission control (e.g., ensuring only Admins can delete users).
* **Full-Stack Type Safety:** Leveraged **Pydantic** on the backend to enforce strict data schemas, significantly reducing runtime errors and improving developer productivity.
* **Modern UI/UX Principles:** Utilized Tailwind CSS and Shadcn/UI to build responsive, accessible, and aesthetically pleasing interfaces without writing custom CSS from scratch.
