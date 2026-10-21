# รายงานตรวจช่องโหว่ เส้นทาง UI และระบบสองภาษา

วันที่ตรวจ: 6 สิงหาคม 2026  
ขอบเขต: Vue 2 frontend, Vue Router, Vuex, Express API, JWT, UI บน `localhost:8080` และ API บน `localhost:8081`  
วิธีตรวจ: อ่านโค้ด, ตรวจ route/API, เปิดหน้าจริงแบบไม่ล็อกอิน, สลับ TH/EN และตรวจ console/runtime

## สรุปผู้บริหาร

พบปัญหาระดับวิกฤต 1 รายการ, สูง 4 รายการ, กลาง 5 รายการ และต่ำ 2 รายการ จุดเร่งด่วนที่สุดคือรหัสผ่านเก็บแบบ plaintext และ backend ตรวจเพียงว่ามี JWT แต่ไม่บังคับ role/ownership ทำให้ผู้ใช้ที่ล็อกอินทั่วไปมีโอกาสเรียก API ของ Admin หรือเข้าถึงข้อมูลของผู้อื่นได้ ระบบภาษาทำงานระดับโครงหน้า แต่ข้อมูลจากฐานข้อมูลและข้อความจำนวนมากใช้วิธีเขียนเงื่อนไขกระจายกว่า 1,500 จุด จึงเกิดภาษาไทย/อังกฤษปนกันจริง

## วิกฤต

### SEC-01 — รหัสผ่านเก็บและเปรียบเทียบแบบ plaintext

**สถานะ: แก้แล้วใน working tree** — บัญชีใหม่ใช้ `scrypt`; บัญชีเดิมถูกอัปเกรดเป็น hash อัตโนมัติเมื่อล็อกอินสำเร็จ และ field รหัสผ่านถูกซ่อนจาก query/response ปกติ

- ตำแหน่ง: `backend/server/Project/User/models/user.model.js:24`, `backend/server/Project/User/service/user.js:58`
- หลักฐาน: schema เก็บ `password` เป็น String และ login query ด้วย `{ studentId: username, password: password }`
- ผลกระทบ: ถ้าฐานข้อมูลหรือ backup รั่ว รหัสผ่านผู้ใช้ถูกอ่านได้ทันที และอาจถูกนำไปลองกับระบบอื่น
- แนวแก้: hash ด้วย `argon2id` หรือ `bcrypt`, migrate รหัสเดิม, บังคับ reset รหัสผ่าน และห้ามส่ง/บันทึกรหัสผ่านใน log

## สูง

### SEC-02 — JWT ตรวจตัวตน แต่ไม่ตรวจ role

- ตำแหน่ง: `backend/middleware/authMiddleware.js:15-17`
- หลักฐาน: middleware ทำเพียง `jwt.verify`, ใส่ `req.user` แล้ว `next()` ไม่มี `requireRole('Admin')`
- ผลกระทบ: Customer/Artist ที่มี token สามารถเรียก create/update/delete ของ Artwork, User, Order, Submission, News และ Settings ได้ หากรู้ endpoint
- แนวแก้: เพิ่ม authorization middleware แยก `Admin`, `Artist`, `Customer` และกำหนด policy ต่อ route

### SEC-03 — ไม่มี ownership check สำหรับข้อมูลส่วนบุคคลและคำสั่งซื้อ

- ตำแหน่ง: `backend/server/Project/Order/order.routes.js:8-15`, `backend/server/Project/User/user.routes.js:8,14-15`
- หลักฐาน: ผู้มี token เรียกดู Order ทั้งหมด, invoice/certificate ตาม ID, update/delete Order หรือ User ได้ โดย service ไม่จำกัด `user === req.user.userId`
- ผลกระทบ: ผู้ใช้หนึ่งรายอาจอ่านหรือแก้ข้อมูล คำสั่งซื้อ ที่อยู่ หลักฐานการโอนเงิน ใบแจ้งหนี้ และข้อมูลผู้ใช้รายอื่น
- แนวแก้: Admin ดูทั้งหมด; Customer ดู/แก้เฉพาะ record ตนเอง; Artist ดูเฉพาะผลงานตนเอง ตรวจ ownership ฝั่ง backend ทุกครั้ง

### SEC-04 — Category API เปลี่ยนข้อมูลได้โดยไม่ล็อกอิน

- ตำแหน่ง: `backend/server/Project/Artwork/artwork.routes.js:18-20`
- หลักฐาน: POST/PUT/DELETE `/category` ไม่มี `auth`
- ผลกระทบ: บุคคลภายนอกสร้าง แก้ หรือลบหมวดหมู่ ทำให้หน้าเว็บและ report เสียหาย
- แนวแก้: ใส่ `auth` และ `requireRole('Admin')`

