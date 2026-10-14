# Buddhist Art MFU (BAS) — Changelog & System Handover

> มหาวิทยาลัยแม่ฟ้าหลวง (Mae Fah Luang University)  
> ระบบจำหน่ายผลงานศิลปะพุทธศิลป์ มหาวิทยาลัยแม่ฟ้าหลวง (Buddhist Art MFU)

| รายการ | รายละเอียด |
| :--- | :--- |
| เวอร์ชันเอกสาร | 1.2.0 |
| วันที่จัดทำ | 14 ตุลาคม 2569 |
| สถานะ | Approved |
| จัดทำโดย | Software Architect / AI Engineering Lead |

---

## 1. ข้อมูลภาพรวมระบบสำหรับนักพัฒนาและ AI (System Primer)

เอกสารนี้รวบรวมประวัติการเปลี่ยนแปลงทั้งหมดของโครงการ **Buddhist Art MFU (BAS)** ตามมาตรฐาน [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) และ [Semantic Versioning](https://semver.org/spec/v2.0.0.html) เพื่อให้ทั้งนักพัฒนาใหม่ (Human Developers) และ AI Agents (Antigravity, Gemini, Claude, Cursor) สามารถทำความเข้าใจและสานต่องานได้อย่างราบรื่น

### สถาปัตยกรรมหลัก (Core Architecture)
- **Frontend** (`/frontend`):
  - Framework: Vue 2.6 (Options API) + Vuex + Vue Router + CoreUI Pro
  - Styling: SCSS, BootstrapVue / CoreUI
  - Package Manager: **`npm` เท่านั้น** (ห้ามใช้ pnpm หรือ yarn)
  - พอร์ต Local Dev: `8080` (`http://localhost:8080`)
  - คำสั่งหลัก: `npm run serve`, `npm run build`, `npm run test:unit`
- **Backend** (`/backend`):
  - Framework: Node.js 20 + Express 4 + Mongoose 5.13 + node-cron (CommonJS)
  - Package Manager: **`pnpm` เท่านั้น** สำหรับ Local Development
  - พอร์ต Local Dev: `8081` (`http://localhost:8081`)
  - คำสั่งหลัก: `pnpm start`, `pnpm test`, `pnpm test:coverage`
- **Database**:
  - MongoDB 6+ (Local `127.0.0.1:27017` หรือ MongoDB Atlas Replica Set)
- **Image Storage Policy**:
  - **แหล่งเก็บรูปภาพหลักถาวร**: MFU Drive WebDAV (`https://mfudrive.mfu.ac.th/s/8AHrLgmZx9k6QPf`)
  - ท่อประมวลผลรูปภาพ Sharp: รองรับไฟล์ภาพขนาดใหญ่ถึง 50MB, Pixel Limit 150 ล้านพิกเซล, Timeout 45,000ms
- **Beta Hosting & Server**:
  - Server IP: `192.168.11.90` (User: `uatenv`)
  - Domain: `https://bas.beta.mfu.ac.th` (พอร์ตภายใน `8082:80`)
  - Reverse Proxy: Host Nginx + Let's Encrypt Wildcard SSL

---

## 2. ประวัติการเปลี่ยนแปลง (Change History)

### [1.2.0] - 2026-10-14

#### Added (สิ่งที่เพิ่มใหม่)
- **AI Agent Workspace Policy**:
  - สร้าง [`AGENTS.md`](AGENTS.md) กำหนดมาตรฐานการทำงานของ AI ตามระเบียบมหาวิทยาลัยแม่ฟ้าหลวง
  - สร้าง [`GEMINI.md`](GEMINI.md) และ [`.agents/rules/project-rules.md`](.agents/rules/project-rules.md) สำหรับ Antigravity / Gemini CLI Workspace Rules
  - ปรับปรุง [`CLAUDE.md`](CLAUDE.md) ให้เชื่อมโยงกับเอกสารจริง
- **Agent Skills ชุดสมบูรณ์ (`.agents/skills/`)**:
  - ปรับแต่ง [`.agents/skills/dev/SKILL.md`](.agents/skills/dev/SKILL.md) ให้ตรงกับ Stack ของ Buddhist Art MFU โดยเฉพาะ
  - เพิ่ม [`.agents/skills/bas-docker-deploy/SKILL.md`](.agents/skills/bas-docker-deploy/SKILL.md) สำหรับขั้นตอนการ Deploy ขึ้นโฮสต์ Beta
  - ติดตั้งและรองรับทักษะสำคัญ เช่น `orchestrator`, `ponytail`, `ui-ux-pro-max`, `impeccable`, `code-review`, `find-skills` (รวม 28 ทักษะ)
- **Automated Deployment Script**:
  - สร้าง [`scripts/deploy-docker-server.sh`](scripts/deploy-docker-server.sh) สำหรับซิงค์โค้ดด้วย rsync และ Deploy คอนเทนเนอร์บนเซิร์ฟเวอร์ `192.168.11.90` แบบอัตโนมัติ พร้อมระบบตรวจเช็คสุขภาพ (Multi-layer Verification)

#### Changed (สิ่งที่ปรับปรุง)
- **MFU Drive WebDAV Image Storage Integration**:
  - บันทึกลิงก์ MFU Drive ลงใน `.env` และ `.env.production`
  - ทำการแมปและอัปเดตข้อมูลลิงก์รูปภาพผลงานศิลปะในฐานข้อมูล MongoDB Atlas ทั้ง 34 ชิ้น เข้ากับ MFU Drive WebDAV ครบ 100%
  - อัปเกรดขีดจำกัดของ Sharp Image Processing ใน [`backend/server/Project/Submission/service/image.js`](backend/server/Project/Submission/service/image.js):
    - `MAX_BYTES`: 10MB $\rightarrow$ 50MB
    - `TIMEOUT_MS`: 15,000ms $\rightarrow$ 45,000ms
    - `CACHE_MAX_BYTES`: 64MB $\rightarrow$ 256MB
    - `limitInputPixels`: 40,000,000 $\rightarrow$ 150,000,000
- **Frontend Nginx Proxy Configuration**:
  - ปรับปรุง [`frontend/nginx.conf`](frontend/nginx.conf) เพิ่ม Reverse Proxy สำหรับ `/api/` และ `/socket.io/` ไปยัง Backend container และขยาย `client_max_body_size` เป็น 50M
- **Git Tracking Policy**:
  - ปรับปรุง [`.gitignore`](.gitignore) ให้ยอมรับการ commit โฟลเดอร์ `.agents/skills/` และ `.agents/rules/` เพื่อแชร์ทักษะกับทีมงานได้

#### Fixed (สิ่งที่แก้ไข)
- **Docker Production Build Stability**:
  - แก้ไข [`backend/Dockerfile`](backend/Dockerfile) ให้ใช้ `npm --legacy-peer-deps` เพื่อหลีกเลี่ยงข้อผิดพลาด `ERR_PNPM_IGNORED_BUILDS` จาก pnpm v10 สำหรับโมดูล Sharp และ Puppeteer
  - แก้ไข [`frontend/Dockerfile`](frontend/Dockerfile) เพิ่มแฟล็ก `--ignore-scripts` เพื่อป้องกันปัญหากระบวนการ build ค้างจากการดาวน์โหลด browser driver ในขั้นตอน npm install
- **รูปภาพแสดงผลไม่ขึ้น**:
  - แก้ปัญหาภาพขนาดใหญ่ (10–17MB) ที่เดิมดาวน์โหลดไม่ผ่านหรือติดขีดจำกัดหน่วยความจำ ให้สามารถสตรีมผ่านท่อ Sharp ได้อย่างสมบูรณ์แบบ (HTTP 200 OK)

#### Removed (สิ่งที่ตัดทิ้งเพื่อลดความซับซ้อน)
- ลบไฟล์ Bloat และ Mock data เกินจำเป็นจำนวน 56,045 บรรทัด:
  - `frontend/package-lock.json` ที่ซ้ำซ้อน
  - Dockerfiles เก่า: `Dockerfile.mac`, `Dockerfile.prod`
  - ไฟล์ PDF ทดสอบ: `public/output/TEST_COMPLETE_CERTIFICATE.pdf`
  - สคริปต์ Mock Certificates เก่า 5 ไฟล์: `backend/generate_mock_cert*.js`
  - ลบ Git Worktree ที่ตกค้าง (`halfbeak/`)

---

### [1.1.0] - 2026-08-29

#### Added
- คอนฟิกการใช้งาน Docker ในสภาพแวดล้อมจริง: [`docker-compose.production.yml`](docker-compose.production.yml) แยกเครือข่าย `buddhist-art-network`
- กำหนดค่าพอร์ตสาธารณะ `8082:80` เชื่อมโยงกับ Host Nginx ของเซิร์ฟเวอร์ UAT/Beta
- สัญญาณตรวจสุขภาพ (Healthcheck): `/healthz` บน Backend และ HTTP 200 บน Frontend

#### Changed
- ปรับเปลี่ยนระบบยืนยันตัวตนหลักเป็น Google OAuth (Google Identity Services)
- ปรับปรุง Endpoint `/api/v1/google/auth` ให้ใช้การตรวจสอบ Google ID Token ผ่าน `GOOGLE_CLIENT_ID`

#### Removed
- ปิดและนำเส้นทางยืนยันตัวตนแบบดั้งเดิม (Legacy IAM / Local Password Login / Dev Admin) ออกจาก Production router

---

### [1.0.0] - 2026-08-28

#### Added
- ระบบจัดการผลงานศิลปะพุทธศิลป์ มหาวิทยาลัยแม่ฟ้าหลวง (BAS)
- โมดูลการรับส่งผลงาน (Submission), การจัดการศิลปิน (Artist), และระบบคัดกรองผลงาน
- การซื้อขายผลงานรอบ Post-Term Sale
- สัญญาทางธุรกิจสำคัญ (Domain Contract):
  - การเปลี่ยนสถานะนักศึกษาจาก `NewStudent` (`นักศึกษาใหม่`) เป็น `OldStudent` (`นักศึกษาเก่า`) อัตโนมัติเมื่อสิ้นสุดกำหนดส่งผลงานหรือลงทะเบียนศิลปิน
- ระบบออกใบประกาศนียบัตรดิจิทัลผ่าน `pdf-lib`

---

## 3. คู่มือการส่งต่องานสำหรับนักพัฒนา (Developer Handover Guide)

### สิ่งที่ต้องมีก่อนเริ่มงาน (Prerequisites)
1. **Node.js**: เวอร์ชัน 20.x
2. **Package Managers**:
   - `npm`: ติดตั้งมากับ Node.js (ใช้สำหรับ `frontend/`)
   - `pnpm`: ติดตั้งผ่าน `npm install -g pnpm` (ใช้สำหรับ `backend/`)
3. **MongoDB**: รัน Local MongoDB บนพอร์ต `27017` หรือเชื่อมต่อ MongoDB Atlas

### ขั้นตอนการรันระบบบนเครื่อง Local (Run Localhost)
```bash
# 1. รัน Backend (พอร์ต 8081)
cd backend
pnpm install
pnpm start

# 2. รัน Frontend ในอีกหน้าต่าง Terminal (พอร์ต 8080)
cd frontend
npm install --legacy-peer-deps
npm run serve
```
- Frontend เข้าใช้งานได้ที่: `http://localhost:8080`
- Backend เข้าใช้งานได้ที่: `http://localhost:8081`
- สุขภาพ Backend ตรวจสอบได้ที่: `http://localhost:8081/healthz`

### ขั้นตอนการ Deploy ขึ้น Beta Server (`bas.beta.mfu.ac.th`)
เมื่อแก้ไขโค้ดและทดสอบ Local เสร็จเรียบร้อย ให้ใช้สคริปต์อัตโนมัติ:
```bash
./scripts/deploy-docker-server.sh
```
สคริปต์จะทำการ:
1. ตรวจสอบ Git SHA ล่าสุด
2. Sync โค้ดและ `.env.production` ไปยัง `/opt/buddhist-art-mfu/releases/<SHA>`
3. Build Docker images และรัน Compose บนเซิร์ฟเวอร์ `192.168.11.90`
4. ตรวจสอบ Health Checks และแสดงผลสรุปสถานะ

---

## 4. ข้อกำหนดที่ห้ามละเมิดเด็ดขาด (Rules That Must Not Be Broken)

1. **ห้ามสลับ Package Manager**:
   - Backend ต้องใช้ `pnpm` เท่านั้น
   - Frontend ต้องใช้ `npm` เท่านั้น
2. **ห้ามเปลี่ยนแหล่งเก็บรูปภาพ**:
   - ใช้ MFU Drive WebDAV (`https://mfudrive.mfu.ac.th/s/8AHrLgmZx9k6QPf`) ตลอดไป
3. **รักษาสัญญาการเปลี่ยนสถานะนักศึกษา (Student Status Transition)**:
   - Logic การสลับ `NewStudent` $\rightarrow$ `OldStudent` ต้องซิงค์กัน 3 จุดเสมอ:
     1. Query Hooks (`onQuery`/`onQuerys`)
     2. Update Hook (`onUpdate`)
     3. Cron Job ใน `backend/server/crons/`
4. **ห้าม Hardcode Credentials หรือ Commit ไฟล์ `.env`**:
   - เก็บข้อมูลความลับใน `.env` / `.env.production` ฝั่ง Local และ Server เท่านั้น
