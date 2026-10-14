# Buddhist Art MFU (BAS) — AI Agent Operating Schema & Policy

> มหาวิทยาลัยแม่ฟ้าหลวง (Mae Fah Luang University)  
> ระบบจำหน่ายผลงานศิลปะพุทธศิลป์ มหาวิทยาลัยแม่ฟ้าหลวง (Buddhist Art MFU)

| รายการ | รายละเอียด |
| :--- | :--- |
| เวอร์ชันเอกสาร | 1.0.0 |
| วันที่จัดทำ | 14 ตุลาคม 2569 |
| สถานะ | Approved |
| จัดทำโดย | Software Architect / AI Agent Lead |

---

## 1. วัตถุประสงค์ (Purpose)

ไฟล์นี้กำหนดพฤติกรรมมาตรฐานของ AI Agent ภายในโครงการ **Buddhist Art MFU (BAS)**
Agent ทุกตัวที่ทำงานในรีโปนี้ (Antigravity, Gemini CLI, Claude Code, Cursor, Cline, Codex) ต้องอ่านและปฏิบัติตามกฎนี้ก่อนเริ่มงานทุกครั้ง

เป้าหมายหลัก:
- ลดการแก้ไขผิด scope และป้องกัน overengineering
- รักษาความเข้ากันได้ของระบบเดิม (Vue 2 + Express + Mongoose 5)
- ยึดมั่นกฎการแยก Package Manager (`backend: pnpm`, `frontend: npm`) และพอร์ตใช้งาน (`frontend: 8080`, `backend: 8081`)
- รองรับและปฏิบัติตามสัญญาทางธุรกิจ (Domain Contract) อย่างเคร่งครัด
- ตรวจสอบย้อนหลังได้ (Reproducibility & Auditability)

---

## 2. ลำดับความสำคัญของคำสั่ง (Priority Rules)

เมื่อมีข้อกำหนดหรือคำสั่งที่ขัดแย้งกัน ให้ใช้ลำดับความสำคัญดังนี้:

1. คำสั่งล่าสุดจากผู้ใช้ (Latest User Directives)
2. นโยบายความปลอดภัยและระบบ (System / Security Policy)
3. กฎใน `AGENTS.md` / `GEMINI.md`
4. มาตรฐานของโปรเจกต์ (`Design.md`, `system_specification.md`, `CLAUDE.md`)
5. พฤติกรรมเริ่มต้นของ Agent (Default Agent Behavior)

---

## 3. การตั้งค่าระบบเริ่มต้น (Default Configuration)

```yaml
language: TH
response_style: technical
response_length: medium
frontend_package_manager: npm
backend_package_manager: pnpm
local_ports:
  frontend: 8080
  backend: 8081
  mongodb: 27017
production_domain: bas.beta.mfu.ac.th
approval_required_for_critical_changes: true
auto_commit: false
auto_push: false
```

---

## 4. ภาพรวมสถาปัตยกรรมระบบ (System Architecture)

- **Frontend** (`/frontend`): Vue 2.6 + Vuex + Vue Router + CoreUI Pro (Options API, SCSS, Axios)
  - พอร์ต Local Dev: `8080` (`http://localhost:8080`)
  - รันคำสั่งด้วย: `npm` เท่านั้น (`npm run serve`, `npm run build`, `npm run test:unit`)
- **Backend** (`/backend`): Node.js + Express + Mongoose 5 + node-cron (CommonJS)
  - พอร์ต Local Dev: `8081` (`http://localhost:8081`)
  - รันคำสั่งด้วย: `pnpm` เท่านั้น (`pnpm start`, `pnpm test`, `pnpm test:coverage`)
- **Database**: MongoDB (Local `127.0.0.1:27017` หรือ MongoDB Atlas Replica Set)
- **Image Storage Policy**:
  - **ใช้ลิงก์ MFU Drive WebDAV ตลอดไป**: `https://mfudrive.mfu.ac.th/s/8AHrLgmZx9k6QPf`
  - Sharp Image Processing ใน `backend/server/Project/Submission/service/image.js` กำหนด:
    - `MAX_BYTES`: 50MB
    - `TIMEOUT_MS`: 45,000ms
    - `CACHE_MAX_BYTES`: 256MB
    - `limitInputPixels`: 150,000,000
- **Target Hosting / Deployment**:
  - โฮสต์ Beta: `192.168.11.90` (`uatenv`)
  - โดเมน: `https://bas.beta.mfu.ac.th`
  - Docker Compose: `docker-compose.production.yml` (Frontend พอร์ต `8082:80`, Backend พอร์ต `8081`)

---

## 5. สัญญาธุรกิจสำคัญ (Domain Contracts — Do Not Break)

1. **การเปลี่ยนสถานะนักศึกษา (Student Status Transition)**:
   - เมื่อกำหนดเวลาส่งผลงานสิ้นสุดลง หรือเมื่อมีการลงทะเบียนศิลปิน ทุก User ID ในอาเรย์ `artist` ของ Submission ต้องถูกเปลี่ยนสถานะ (`User.status`) จาก **NewStudent** (`นักศึกษาใหม่`) เป็น **OldStudent** (`นักศึกษาเก่า`)
   - สถานะถูกเก็บด้วย ObjectID ไม่ใช่ string
   - Logic นี้ต้องซิงค์กัน 3 จุดเสมอ:
     1. Query hooks (`onQuery`/`onQuerys`)
     2. Update hook (`onUpdate`)
     3. Cron job ใน `backend/server/crons/`
2. **บทบาทผู้ใช้งาน (User Roles)**:
   - รักษา 4 บทบาทหลัก: `Admin`, `Artist`, `Buyer`, `Public`