### SEC-05 — HTML ข่าวแสดงด้วย `v-html` โดยไม่พบ sanitizer

- ตำแหน่ง: `frontend/src/views/page/NewsDetail.vue:14`, `frontend/src/views/Admin/components/modal/news/NewsViewModal.vue:38`
- หลักฐาน: HTML จากฐานข้อมูลถูกส่งเข้า `v-html` โดยตรง
- ผลกระทบ: ถ้าผู้โจมตีสร้าง/แก้ข่าวได้ จะเกิด stored XSS และขโมย token จาก `localStorage` ได้
- แนวแก้: sanitize ตอนรับเข้าและก่อน render ด้วย allowlist เช่น DOMPurify; เพิ่ม CSP; ห้าม script/event handler/URL อันตราย

## กลาง

### SEC-06 — Token อยู่ใน localStorage

- ตำแหน่ง: `frontend/src/store/modules/Authentication/index.js:69,121`
- ผลกระทบ: XSS อ่าน token และสวมสิทธิ์ผู้ใช้ได้
- แนวแก้: หลังปิด XSS แล้วพิจารณา short-lived access token ใน memory หรือ HttpOnly secure cookie พร้อม CSRF protection

### SEC-07 — API ข้อมูลบางชุดเปิดสาธารณะเกินจำเป็น

- ตำแหน่ง: `backend/server/Project/User/user.routes.js:9-10`, `backend/server/Project/Submission/submission.routes.js:9`, `backend/server/Project/Dashboard/dashboard.routes.js:6`
- หลักฐาน: user explore, submission list และ dashboard stats ไม่มี auth
- ผลกระทบ: อาจเปิดเผยรายชื่อนักศึกษา email สถานะ การมอบหมายงาน หรือสถิติภายใน
- แนวแก้: แยก public projection ที่ส่งเฉพาะชื่อ/รูป/ผลงาน กับ private endpoint สำหรับ Admin

### SEC-08 — Socket.io สะท้อน Origin พร้อม credentials

- ตำแหน่ง: `backend/server.js:20-24`
- หลักฐาน: `origin: true, credentials: true`
- ผลกระทบ: เว็บไซต์ต้นทางใดก็เชื่อม socket ได้ หาก event ภายหลังมีข้อมูลหรือคำสั่งสำคัญจะเสี่ยงข้าม origin
- แนวแก้: ใช้ allowlist เดียวกับ REST API และ authenticate socket handshake

### SEC-09 — CORS ยอมทุก Vercel preview และตรวจ localhost แบบ substring

- ตำแหน่ง: `backend/config/corsAndIP.js:16-21`
- หลักฐาน: `origin.endsWith('.vercel.app')` และ `origin.includes('localhost')`
- ผลกระทบ: deployment ที่ไม่ใช่ของโครงการอาจผ่าน allowlist; substring ไม่ใช่การตรวจ hostname ที่แข็งแรง
- แนวแก้: parse ด้วย `new URL(origin)` และเทียบ exact hostname จาก environment allowlist

### UI-01 — Redirect login ชี้ route ที่ไม่มีอยู่

- ตำแหน่ง: `frontend/src/service/api.js:49`, `frontend/src/router/index.js:115-205`
- หลักฐาน runtime: เปิด `/admin`, `/artist/profile`, `/user/profile` โดยไม่ล็อกอินแล้วไป `/#/pages/login` แต่ router ใช้ history modeและไม่มี `/pages/login`; ผลสุดท้ายเห็นหน้า Home
- ผลกระทบ: ผู้ใช้ไม่รู้ว่าต้องล็อกอิน, URL กับหน้าจอไม่ตรง, เกิด flash ของหน้าป้องกันก่อน API ตอบ 401
- แนวแก้: เพิ่ม route `/login` จริงหรือเปิด SignIn modal ผ่าน guard; ห้ามใช้ hash URL ใน history mode

## ต่ำ

### UI-02 — ไม่มี frontend route guard และหน้า 404

- ตำแหน่ง: `frontend/src/router/index.js`
- หลักฐาน: `/admin`, `/artist`, `/user` ไม่มี `meta`/`beforeEach`; ไฟล์ `router/middlewares/auth.js` ไม่ถูกใช้และ redirect ไป route `Pages` ที่ไม่มีจริง
- ผลกระทบ: UX กระพริบ/โหลด API ก่อนรู้ว่าไม่มีสิทธิ์ แม้ backend ต้องเป็นตัวบังคับสิทธิ์จริง
- แนวแก้: เพิ่ม guard เพื่อ UX, route 403/404 และคง authorization ฝั่ง backend

