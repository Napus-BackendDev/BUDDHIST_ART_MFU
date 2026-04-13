# Frontend Documentation Summary (BUDDHIST_ART_MFU)

This document provides a comprehensive overview of the frontend project for the Buddhist Art Management System (Mae Fah Luang University).

## 🛠 Technology Stack
- **Framework:** Vue.js 2.6.11
- **UI Kit:** CoreUI Pro Vue 3.0.6 (Bootstrap-based)
- **State Management:** Vuex 3.1.3
- **Routing:** Vue Router 3.1.6
- **Internationalization:** Vue I18n 8.18.2 (Supporting English and Thai)
- **API Communication:** Axios 1.6.1
- **Real-time:** Socket.io-client 4.7.5
- **Visuals & AI:**
  - `@vladmandic/face-api`: Face recognition capabilities.
  - `vue-konva`: Canvas drawing and interactive graphics.
  - `vue-chartjs`: Data visualization for dashboards.
  - `vue-qrcode-component`: QR Code generation for artwork tracking or certification.

## 📁 Directory Structure
The `frontend/src` directory is organized as follows:

| Directory | Description |
| :--- | :--- |
| `assets/` | Static assets including icons, images, and global styles. |
| `containers/` | Layout components (Sidebar, Navbar, Footer) for different roles (Admin, Artist, User). |
| `mixins/` | Reusable Vue mixins for shared logic. |
| `router/` | Route definitions and navigation guards. |
| `service/` | API interaction logic (`api.js`) and Socket.io services (`socketio.service.js`). |
| `store/` | Vuex modules for state management (Cart, User, Artwork, Submission, etc.). |
| `views/` | Page components categorized by user role: |
| &nbsp;&nbsp;📂 `Admin/` | Oversight features: Overview, Artworks, Submissions, Certification, User Management. |
| &nbsp;&nbsp;📂 `Artist/` | Artist-specific actions: Dashboard, Profile, Submissions. |
| &nbsp;&nbsp;📂 `User/` | Public features: Home, News, Artwork Discovery, Orders, Payments, Bills. |
| &nbsp;&nbsp;📂 `page/` | Authentication and core pages like Login. |

## 🚀 Key Features & Modules
### 1. Dashboard System
- **Admin Overview:** high-level statistics and management metrics.
- **Artist Dashboard:** Performance tracking and submission status.

### 2. Artwork & Submission
- Discovery and detailed view for users.
- Management and submission workflow for artists.
- Approval and assignment workflow for admins.

### 3. E-Commerce & Donations
- Order tracking and billing for artwork-related transactions.
- Payment integration and QR code generation for digital certification.

### 4. Advanced Integrations
- **AI/ML:** Face recognition is included via `face-api.js`, likely used for identifying people in historical artworks or for security.
- **Graphic Editing:** `vue-konva` is used, possibly for artwork annotation, signing certificates, or interactive maps.
- **Multi-language:** Robust i18n support with Thai as the fallback locale.

## 🔐 Security & Initialization
- **Authentication:** Supports Google OAuth2 and Active Directory (via backend).
- **Initialization:** `main.js` configures global components like OTP inputs, QR code generators, and Google Auth.
- **Environment:** Configuration is managed via `.env` files (e.g., `VUE_APP_CLIENTID`).

## 🛠 Development Commands
- `npm run serve`: Launch development server.
- `npm run build`: Production bundle generation.
- `npm run lint`: Code linting.
- `npm run test:unit`: Running unit tests.
