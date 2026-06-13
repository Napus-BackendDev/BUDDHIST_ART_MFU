# System Specification & Project Context: BUDDHIST_ART_MFU

This document serves as the single source of truth for the **Buddhist Art Management System - Mae Fah Luang University**. 
Feed this file to any AI coding assistant (like Antigravity) at the start of a session to instantly onboard it onto the project.

---

## 📌 Project Overview
**BUDDHIST_ART_MFU** is a digital platform designed for managing, showcasing, and preserving Buddhist artwork. 
It functions as a repository for art pieces, facilitates donations, and handles orders/e-commerce.

---

## 👥 User Roles & Permissions Matrix

The system operates with three distinct user roles, each with specific dashboards and access controls:

| Role | Key Responsibilities | Primary Features & Functions |
| :--- | :--- | :--- |
| **Admin**<br>*(ผู้ดูแลระบบ)* | Manage system data, users, and approve artwork submissions. | - **Admin Dashboard**: View system metrics and activities.<br>- **User Management**: Add/Edit/Delete users (supports Active Directory, Google OAuth2, 2FA).<br>- **Bulk Import/Export**: Import users & artworks via Excel templates with Artist ID mapping.<br>- **Approval Workflow**: Review and approve/reject artwork submissions by Artists.<br>- **Transaction Management**: View and track all orders and donations. |
| **Artist**<br>*(ศิลปิน)* | Register artwork, manage portfolios, and track sales/donations. | - **Artist Dashboard**: Track views, sales, and donation statistics for their art.<br>- **Artwork Submission**: Submit new artworks (images, details, dimensions, history) for Admin approval.<br>- **Portfolio Management**: Edit details of their own approved artworks.<br>- **Digital Certification**: View QR code certification generated for their artwork. |
| **Public User**<br>*(ผู้ใช้ทั่วไป / ผู้ซื้อ / ผู้บริจาค)* | Explore artworks, make purchases, donate, and verify authenticity. | - **Artwork Gallery**: Browse, filter, and view details of approved Buddhist art.<br>- **E-Commerce**: Place orders for artwork prints/originals and track order status.<br>- **Donation System**: Make monetary or artifact contributions.<br>- **QR Certification**: Scan QR codes to verify authenticity of artwork. |

---

## ⚙️ Tech Stack & Key Integrations

### Frontend
- **Framework:** Vue.js 2.6.11 (Options API)
- **UI Component Library:** CoreUI Pro Vue 3.0.6 (Bootstrap-based)
- **State Management:** Vuex
- **Internationalization (i18n):** Vue I18n (supports English and Thai)
- **Interactive Canvas:** Vue-Konva (for image interaction/bounding boxes)
- **Charts:** Chart.js

### Backend
- **Runtime & API Framework:** Node.js / Express.js
- **Primary Database:** MongoDB (Mongoose ODM)
- **Real-Time Communication:** Socket.io
- **Image Processing & Scraping:** Sharp (Image manipulation), Puppeteer (PDF generation & web scraping)

---

## 📁 Repository Structure & Code Mapping

- [frontend/](file:///c:/Users/asus/Documents/GitHub/BUDDHIST_ART_MFU/frontend): Vue.js frontend client code.
  - `src/views/`: Contains page views split into admin, artist, and user sections.
  - `src/store/`: Vuex state modules.
  - `src/service/`: Axios API clients and Socket.io client setup.
- [backend/](file:///c:/Users/asus/Documents/GitHub/BUDDHIST_ART_MFU/backend): Node.js Express server.
  - `server/Project/`: Modular directory containing models, routes, and controllers grouped by feature (e.g., Artworks, Users, Orders, Donations, AI).
  - `server/config/`: Configuration files (database, passport, env keys).

---

## 🎯 Development & Testing Workflow

### 1. Installation
- **Backend:** Run `pnpm install` in the [backend/](file:///c:/Users/asus/Documents/GitHub/BUDDHIST_ART_MFU/backend) directory.
- **Frontend:** Run `npm install` in the [frontend/](file:///c:/Users/asus/Documents/GitHub/BUDDHIST_ART_MFU/frontend) directory.

### 2. Starting Local Development
- **Backend:** `npm start` (Runs on port specified in `.env`, usually `localhost:5000` or `localhost:8000`).
- **Frontend:** `npm run serve` (Runs on `localhost:8080` or `localhost:8081`).
