# Product Requirements Document (PRD)

## Project Overview
**Project Name:** BUDDHIST_ART_MFU (Buddhist Art Management System - Mae Fah Luang University)
**Objective:** To develop a comprehensive digital platform for managing, showcasing, and preserving Buddhist artwork. The system serves as a repository for art pieces, facilitates donations, handles orders, and integrates advanced AI features for analysis and interaction.

## Technology Stack

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (using Mongoose)
*   **Vector Database:** ChromaDB (for AI/Embeddings)
*   **Authentication:** JWT, Active Directory, Node-2FA
*   **AI/ML:**
    *   `langchain` (LLM Integration)
    *   `@vladmandic/face-api` (Face Recognition)
    *   `tesseract.js`, `node-tesseract-ocr` (OCR - Optical Character Recognition)
    *   `tensorflow` (implied by face-api dependencies)
*   **Utilities:** `socket.io` (Real-time), `nodemailer` (Email), `puppeteer` (Scraping/PDF), `sharp` (Image processing)

### Frontend
*   **Framework:** Vue.js 2
*   **Template:** CoreUI Pro Admin Template
*   **State Management:** Vuex
*   **Routing:** Vue Router
*   **Styling:** SCSS, Bootstrap
*   **Key Libraries:** `axios`, `moment`, `vue-i18n`, `chart.js`

## Core Modules & Features

Based on the directory structure (`backend/server/Project/`), the system consists of the following core modules:

### 1. Artwork Management (`Artwork`)
*   **Goal:** Centralized management of art artifacts.
*   **Data Models:**
    *   `Artwork`: Core metadata for art pieces (title, description, image, artist, era, material).
    *   `Category`: Classification of artwork (e.g., Sculpture, Painting, Amulet).
    *   `Location`: Physical location tracking layout/storage of measurements.
    *   `Presentation`: Likely related to how artwork is displayed or curated exhibitions.

### 2. E-Commerce / Orders (`Order`)
*   **Goal:** Facilitate simple transactions or requests.
*   **Features:**
    *   Order tracking.
    *   Product/Artwork listing for sale or requisition.

### 3. Donations (`Donation`)
*   **Goal:** Manage donor contributions.
*   **Features:**
    *   Donor records.
    *   Donation tracking (monetary or artifact donations).

### 4. News & Announcements (`New`)
*   **Goal:** Content management system for news and updates.
*   **Features:**
    *   Publishing articles or announcements.

### 5. Organization Management (`Organization`)
*   **Goal:** Manage internal structure or external partners.
*   **Features:**
    *   Department/Unit structure.
    *   Personnel management (HR integration hinted in routes).

### 6. Submissions (`Submission`)
*   **Goal:** Allow users/artists to submit artwork for review/inclusion.
*   **Features:**
    *   Submission forms.
    *   Approval workflows.

### 7. System Settings (`Settings`)
*   **Goal:** Configuration of the application.
*   **Features:**
    *   Global variables.
    *   User role configuration.

## User Roles & Security
*   **Authentication:** Integrated with Active Directory and supports 2FA (Two-Factor Authentication).
*   **Roles:**
    *   **Admin/Curator:** Full access to dashboard and management modules.
    *   **Staff:** Access to orders, donations, and specific modules.
    *   **Public/User:** View artworks, make donations, submit work.

## AI Capabilities
The inclusion of `langchain`, `chromadb`, and `face-api` suggests advanced features such as:
*   **Semantic Search:** Finding artworks using natural language queries (powered by Vector DB).
*   **Image Analysis:** OCR for reading inscriptions or face recognition for identifying figures in art.
*   **Chatbot/Assistant:** An AI assistant to guide users or answer questions about the collection.

## Deployment
*   **Containerization:** Docker & Docker Compose support.
*   **CI/CD:** GitLab CI configured (`.gitlab-ci.yml`).
*   **Environment:** Support for Dev, Test, and Prod environments.
