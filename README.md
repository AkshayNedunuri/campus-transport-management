# 🚌 Lovely Professional University (LPU) - Campus Transport Management System

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://campus-transport-management.onrender.com)
[![Status](https://img.shields.io/badge/Status-Online_%26_Operational-brightgreen?style=for-the-badge)](https://campus-transport-management.onrender.com)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://cloud.mongodb.com)

> 🌐 **Live Web Application**: [https://campus-transport-management.onrender.com](https://campus-transport-management.onrender.com)

A full-stack campus transit management and real-time GPS tracking application designed for **Lovely Professional University (LPU)**, Phagwara, Punjab.

---

## 🌟 Key Features

- **🗺️ Interactive Campus Map**:
  - Full Leaflet map covering 35+ verified LPU stops including **Boys Hostels (BH-1 to BH-12)**, **Girls Hostels (GH-1 to GH-9)**, **Academic Blocks (1 to 60)**, and campus gates.
  - **Satellite View & Street View** mode toggle with live campus markers.
- **⚡ Real-Time Multi-Fleet GPS Telemetry**:
  - Live socket-streamed telemetry for 48+ vehicles across categories (**Large AC Buses**, **Mini Buses**, **Electric Buggy Trains**, **E-Rickshaws**, and **Night Safety Shuttles**).
  - Accurate heading, speed, next stop name, live passenger occupancy, and dynamic ETA calculation.
- **⏰ Fleet Operating Schedules & Timetable**:
  - Category-aware operating windows (Buggy Trains run 08:30 AM – 06:00 PM; E-Rickshaws & AC buses run into the evening; Night safety shuttles operate 08:00 PM – 11:00 PM).
  - Includes a **24/7 Demo Simulation** toggle switch for evaluation and presentations at any hour.
- **🔍 Route & Shuttle Finder**:
  - Search trips between any stops with grouped categories (*Boys Hostels*, *Girls Hostels*, *Academic Blocks*, *Gates*, *Landmarks*).
- **🎫 Seat Reservation & Ticket Booking**:
  - Booking system with downloadable tickets and real-time capacity monitoring.
- **🛡️ Multi-Role Dashboards**:
  - Dedicated portals for **Students**, **Drivers** (live route updates & passenger management), and **Admins** (fleet management, analytics, and complaints).
- **📢 Real-Time Notification & Complaint Center**:
  - Broadcast emergency announcements, schedule delays, and track student complaints.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet, Socket.io Client, Axios
- **Backend**: Node.js, Express.js, MongoDB / Mongoose, Socket.io, JWT Authentication, bcryptjs
- **Database**: MongoDB (with automated seed script for all LPU routes, fleet, and stops)

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) running locally on default port `27017`

### 2. Backend Setup
```bash
cd backend
npm install
node scripts/seed.js   # Seeds LPU campus stops, 48 vehicles, routes & demo accounts
npm run dev            # Starts backend on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev            # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@demo.com` | `password123` |
| **Driver** | `driver@demo.com` | `password123` |
| **Student** | `student@demo.com` | `password123` |
