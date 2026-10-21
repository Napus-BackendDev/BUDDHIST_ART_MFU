# BUDDHIST_ART_MFU

### ระบบบริหารจัดการและจำหน่ายผลงานศิลปะพุทธศิลปกรรม มหาวิทยาลัยแม่ฟ้าหลวง
**Buddhist Art Management and Exhibition Platform — Mae Fah Luang University**

[![Vue.js](https://img.shields.io/badge/Vue.js-2.6-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MFU-8F2419?style=flat-square)](#)

---

## 📖 เกี่ยวกับโครงการ (Project Overview)

**BUDDHIST_ART_MFU** เป็นระบบเว็บแอปพลิเคชันแบบครบวงจร (Full-Stack Web Platform) สำหรับศูนย์ศิลปกรรมและนิทรรศการ มหาวิทยาลัยแม่ฟ้าหลวง พัฒนาขึ้นเพื่อจัดเก็บ คัดกรอง จัดแสดง และจำหน่ายผลงานศิลปะพุทธศิลปกรรมของศิลปินและนักศึกษา พร้อมด้วยระบบออกใบรับรองความเป็นของแท้ (Certificate of Authenticity), ระบบนิทรรศการออนไลน์, ระบบส่งและตรวจประเมินผลงาน, และระบบจัดการคำสั่งซื้อแบบเรียลไทม์

---

## ✨ คุณสมบัติหลักของระบบ (Core Features)

### 1. 🏛️ ระบบจัดแสดงและเลือกซื้อผลงานสำหรับประชาชน (Public Gallery & E-Commerce)
* **นิทรรศการออนไลน์ (Online Gallery):** หน้าแรกจัดแสดงนิทรรศการ ผลงานเด่น (Featured Artworks), ผลงานยอดนิยม (Best Sellers) และแคตตาล็อกผลงานตามรุ่นนักศึกษา
* **ค้นหาและคัดกรองละเอียด (Smart Filter):** ค้นหาตามชื่อผลงาน, ชื่อศิลปิน, หมวดหมู่ศิลปะ, รุ่นนักศึกษา, ช่วงราคา และสถานะความพร้อมจำหน่าย
* **หน้ารายละเอียดผลงาน (Artwork Details):** แสดงภาพผลงานความละเอียดสูง, ข้อมูลจำเพาะ (ขนาด, เทคนิค, วัสดุ), ประวัติศิลปิน, ตำแหน่งจัดเก็บจริง, สถิติการเข้าชม และผลงานที่เกี่ยวข้อง
* **ระบบตะกร้าและการจองสินค้า (Cart & Real-time Reservation):** ล็อกการจองผลงานเมื่อเพิ่มลงตะกร้า พร้อมตัวนับเวลาถอยหลัง (Reservation Timeout) ปลดล็อกอัตโนมัติเมื่อหมดเวลาเพื่อความยุติธรรม
* **ระบบสั่งซื้อ 3 ขั้นตอน (3-Step Checkout Wizard):**
  1. กรอกข้อมูลผู้รับและที่อยู่จัดส่ง
  2. ชำระเงินผ่าน PromptPay QR Code หรือโอนเงินผ่านธนาคาร พร้อมอัปโหลดหลักฐานการโอนเงิน
  3. ยืนยันคำสั่งซื้อและออกใบเสร็จ / ใบสั่งซื้อ
* **ใบรับรองผลงานของแท้ (Digital Certificate of Authenticity):** สร้างเอกสารรับรองมาตรฐานพร้อม QR Code ตรวจสอบความถูกต้องและลายเซ็นดิจิทัล

---

### 2. 🎨 ระบบสำหรับศิลปินและนักศึกษา (Artist & Student Portal)
* **หน้าโปรไฟล์และพอร์ตโฟลิโอ (Artist Profile):** จัดการข้อมูลส่วนตัว ประวัติการศึกษา ผลงานทั้งหมด และสถิติยอดจำหน่าย
* **ระบบส่งผลงานศิลปะ (Artwork Submission):** ส่งผลงานใหม่เข้าสู่ระบบ ระบุภาพผลงาน คำอธิบาย แนวคิด ขนาด วัสดุ และราคา พร้อมระบบตรวจสอบกำหนดเวลาส่ง (ตรงเวลา / ส่งสาย)
* **ระบบวางจำหน่ายหลังจบภาคการศึกษา (Post-Term Sale Workflow):** ศิลปินสามารถเลือกระบุความประสงค์ว่าจะนำผลงานเข้าสู่ระบบวางจำหน่ายทั่วไป หรือต้องการรับผลงานจริงคืนหลังจบภาคการศึกษา

---

### 3. 🛡️ ระบบการจัดการสำหรับผู้ดูแลระบบ (Admin Management Center)
* **แดชบอร์ดภาพรวมและสถิติ (Overview Dashboard):** สรุปยอดขาย, จำนวนคำสั่งซื้อ, สถิติผู้ใช้งาน, สถานะผลงานศิลปะ และกราฟวิเคราะห์รายได้
* **การจัดการผลงานศิลปะ (Artwork Management):** เพิ่ม, แก้ไข, ระงับ, เปลี่ยนสถานะผลงาน, อัปโหลดภาพหลายมุมมอง และระบุตำแหน่งจัดเก็บจริง (เช่น อาคาร, ชั้นวาง, ห้องจัดเก็บ)
* **การตรวจประเมินผลงานส่งมอบ (Submission Evaluation):** ตรวจสอบผลงานที่ส่งมาจากนักศึกษา กดอนุมัติ/ปฏิเสธพร้อมบันทึกหมายเหตุการแก้ไข ปรับปรุงสถานะแบบทันที (Optimistic UI)
* **การจัดการคำสั่งซื้อ (Order & Payment Management):** ตรวจสอบหลักฐานการโอนเงิน อนุมัติ/ปฏิเสธการชำระเงิน อัปเดตรหัสพัสดุจัดส่ง (Tracking Number) พร้อมระบบส่งอีเมลแจ้งเตือนลูกค้าอัตโนมัติ
* **การจัดการผู้ใช้งาน (User Management):** จัดการสิทธิ์การใช้งาน (Admin, Artist, Customer), สร้างบัญชีผู้ใช้ใหม่, และรองรับการนำเข้าข้อมูลนักศึกษา/ผู้ใช้แบบกลุ่มผ่านไฟล์ Excel Template
* **ระบบจัดการข่าวสารและประชาสัมพันธ์ (News CMS):** สร้างและเผยแพร่ข่าวกิจกรรม นิทรรศการ และประกาศสำคัญ รองรับเนื้อหาสองภาษา

---

### 4. 🌐 การรองรับ 2 ภาษาและการแจ้งเตือน (i18n & Notifications)
* **รองรับภาษาไทยและภาษาอังกฤษ (Bilingual TH / EN):** สลับภาษาได้ทันทีทั่วทั้งระบบ ทั้งปุ่มเมนู ตัวกรอง สถานะ และเอกสาร
* **ระบบแจ้งเตือนทางอีเมลอัตโนมัติ (Automated Email Services):** ส่งอีเมลยืนยันคำสั่งซื้อ, แจ้งผลการตรวจประเมินผลงาน, และแจ้งเตือนสถานะการจัดส่ง

---

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

### Frontend (ฝั่งผู้ใช้งานและระบบจัดการ)
* **Core Framework:** [Vue.js 2.6](https://vuejs.org/)
* **UI Component Framework:** [CoreUI Vue 3.0](https://coreui.io/vue/) (Bootstrap-based Design System)
* **State Management:** [Vuex 3.x](https://vuex.vuejs.org/) (Modular Store: Artwork, Cart, Order, Submission, Realtime)
* **Routing:** [Vue Router](https://router.vuejs.org/)
* **Internationalization:** [Vue I18n](https://kazupon.github.io/vue-i18n/) (รองรับภาษาไทยและอังกฤษ)
* **Styling & Icons:** SCSS / CSS3 Vanilla Tokens, CoreUI Icons (`@coreui/icons`), Custom Minimal Action Buttons
* **HTTP & Realtime Client:** Axios, Socket.io-client
* **Utilities:** Moment.js (Date formatting & Quick range filters), Vue-Multiselect, Canvas API

### Backend (ฝั่งบริการและฐานข้อมูล)
* **Runtime & Framework:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* **Database:** [MongoDB](https://www.mongodb.com/) (Object Modeling ผ่าน Mongoose ODM)
* **Realtime Server:** [Socket.io](https://socket.io/) (Push updates สำหรับ Cart, Orders และ Submissions)
* **Authentication:** JSON Web Tokens (JWT), Google OAuth 2.0, Bcryptjs Password Hashing
* **Document & Image Processing:** Sharp (Image optimization), Puppeteer / PDFKit (Certificate & Invoice PDF generation), ExcelJS / XLSX (Bulk Import & Export)
* **Email Service:** Nodemailer (HTML Template Email delivery)
* **Scheduled Tasks:** Node-cron (Cart timeout release & Post-term sale deadlines)

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
BUDDHIST_ART_MFU/
├── frontend/                     # ซอร์สโค้ดฝั่ง Frontend (Vue.js)
│   ├── public/                   # Static Assets, Favicon, QR Codes
│   ├── src/
│   │   ├── assets/               # SCSS Stylesheets, Fonts, System Images
│   │   ├── components/           # Reusable UI Components (Cards, Buttons, Dialogs)
│   │   ├── containers/           # Layout Containers (Admin Layout, Public Layout)
│   │   ├── mixins/               # Shared Vue Mixins (statusBadgeMixin, etc.)
│   │   ├── router/               # Route Definitions & Navigation Guards
│   │   ├── service/              # API Clients & HTTP Services
│   │   ├── store/                # Vuex Store Modules (Cart, Order, Artwork, etc.)
│   │   └── views/
│   │       ├── Admin/            # Admin Management Pages (Overview, Orders, Submissions, Artworks, Users, News)
│   │       ├── Artist/           # Artist & Student Portals (Profile, Submission Details)
│   │       ├── User/             # Customer Dashboard & Orders
│   │       └── page/             # Public Pages (Home, Artworks, ArtworkDetail, News, Payment, Contact)
│   └── package.json
│
├── backend/                      # ซอร์สโค้ดฝั่ง Backend (Node.js/Express)
│   ├── server/
│   │   ├── Project/              # Business Logic Modules
│   │   │   ├── Artwork/          # Artwork Schema, Controllers & Services
│   │   │   ├── Order/            # Order Processing, Billing & Invoices
│   │   │   ├── Submission/       # Student Assignment & Review Workflows
│   │   │   ├── User/             # User Management & Authentication
│   │   │   ├── News/             # News & Announcement Services
│   │   │   └── Mail/             # Email Templates & PDF Certificate Generators
│   │   ├── config/               # Database & App Configurations
│   │   ├── crons/                # Cron Jobs (Cart Expiration, Sale Deadlines)
│   │   └── routes/               # API Endpoint Routes
│   └── package.json
│
└── docs/                         # เอกสารข้อกำหนดระบบ (System Specs, TOR Reports)
```

---

## 🚀 การติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### ความต้องการของระบบ (Prerequisites)
* **Node.js:** v16.x หรือ v18.x
* **NPM / PNPM / Yarn**
* **MongoDB Database:** ติดตั้งแบบ Local หรือใช้งาน MongoDB Atlas Connection URI

---

### 1. ติดตั้งและรันฝั่ง Backend

```bash
# ไปยังโฟลเดอร์ backend
cd backend

# ติดตั้ง Dependencies
npm install

# สร้างไฟล์ .env และตั้งค่าตัวแปรระบบ (ดูตัวอย่างจาก .env.example)
# PORT=3000
# MONGODB_URI=mongodb://localhost:27017/buddhist_art_mfu
# JWT_SECRET=your_jwt_secret

# รันเซิร์ฟเวอร์ Backend (Development Mode)
npm run serve:dev
```
> Backend API จะทำงานที่: `http://localhost:3000`

---

### 2. ติดตั้งและรันฝั่ง Frontend

```bash
# ไปยังโฟลเดอร์ frontend
cd frontend

# ติดตั้ง Dependencies
npm install

# รันเซิร์ฟเวอร์ Frontend (Development Mode)
npm run serve
```
> เข้าใช้งานระบบผ่านเว็บเบราว์เซอร์ที่: `http://localhost:8080`

---

## 🔒 บัญชีและบทบาทการเข้าใช้งานระบบ (User Roles)

| Role | การเข้าถึง (Access Level) | รายละเอียดหน้าที่ |
| :--- | :--- | :--- |
| **Admin** | `/admin/*` | จัดการผลงาน, อนุมัติ/ปฏิเสธคำสั่งซื้อ, ตรวจประเมินผลงาน, จัดการผู้ใช้, ออกใบรับรอง |
| **Artist / Student** | `/artist/*` | จัดการพอร์ตโฟลิโอ, ส่งผลงานศิลปะตามภาคการศึกษา, ยืนยันการวางจำหน่าย |
| **Customer / User** | `/user/*` | สั่งซื้อผลงาน, ชำระเงิน, ติดตามคำสั่งซื้อ, ดูใบเสร็จและใบรับรอง |
| **Public Guest** | `/` | เยี่ยมชมนิทรรศการ, ค้นหาแคตตาล็อกผลงาน, อ่านข่าวสารประชาสัมพันธ์ |

---

## 📄 ใบอนุญาตและลิขสิทธิ์ (License)

สงวนลิขสิทธิ์ © 2024–2026 **ศูนย์ศิลปกรรมและนิทรรศการ มหาวิทยาลัยแม่ฟ้าหลวง (Mae Fah Luang University)**  
All Rights Reserved.
