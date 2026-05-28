# Campus Voice

Campus Voice is a full-stack, database-driven web application designed to facilitate secure, structured, and moderated communication among students within an educational institution.

Traditional campus communication channels often lack privacy, moderation, and accountability, making students hesitant to express opinions, provide feedback, or report issues. Campus Voice addresses these challenges by providing a centralized platform where users can submit compliments and complaints either anonymously or with identity disclosure.

The platform also includes moderation and administration tools that allow administrators to monitor activities, manage reports, enforce discipline, and maintain a healthy communication environment within the campus community.

---

# Features

## User Authentication

* User Registration
* Secure Login System
* JWT-Based Authentication
* Protected Routes
* Session Management

---

## Anonymous Communication

* Send Compliments
* Send Complaints
* Anonymous Messaging
* Identity Disclosure Option

---

## Moderation System

* Report Handling
* User Monitoring
* Complaint Review
* User Blocking & Banning
* Administrative Controls

---

## Dynamic Rating System

* User Reputation Tracking
* Complaint-Based Rating
* Community Behavior Monitoring
* Report-Based Penalties

---

## Dashboard & User Management

* Personalized Dashboard
* User Profiles
* Inbox Management
* Activity Tracking

---

## Modern User Interface

* Responsive Design
* Glassmorphism UI
* Animated Components
* Smooth Transitions
* Interactive User Experience

---

# Tech Stack

## Frontend

* React.js
* Vite
* CSS3
* JavaScript

## Backend

* Node.js
* Express.js

## Database

* MySQL

## ORM

* Prisma ORM

## Authentication & Security

* JWT Authentication
* Middleware-Based Authorization
* Validation Middleware

---

# System Architecture

```text id="cvsys1"
Frontend (React + Vite)
        │
        ▼
Backend API (Node.js + Express)
        │
        ▼
Prisma ORM
        │
        ▼
MySQL Database
```

---

# Database Concepts Implemented

* Relational Database Design
* Foreign Key Relationships
* Database Normalization
* Structured Query Handling
* CRUD Operations
* Data Consistency Enforcement

---

# Project Structure

```text id="cvsys2"
Campus-Voice/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# Installation & Setup

## Clone Repository

```bash id="cvsys3"
git clone YOUR_REPOSITORY_URL
cd Campus-Voice
```

---

# Backend Setup

## Navigate to Backend

```bash id="cvsys4"
cd backend
```

## Install Dependencies

```bash id="cvsys5"
npm install
```

## Configure Environment Variables

Create a `.env` file using `.env.example`.

Example:

```env id="cvsys6"
DATABASE_URL="your_database_url"
JWT_SECRET="your_secret_key"
PORT=5000
```

## Run Prisma Migration

```bash id="cvsys7"
npx prisma migrate dev
```

## Start Backend Server

```bash id="cvsys8"
npm run dev
```

---

# Frontend Setup

## Navigate to Frontend

```bash id="cvsys9"
cd frontend
```

## Install Dependencies

```bash id="cvsys10"
npm install
```

## Start Frontend

```bash id="cvsys11"
npm run dev
```

---

# Security Features

* JWT Authentication
* Protected API Routes
* Role-Based Access Control
* Input Validation
* Error Handling Middleware
* Secure Password Utilities
* Anonymous Reporting Mechanism

---

# API Modules

## Controllers

* Authentication Controller
* Users Controller
* Messages Controller
* Reports Controller
* Leaderboard Controller
* Admin Controller

## Middleware

* Authentication Middleware
* Role Middleware
* Validation Middleware
* Error Middleware

---

# Future Improvements

* Real-Time Chat System
* Notification System
* Email Verification
* Mobile Responsive Optimization
* Dark/Light Theme
* AI-Based Content Moderation
* Cloud Deployment
* Docker Support
* File & Media Sharing
* Advanced Analytics Dashboard

---

# Learning Outcomes

This project demonstrates:

* Full Stack Web Development
* Database Management Systems
* REST API Design
* Authentication Systems
* Prisma ORM Integration
* Middleware Architecture
* Role-Based Authorization
* Frontend Component Architecture
* Secure Backend Development
* Modern UI/UX Design

---

# Author

Rehan Reji

GitHub:
https://github.com/rehanpct

---

# License

This project is developed for educational, academic, and portfolio purposes.