### UI-03 — ลิงก์ Privacy/Terms เป็น `#`

- หลักฐาน runtime: footer แสดง Privacy Policy และ Terms of Service แต่ไม่ไปหน้าเนื้อหา
- ผลกระทบ: ผู้ใช้กดแล้วไม่เกิดผล และเสี่ยงด้าน compliance
- แนวแก้: ทำ route/หน้าเนื้อหาจริงหรือซ่อนจนพร้อม

## ระบบภาษา TH/EN

### I18N-01 — ภาษาอังกฤษยังมีภาษาไทยปนจากข้อมูลจริง

- หลักฐาน runtime หน้า Home โหมด EN: ผลงาน `ผันแปร` และข่าวหลายรายการยังเป็นภาษาไทย
- สาเหตุ: record บางตัวไม่มีค่า `en`; `getName()` fallback ไปภาษาไทย
- แนวแก้: แสดง badge “ไม่มีคำแปล”, กำหนด field TH/EN เป็น required ตามชนิดข้อมูล และเพิ่มรายงาน record ที่ขาดคำแปล

### I18N-02 — ข่าวบางรายการเก็บ TH+EN ต่อกันใน value เดียว

- หลักฐาน runtime: description ข่าวโหมด EN แสดงย่อหน้าไทยแล้วต่อด้วยอังกฤษในข้อความเดียว
- ผลกระทบ: การสลับภาษาไม่สามารถแยกเนื้อหาได้
- แนวแก้: migration แยก `title/description` เป็น `{key:'th'}` และ `{key:'en'}` คนละค่า

### I18N-03 — ข้อความ UI กระจายอยู่ใน component มากเกินไป

- หลักฐาน static: 141 Vue files, ใช้ `$t()` เพียง 28 จุด แต่ตรวจ `$i18n.locale` 1,551 จุด
- ผลกระทบ: คำแปลไม่สม่ำเสมอ แก้คำหนึ่งต้องไล่หลายไฟล์ และมีโอกาสลืมภาษาใดภาษาหนึ่ง
- แนวแก้: ย้ายข้อความทั้งหมดเข้า `store/lang/en.js` และ `th.js`; component ใช้ `$t('...')` เท่านั้น

### I18N-04 — fallback เป็นภาษาไทยทุกกรณี

- ตำแหน่ง: `frontend/src/i18n.js:16`, `frontend/src/mixins/i18nMixin.js`
- ผลกระทบ: โหมด English แสดงไทยเงียบ ๆ ทำให้ดูเหมือนสลับภาษาเสีย
- แนวแก้: fallback UI key ใช้ภาษาหลักตามนโยบาย; content แสดงสถานะ missing translation แทน fallback แบบไม่แจ้ง

### I18N-05 — ภาษา UI กับรูปแบบวัน/ปีไม่เป็นนโยบายเดียวกัน

- หลักฐาน runtime: โหมด EN แสดงข่าววันที่แบบไทย `22 มิ.ย. 2569` ขณะที่ cohort แสดง `2026 AD`
- แนวแก้: สร้าง formatter กลาง `formatDate(date, locale)` และกำหนดชัดว่า TH ใช้ พ.ศ., EN ใช้ ค.ศ.

## ลำดับแก้แนะนำ

1. Hash password และบังคับ reset รหัสเดิม
2. เพิ่ม role/ownership middleware ทุก private API
3. ปิด Category mutation ที่ไม่ล็อกอิน
4. sanitize ข่าวและเพิ่ม CSP
5. แก้ `/login`, route guard, 403 และ 404
6. รวมข้อความเข้า `$t()` และ migration ข่าว/ผลงานที่ขาดคำแปล
7. จำกัด CORS/Socket.io และลดข้อมูล public projection

## ข้อจำกัดการตรวจ

- ทดสอบ UI แบบไม่ล็อกอินและตรวจโค้ดทุก role; ไม่ส่ง form หรือแก้ข้อมูล production
- ยังไม่ได้ทดสอบด้วยบัญชี Customer/Artist/Admin จริงครบทุก action เพราะการตรวจรอบนี้หลีกเลี่ยงการเปลี่ยนข้อมูล
- Security header ที่อาจตั้งจาก Vercel/Render/CDN ต้องยืนยันเพิ่มบน deployment จริง