3. **ข้อเท็จจริงด้านความปลอดภัยในปัจจุบัน (Current Security Reality)**:
   - รหัสผ่านในฐานข้อมูลยังจัดเก็บแบบ plaintext
   - Auth ตรวจสอบ signature token แต่ยังไม่มี Role-Based Access Control / Ownership Check ที่สมบูรณ์ (IDOR risk)
   - ห้ามปิด auth หรือลบ logic การตรวจ token โดยพลการ

---

## 6. วินัยการพัฒนาแบบ Ponytail (Engineering Discipline)

ก่อนเขียนโค้ด ให้เดินตามบันได Ponytail และหยุดที่ขั้นแรกที่ตอบโจทย์:

```text
1. จำเป็นต้องมีหรือไม่?          → ไม่จำเป็น: ตัดทิ้งทันที (YAGNI)
2. มีอยู่แล้วใน codebase หรือไม่?   → มี: นำกลับมาใช้ซ้ำ ห้ามเขียนขึ้นใหม่
3. Standard Library ทำได้หรือไม่?  → ทำได้: ใช้ Native JS/Node API
4. Framework/Platform ทำได้หรือไม่?→ ทำได้: ใช้ Vue/Express/MongoDB query ในตัว
5. Dependency ที่ติดตั้งอยู่แล้วทำได้? → ทำได้: ใช้ package ที่มีอยู่ ห้ามลงเพิ่ม
6. เขียนบรรทัดเดียวจบได้หรือไม่?   → ได้: เขียนสั้นและกระชับ
7. หากจำเป็นจริง ๆ:              → เขียน implementation ที่สั้นที่สุดและ diff เล็กที่สุด
```

---

## 7. มาตรฐาน UI/UX (UI/UX Pro Max & CoreUI Pro)

- **Zero UI Disruption**: ห้ามเปลี่ยน Theme หลัก, Layout Grid, หรือ Class ของ CoreUI Pro โดยไม่ได้รับคำสั่ง
- **Accessibility (WCAG AA)**:
  - มี focus indicator เสมอ (`:focus-visible`)
  - Contrast ratio ของข้อความ ≥ 4.5:1
  - ใส่ `aria-label` ให้ icon button และ `aria-hidden="true"` ให้ decorative icons
- **Form & Table Ergonomics**:
  - รองรับ responsive table บนหน้าจอมือถือ
  - Touch-target size ขั้นต่ำ 44×44px สำหรับ mobile view

---

## 8. สิ่งที่ต้องทำก่อนเริ่มงาน (Mandatory Pre-Flight Checklist)

ก่อนแก้ไขหรือสร้างไฟล์ใหม่ทุกครั้ง:
1. อ่าน Requirement ของผู้ใช้ให้ครบถ้วน
2. สรุปเป้าหมายหลักของงาน
3. ตรวจสอบไฟล์และฟังก์ชันเดิมที่เกี่ยวข้อง
4. วิเคราะห์ผลกระทบ (Frontend, Backend, Database, Image Pipeline)
5. สรุปรายการไฟล์และแผนการแก้ไขสั้น ๆ

---

## 9. กฎความปลอดภัย (Security Rules)

- **ห้ามเปิดเผย Secrets** ในโค้ดหรือข้อความตอบกลับ
- **ห้าม commit ไฟล์ `.env`** หรือไฟล์ที่บรรจุ credentials ลง Git
- **ห้าม auto-commit หรือ auto-push** เว้นแต่ผู้ใช้จะสั่งชัดเจน
- ระมัดระวังเป็นพิเศษในจุด: Auth Token, File Upload/Download, Image Sharp Pipeline, User Permissions

---

## 10. รูปแบบการรายงานผล (Communication Format)

ทุกครั้งหลังทำงานเสร็จ ให้รายงานผลเป็น Markdown ภาษาไทยตามหัวข้อนี้:

1. **สิ่งที่ทำเสร็จแล้ว**: สรุปผลงานที่ลงมือทำจริง
2. **ไฟล์ที่แก้/สร้าง**: รายชื่อไฟล์ทั้งหมดที่เกี่ยวข้อง
3. **เหตุผลของการแก้**: อธิบายการออกแบบและเหตุผลทางเทคนิค
4. **วิธีตรวจสอบผล**: ขั้นตอนหรือคำสั่งที่ใช้ทดสอบ (พร้อม URL/Port ที่ทดสอบ)
5. **Remaining Risks / ข้อควรระวัง**: ความเสี่ยงที่อาจเหลืออยู่
6. **Next Steps**: งานที่แนะนำให้ทำต่อ

---

## 11. คลังทักษะในระบบ (Available Agent Skills in `.agents/skills/`)

ระบบนี้ได้รับการติดตั้ง Agent Skills ในไดเรกทอรี `.agents/skills/` ครอบคลุม:
- `dev`: ทักษะ Full-Stack สำหรับ Buddhist Art MFU (Vue 2 + Express + MongoDB + MFU Drive)
- `orchestrator`: ผู้นำทีมพัฒนา วางแผนงาน คุมวินัย Ponytail และแบ่งงาน
- `ponytail`: ตรวจจับและตัด boilerplate, overengineering, unneeded deps
- `bas-docker-deploy`: นำระบบขึ้นเซิร์ฟเวอร์ Beta MFU (`bas.beta.mfu.ac.th` / `192.168.11.90`)
- `ui-ux-pro-max`: วิเคราะห์และตรวจสอบ UI/UX, WCAG AA, Responsive Design
- `impeccable`: ปรับแต่งความประณีตของ Frontend UI และ Micro-interactions
- `code-review`: ตรวจสอบ Diff และ Code Quality
- `research`: สืบค้นข้อมูลเชิงลึกและสรุปองค์ความรู้
- `find-skills`: ค้นหาและติดตั้ง Skills ใหม่
