# BUDDHIST_ART_MFU

### Buddhist Art Management System - Mae Fah Luang University

A comprehensive digital platform for managing, showcasing, and preserving Buddhist artwork. This system serves as a repository for art pieces, facilitates donations, handles orders, and integrates advanced AI features for analysis and interaction.

---

## 🚀 Key Features

### 🖼️ Artwork Management
*   **Discovery & Gallery:** Browse and view detailed information about Buddhist art pieces.
*   **Bulk Import/Export:** Admin can bulk import artworks via Excel templates with support for Artist ID matching.
*   **Approval Workflow:** Structured process for reviewing and approving new artwork submissions.

### 👥 User Management
*   **Role-Based Access:** Specialized dashboards for Admins, Artists, and Public Users.
*   **Bulk User Import:** Support for importing student/artist data in bulk using Excel templates.
*   **Authentication:** Integrated with Active Directory, Google OAuth2, and supports 2FA (Two-Factor Authentication).

### 🛍️ E-Commerce & Donations
*   **Order Tracking:** Manage artwork-related transactions and billing.
*   **Donation System:** Facilitate and track monetary or artifact contributions.
*   **Digital Certification:** QR code generation for artwork tracking and certification.

### 🤖 Advanced AI Features
*   **Face Recognition:** Identify figures or people in historical artworks using `@vladmandic/face-api`.
*   **Semantic Search:** Natural language search powered by Vector DB (ChromaDB).
*   **OCR Analysis:** Read inscriptions on artifacts using Tesseract OCR.

---

## 🛠 Technology Stack

### Frontend
- **Framework:** Vue.js 2.6.11
- **UI Kit:** CoreUI Pro Vue 3.0.6 (Bootstrap-based)
- **State Management:** Vuex
- **Internationalization:** Vue I18n (English & Thai support)
- **Visuals:** Vue-Konva (Canvas), Chart.js (Dashboards)

### Backend
- **Runtime:** Node.js / Express.js
- **Database:** MongoDB (Mongoose)
- **Vector DB:** ChromaDB
- **Real-time:** Socket.io
- **Processors:** Sharp (Images), Puppeteer (PDF/Scraping)

---

## 📁 Project Structure

```text
BUDDHIST_ART_MFU/
├── frontend/           # Vue.js Frontend Application
│   ├── src/
│   │   ├── views/      # Admin, Artist, and User pages
│   │   ├── store/      # Vuex modules
│   │   └── service/    # API & Socket.io logic
├── backend/            # Node.js Backend API
│   ├── server/
│   │   ├── Project/    # Core modules (Artwork, User, Order, etc.)
│   │   └── config/     # System configurations
└── artifacts/          # Design systems and documentation
```

---

## 🔧 Getting Started

### Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure your `.env` file with MongoDB and other credentials.
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run serve
   ```

---

## 📝 Recent Updates
- **Bulk Import System:** Implemented Excel-based bulk import for both Users and Artworks with mapping logic.
- **Template System:** Added downloadable Excel templates with sample data for Admin convenience.
- **Pagination:** Optimized User Management table with 10-item pagination.
- **Enhanced Export:** Refined Excel export with human-readable headers and formatted data.

---

© 2024 Mae Fah Luang University. All Rights Reserved.
