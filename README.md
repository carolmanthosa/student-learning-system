# 📚 Student Learning System

A full-stack web application designed to manage students, courses, profiles, assignments, and enrollments.  
Built with **NestJS (backend)** and **React (frontend)**, demonstrating real-world relational database design and REST API development.

---

## 🚀 Features

- 👨‍🎓 Student management (Create, Read, Update, Delete)
- 📘 Course management system
- 📝 Assignment tracking per student
- 👤 Student profile (One-to-One relationship)
- 🔗 Course enrollment system (Many-to-Many relationship)
- ⚡ RESTful API built with NestJS
- 🎨 Frontend built with React + TypeScript

---

## 🛠️ Tech Stack

### Backend
- NestJS
- TypeORM
- Node.js

### Frontend
- React
- TypeScript
- Axios

### Database
- MySQL (or any relational database)

---

## 🔗 Database Relationships

- **One-to-One:** Student ↔ Profile- was used to ensure each student has a unique profile without duplication.  
- **One-to-Many:** Student → Assignments - epresents that a student can have multiple courses and assignments. Many-to-Many (Students ↔ Courses via Enrollments) allows flexible course registration where multiple students can enroll in multiple courses efficiently.
- **Many-to-Many:** Students ↔ Courses (via Enrollments)- allows students to enroll in multiple courses while each course can have multiple students, managed through an enrollments table for scalability and data integrity.

---

## ⚙️ Setup Instructions

### 1. Install dependencies
npm install

### 2. Run backend (NestJS)
npm run start:dev

### 3. Run frontend (React)
cd frontend
npm install
npm run dev

---

## 👨‍💻 Author

Carol Manthosa  
GitHub: https://github.com/carolmanthosa