---
title: "ข้อกำหนดขอบเขตของงาน (TOR) ระบบ Buddhist Art MFU"
author: "Buddhist Art MFU"
date: "18 สิงหาคม 2569"
lang: th
---

# ข้อกำหนดขอบเขตของงาน (Terms of Reference: TOR)
## ระบบบริหารจัดการและจัดแสดงผลงานพุทธศิลป์ มหาวิทยาลัยแม่ฟ้าหลวง
### ฉบับระบบปัจจุบันและฟีเจอร์การขายหลังครบ 1 ปี

![หน้าแรกของระบบ Buddhist Art MFU](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/pub_01_home_a.jpg)

> จัดทำจากการตรวจ source code, API, database model, workflow, test suite และหน้าจอจริง
> วันที่จัดทำ: 18 สิงหาคม 2569

# คำนำ

เอกสารข้อกำหนดขอบเขตของงาน (Terms of Reference: TOR) ฉบับนี้จัดทำขึ้นเพื่ออธิบายขอบเขต ความสามารถ และข้อกำหนดของระบบบริหารจัดการและจัดแสดงผลงานพุทธศิลป์ มหาวิทยาลัยแม่ฟ้าหลวง ให้ผู้บริหาร ผู้ดูแลระบบ ศิลปิน ผู้ซื้อ และผู้พัฒนาระบบใช้เป็นเอกสารอ้างอิงร่วมกัน

เนื้อหาครอบคลุมการทำงานของเว็บไซต์สาธารณะ พอร์ทัลศิลปิน งานของผู้ซื้อและคำสั่งซื้อ แผงควบคุมผู้ดูแลระบบ การจัดการผู้ใช้ ผลงาน ข่าวสาร การส่งผลงาน การอนุมัติ การรับชำระเงิน/หลักฐาน และกติกาใหม่เรื่อง “การขายหลังครบ 1 ปี” รวมถึงข้อกำหนดด้านข้อมูล API ความปลอดภัย การตรวจสอบย้อนหลัง และการทดสอบ

ภาพหน้าจอในเอกสารมาจากการ capture ระบบจริงใน local environment ของโครงการ โดยใช้เป็นหลักฐานประกอบการอธิบาย UI และ workflow ไม่ใช่ภาพ mockup หากข้อมูลทดสอบไม่มีรายการในบางสถานะ จะระบุข้อจำกัดไว้ในคำบรรยายภาพและภาคผนวก

สถานะเอกสาร
ใช้เป็น TOR เชิงระบบและเอกสารส่งมอบเชิงเทคนิค โดยแยก “ฟังก์ชันที่ตรวจพบในระบบปัจจุบัน” ออกจาก “ข้อกำหนดที่ต้องยืนยันเชิงธุรกิจ/นโยบาย” เพื่อไม่ตีความเกินหลักฐาน

# สารบัญ

คำนำ

บทสรุปผู้บริหาร

1. หลักการและเหตุผล

2. วัตถุประสงค์

3. ขอบเขตงานและภาพรวมสถาปัตยกรรม

4. กลุ่มผู้ใช้งานและสิทธิ์

5. ข้อกำหนดด้านฟังก์ชัน

5.1 เว็บไซต์สาธารณะและแคตตาล็อก

5.2 บัญชีผู้ใช้และการยืนยันตัวตน

5.3 Artist portal และ Submission

5.4 Admin dashboard และการจัดการข้อมูล

5.5 Cart, Order, Payment และ Certificate

5.6 ข่าวสาร หมวดหมู่ และข้อมูลอ้างอิง

5.7 การขายหลังครบ 1 ปี

5.8 การแจ้งเตือนและงานอัตโนมัติ

6. ข้อกำหนดด้าน UI/UX และภาพหน้าจอจริง

7. ข้อกำหนดด้านข้อมูลและ API

8. Workflow และกติกาธุรกิจ

9. ข้อกำหนดที่ไม่ใช่ฟังก์ชัน

10. ความปลอดภัยและการตรวจสอบย้อนหลัง

11. แผนการทดสอบและเกณฑ์ยอมรับ

12. การติดตั้ง ปฏิบัติการ และบำรุงรักษา

13. ผลส่งมอบและเกณฑ์การรับมอบ

14. สมมติฐาน ข้อจำกัด และรายการที่ต้องยืนยัน

ภาคผนวก ก–จ

หมายเหตุ: รายการสารบัญจัดทำตามหัวข้อ Heading ของเอกสาร เลขหน้าจะเปลี่ยนตามการจัดหน้า/การเปิดไฟล์ใน Word และสามารถสร้างสารบัญ field เพิ่มได้หากหน่วยงานต้องการเลขหน้าอัตโนมัติ

# บทสรุปผู้บริหาร

ระบบ Buddhist Art MFU เป็นแพลตฟอร์มดิจิทัลสำหรับรวบรวม อนุรักษ์ จัดแสดง และจำหน่ายผลงานพุทธศิลป์/ศิลปะร่วมสมัยของมหาวิทยาลัยแม่ฟ้าหลวง ทำงานแบบเว็บแอปพลิเคชัน แบ่งส่วนหลักเป็น public catalog, artist portal, customer dashboard และ admin dashboard

ประเด็นสำคัญของ TOR ฉบับนี้คือการทำให้สิทธิ์ขายของผลงานที่มาจาก Submission มีวงจรเริ่มต้น 1 ปีนับจากวันและเวลาปิด Submission ตามเวลา Asia/Bangkok เมื่อครบกำหนด ศิลปินเลือก “วางขายต่อแบบปกติ” หรือ “แสดงเฉย ๆ” ได้ แอดมินบันทึกแทนได้เมื่อมีช่องทางติดต่อและหมายเหตุ ระบบต้องปิดคำสั่งซื้อใหม่เมื่อยังไม่มีคำตอบหรือเลือกแสดงเฉย ๆ แต่ให้รายการจองเดิมดำเนินต่อจนจบ

| มิติ | ข้อกำหนด/ผลลัพธ์ |
| --- | --- |
| ผู้ใช้งาน | Admin, Artist, Public/Customer พร้อมสิทธิ์ตามบทบาทและ owner check |
| แหล่งข้อมูล | MongoDB/Mongoose; Artwork เชื่อม Submission ผ่าน submissionArtworkId และ postTermSale |
| ช่องทาง | เว็บไซต์สาธารณะ, Artist portal, Admin dashboard, REST API และงาน cron |
| การซื้อ | ตรวจสิทธิ์ซื้อซ้ำที่ backend ตอนสร้าง order; frontend ซ่อนปุ่มเป็นเพียงการช่วยนำทาง |
| การตรวจสอบ | Jest backend 9 suites/42 tests ผ่าน และ frontend production build ผ่าน ณ วันที่จัดทำ |

# 1. หลักการและเหตุผล

หน่วยงานมีผลงานศิลปะจากการส่งผลงาน (Submission) จำนวนมาก ซึ่งมีเงื่อนไขการเปิดขายในช่วงเริ่มต้น 1 ปี หลังจากนั้นศิลปินอาจประสงค์ให้จำหน่ายต่อหรือให้คงไว้เพื่อการจัดแสดงเท่านั้น หากไม่มี workflow ที่ชัดเจน อาจเกิดการขายเกินสิทธิ์ ข้อมูลหน้าเว็บไม่ตรงกับสิทธิ์จริง การแจ้งเตือนไม่ครบ หรือการยกเลิกรายการจองแล้วทำให้สถานะกลับมาเปิดขายโดยไม่ตั้งใจ

จึงกำหนดโมเดล postTermSale เป็นแหล่งข้อมูลสิทธิ์ซื้อหลักที่แยกจาก Sale Status เดิม เพื่อให้ระบบบริหาร lifecycle, decision, effective time, audit history, notification และการตรวจสิทธิ์ในจุดสร้างคำสั่งซื้อได้อย่างเป็นระบบ

# 2. วัตถุประสงค์

- จัดทำคลังผลงานและเว็บไซต์สาธารณะสำหรับค้นหา ดูรายละเอียด และแสดงสถานะการขาย/จัดแสดง
- สนับสนุนศิลปินส่งผลงาน แก้ไขข้อมูลผลงานของตนเอง และติดตามสถานะการพิจารณา
- ให้แอดมินตรวจ อนุมัติ มอบหมายงาน จัดการผลงาน ผู้ใช้ ข่าวสาร คำสั่งซื้อ และข้อมูลอ้างอิง
- ควบคุมสิทธิ์การซื้อผลงานหลังครบ 1 ปีตามความประสงค์ โดยมีหลักฐานการตัดสินใจและ audit trail
- ให้ข้อมูลพร้อมใช้งานบน desktop/mobile รองรับ keyboard และไม่ใช้สีเป็นตัวบอกสถานะเพียงอย่างเดียว
# 3. ขอบเขตงานและภาพรวมสถาปัตยกรรม

ขอบเขตประกอบด้วย frontend Vue 2.6/Options API, Vue Router, Vuex, CoreUI Pro Vue, i18n ภาษาไทย/อังกฤษ, backend Node.js/Express, MongoDB/Mongoose, Socket.io และบริการประมวลผลภาพ/PDF/QR ตามโมดูลที่มีใน repository

| ชั้นระบบ | เทคโนโลยี/หน้าที่ | หลักฐานในโครงการ |
| --- | --- | --- |
| Presentation | Vue.js, CoreUI, responsive layout, i18n | frontend/src/views, containers, assets |
| State/API | Vuex modules, Axios service, socket client | frontend/src/store, frontend/src/service |
| Business/API | Express routes, auth middleware, service layer | backend/server/Project/*, middleware |
| Data | MongoDB + Mongoose schemas | backend/server/Project/*/models |
| Jobs | node-cron; deadline/timeout/idempotent processing | backend/server/crons |
| Media/Document | Sharp, Puppeteer, PDF/QR/certificate | backend dependencies and services |

# 4. กลุ่มผู้ใช้งานและสิทธิ์

| บทบาท | สิทธิ์หลัก | ข้อจำกัด/การตรวจสอบ |
| --- | --- | --- |
| Admin | ดู dashboard; CRUD ผู้ใช้/ผลงาน/ข่าว/Submission/Order; อนุมัติ; บันทึกความประสงค์แทนศิลปิน; import/export | ต้องผ่าน auth + role admin; การบันทึกแทนต้องระบุ contactMethod/note และเก็บ audit |
| Artist | จัดการ profile; สร้าง/แก้ไข submission; ดูผลงานของตน; เลือกขายต่อ/แสดงเฉย ๆ | owner check; ปีแรกแก้ข้อมูลได้แต่เปลี่ยนสถานะขายเองไม่ได้; ต้องยืนยันความประสงค์ |
| Customer/Public | ค้นหา/กรอง/ดู artwork, artist, news; cart/checkout/payment; ดู order/profile | สร้าง order ได้เฉพาะผลงานที่ backend ตรวจว่า purchasable; เข้าหน้าส่วนตัวต้อง login |
| Evaluator/ผู้มอบหมาย | เส้นทางตาม role ที่กำหนดสำหรับงานประเมิน/assignment | เข้าถึงเฉพาะ route และข้อมูลตาม middleware/owner policy |

# 5. ข้อกำหนดด้านฟังก์ชัน

ข้อกำหนดในหมวดนี้ใช้คำว่า “ระบบต้อง” สำหรับ acceptance requirement และคำว่า “ตรวจพบ” สำหรับความสามารถที่มีอยู่ใน source code/หน้าจอที่สำรวจ

## 5.1 เว็บไซต์สาธารณะและแคตตาล็อก

- หน้าแรกแสดง hero/branding, ผลงานเด่น, หมวดหมู่, กิจกรรม/ข่าวสาร และข้อมูลติดต่อหน่วยงาน
- หน้า Artworks แสดงรายการแบบ card พร้อมค้นหาชื่อผลงาน/ศิลปิน กรองหมวดหมู่ และกรองช่วงราคา
- หน้า Artwork Detail แสดงภาพ รายละเอียด ศิลปิน สถานะผลงาน ราคา ปุ่มเพิ่มตะกร้า และลิงก์โปรไฟล์ศิลปินเมื่อข้อมูลพร้อม
- หน้า Artist Public Profile แสดงข้อมูลศิลปินและผลงานที่เผยแพร่
- หน้า News/News Detail, Contact, Privacy/Terms และ System Message รองรับการเข้าถึงจากเมนูสาธารณะ
- รองรับภาษาไทย/อังกฤษผ่าน Vue I18n และต้องมี accessible name/alt text สำหรับภาพและปุ่มสำคัญ
## 5.2 บัญชีผู้ใช้และการยืนยันตัวตน

- เข้าสู่ระบบด้วย credential ที่ระบบกำหนด และรองรับ Google OAuth2/Active Directory ตาม configuration ที่มี
- เก็บ session/token ใน local storage ตาม convention เดิม พร้อม router guard สำหรับ route ที่ต้อง login และ role
- ผู้ใช้แก้ไข profile และรูปโปรไฟล์ได้ตามสิทธิ์; ระบบต้องตรวจ owner ก่อนบันทึกข้อมูล
- รองรับการส่ง/ตรวจ OTP หรือ verification data ตาม Settings และบริการที่เปิดใช้
## 5.3 Artist portal และ Submission

- ศิลปินสร้าง Submission ระบุชื่อรุ่น/หลักสูตร วันเวลาเปิด-ปิด ผู้เข้าร่วม และอัปโหลดภาพผลงาน
- ศิลปินดูรายการ Submission, รายละเอียด, progress, สถานะเปิด/ปิด และรายการผลงานที่อยู่ใน submission
- แก้ไขรายละเอียดผลงานของตนเองได้ โดยไม่ข้าม owner check; ปีแรกแก้ข้อมูล metadata ได้แต่ห้ามเปลี่ยนสิทธิ์ขายเอง
- ระบบสร้าง Artwork จาก Submission ตอนอนุมัติ พร้อมคำนวณ initialSaleEndsAt = create.endAt + 1 calendar year ในเวลา Asia/Bangkok
- ถ้าหา Submission หรือ create.endAt ไม่ได้ ให้ตั้ง needsReview, หยุดขาย และเข้าคิว “ต้องตรวจสอบวันครบกำหนด”
- แสดง notice ให้ศิลปินเลือก “วางขายต่อแบบปกติ” หรือ “แสดงเฉย ๆ” พร้อม checkbox ยืนยันและส่งอีเมลยืนยัน
## 5.4 Admin dashboard และการจัดการข้อมูล

| หน้าจอ/โมดูล | ฟังก์ชันที่ต้องรองรับ |
| --- | --- |
| Overview/Analytics | สรุปจำนวนผู้ใช้ ผลงาน Submission Order และกราฟ/กิจกรรมที่ระบบเก็บได้ |
| Artworks | ค้นหา ดูรายละเอียด เพิ่ม/แก้ไข/ลบ อัปโหลดภาพ จัดหมวดหมู่ import/export และเปลี่ยนสถานะ |
| Submissions | ดูรายการ/ตัวกรอง/ช่วงเวลา progress รายละเอียด มอบหมายงาน อนุมัติ/ปิด/ลบ และแท็บจัดการการขายหลังครบ 1 ปี |
| Orders | ค้นหา ดูสถานะคำสั่งซื้อ หลักฐานการชำระเงิน ใบแจ้งหนี้/ใบรับรอง และอัปเดตสถานะตาม workflow |
| Users Management | สร้าง แก้ไข ลบ เปิด/ปิดผู้ใช้ import/export template และ map Artist ID |
| News | สร้าง แก้ไข ลบ อัปโหลดภาพ ดูจำนวนการเข้าชม และเผยแพร่ข่าวสาร |

## 5.5 Cart, Order, Payment และ Certificate

- เพิ่มผลงานลง cart ตรวจจำนวน/ความพร้อม และหมดเวลาตะกร้าตาม job ที่กำหนด
- สร้าง order พร้อมข้อมูลผู้ซื้อ ที่อยู่ รายการผลงาน ราคา และหลักฐานการชำระเงิน
- แสดงขั้นตอน payment/bill และดาวน์โหลด invoice/certificate ตามสิทธิ์
- เมื่อ order สำเร็จให้ป้องกันการขายซ้ำ/อัปเดต Sale Status และส่งข้อมูล real-time เมื่อมี socket event
- หากรายการจองเดิมถูกยกเลิกหลังครบสิทธิ์ ต้องคืนเป็น Exhibition เมื่อสิทธิ์หมด ไม่ใช่ Available
## 5.6 ข่าวสาร หมวดหมู่ และข้อมูลอ้างอิง

- จัดการ category ของ Artwork และใช้ category ใน filter/search
- จัดการ News พร้อมภาพหลายภาพตาม upload limit และมีหน้า list/detail สาธารณะ
- จัดการ Settings: message, group, status, verification, role และ storage ตาม endpoint ที่มี
- รองรับการเพิ่มข้อมูลผ่าน Excel template เมื่อเปิดใช้ในหน้าผู้ดูแลระบบ และต้องรายงานแถวที่ผิดพลาดให้ตรวจสอบได้
## 5.7 การขายหลังครบ 1 ปี (Post-term sale management)

หลักการคำศัพท์
ใช้คำว่า “การขายหลังครบ 1 ปี” ไม่ใช้คำว่า “ต่อสัญญา” บน UI/notification เพื่อสื่อว่าเป็นความประสงค์ในการจำหน่ายหลังครบกำหนด ไม่ใช่การบังคับทำสัญญาใหม่

| หัวข้อ | ข้อกำหนดที่ต้องส่งมอบ |
| --- | --- |
| วันครบกำหนด | นับจาก Submission.create.endAt เป็นปีปฏิทินเดียวกันใน Asia/Bangkok; ก่อนหมดอายุยังขายได้ |
| ทางเลือก | continue_sale → standard_sale ขายต่อไม่มีกำหนด; display_only → คงในพอร์ตแต่ซ่อนราคา/ตะกร้า/ปุ่มซื้อ |
| ไม่ตอบ | เมื่อครบกำหนดปิดคำสั่งซื้อใหม่อัตโนมัติและแสดง Display only; reservation เดิมจบต่อได้ |
| การแจ้งเตือน | ส่งล่วงหน้า 30 วัน, 7 วัน และวันครบกำหนด แบบ idempotent ครั้งเดียวต่อช่วง |
| Admin queue | แท็บพร้อม counters: ใกล้ครบ 30 วัน, รอคำตอบ, ขายต่อ, แสดงเฉย ๆ; filter ตามสถานะและวัน |
| การบันทึกแทน | Admin เลือกหลายผลงานของศิลปินเดียวได้; ระบุ contactMethod (โทรศัพท์/อีเมล/พบด้วยตนเอง) และ note |
| หลังหมดอายุ | Artist/Admin เปลี่ยนระหว่าง standard_sale และ display_only ได้เหมือน Artwork ทั่วไป และ push history ทุกครั้ง |
| ความปลอดภัย | ใช้ owner/admin authorization และ compare-and-set ป้องกันการกดซ้ำ; backend guard ตอนสร้าง order |

สถานะหลัก: initial_term = ยังอยู่ในปีแรก, standard_sale = วางขายต่อแบบปกติ, display_only = แสดงเฉย ๆ; decision: pending, continue_sale, display_only. Sale Status เดิม Available/Exhibition/Sold Out ยังคงใช้ แต่ postTermSale เป็นแหล่งข้อมูลสิทธิ์ซื้อหลัก

## 5.8 การแจ้งเตือนและงานอัตโนมัติ

- cron postTermSaleDeadline ประมวลผล reminder และ transition เมื่อถึงเวลา โดยใช้ sentAt/compare-and-set ให้รันซ้ำได้โดยไม่ส่งซ้ำ
- cron cartTimeout ตรวจ reservation/cart และคืนสถานะตาม effective mode ของ postTermSale
- ส่งอีเมลยืนยันกลับศิลปินหลังการบันทึกความประสงค์ และใช้ข้อความเดียวกันกับ UI เท่าที่ทำได้
- บันทึก history พร้อม recordedBy/recordedAs/effectiveAt และรายละเอียดช่องทางติดต่อ
# 6. ข้อกำหนดด้าน UI/UX และภาพหน้าจอจริง

UI ต้องใช้งานได้ทั้ง desktop/mobile มี focus state, keyboard navigation, label และ feedback ของ loading/success/error ทุก action ตารางต้องมี empty state และไม่ใช้สีเป็นความหมายเดียว โดยใช้ข้อความ/ไอคอน/aria-label ร่วมด้วย

ภาพต่อไปนี้เป็นหลักฐานหน้าจอจริงจาก local application และชุด capture เดิมใน repository; ภาพหน้าจอใช้เพื่ออธิบายองค์ประกอบ/flow ไม่ได้แทน acceptance test ของข้อมูลจริง

![ภาพที่ 1 Admin — รายการ Submission และการค้นหา/กรองงาน](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/08_admin_submissions.jpg)

*ภาพที่ 1  Admin — รายการ Submission และการค้นหา/กรองงาน
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพเพิ่มเติม Admin — จัดการการขายหลังครบ 1 ปี (เวอร์ชันปัจจุบัน)](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/admin_post_term_queue.jpg)

*ภาพเพิ่มเติม: Admin — จัดการการขายหลังครบ 1 ปี (เวอร์ชันปัจจุบัน)*

![ภาพที่ 2 Admin — รายการจัดการผลงานศิลปะ](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/admin_02_artworks.jpg)

*ภาพที่ 2  Admin — รายการจัดการผลงานศิลปะ
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพที่ 3 Admin — Dashboard ภาพรวม](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/admin_01_overview_a.jpg)

*ภาพที่ 3  Admin — Dashboard ภาพรวม
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพที่ 4 Admin — รายละเอียด Submission/การมอบหมายงาน](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/admin_04_submission_detail.jpg)

*ภาพที่ 4  Admin — รายละเอียด Submission/การมอบหมายงาน
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพที่ 5 Admin — รายการคำสั่งซื้อ](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/admin_05_orders.jpg)

*ภาพที่ 5  Admin — รายการคำสั่งซื้อ
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพที่ 6 Admin — จัดการผู้ใช้งาน](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/admin_06_users.jpg)

*ภาพที่ 6  Admin — จัดการผู้ใช้งาน
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพที่ 7 Admin — จัดการข่าวสาร](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/admin_07_news.jpg)

*ภาพที่ 7  Admin — จัดการข่าวสาร
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพที่ 8 Admin — Modal สร้าง/นำเข้าผลงาน](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/admin_08_artwork_create_modal.jpg)

*ภาพที่ 8  Admin — Modal สร้าง/นำเข้าผลงาน
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพที่ 9 Artist — โปรไฟล์และผลงานของศิลปิน](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/artist_01_profile_a.jpg)

*ภาพที่ 9  Artist — โปรไฟล์และผลงานของศิลปิน
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพที่ 10 Artist — รายการ Submission](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/artist_02_submissions.jpg)

*ภาพที่ 10  Artist — รายการ Submission
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพที่ 11 Artist — รายละเอียด Submission](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/artist_03_submission_detail.jpg)

*ภาพที่ 11  Artist — รายละเอียด Submission
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพที่ 12 Customer — ประวัติคำสั่งซื้อ](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/cust_02_orders.jpg)

*ภาพที่ 12  Customer — ประวัติคำสั่งซื้อ
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพที่ 13 Public — หน้าแรกและผลงานเด่น](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/pub_01_home_a.jpg)

*ภาพที่ 13  Public — หน้าแรกและผลงานเด่น
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพที่ 14 Public — แคตตาล็อก/ตัวกรองผลงาน](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/pub_02_artworks_a.jpg)

*ภาพที่ 14  Public — แคตตาล็อก/ตัวกรองผลงาน
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพที่ 15 Public — รายละเอียดผลงาน](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/pub_03_artwork_detail_a.jpg)

*ภาพที่ 15  Public — รายละเอียดผลงาน
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพที่ 16 Public — ข่าวสาร](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/pub_04_news.jpg)

*ภาพที่ 16  Public — ข่าวสาร
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพที่ 17 Public/Customer — ขั้นตอนชำระเงิน](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/pub_08_payment.jpg)

*ภาพที่ 17  Public/Customer — ขั้นตอนชำระเงิน
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

![ภาพที่ 18 Public — Dialog เข้าสู่ระบบ](https://gitlab.mfu.ac.th/napus/buddhist_art_mfu/-/raw/main/docs/tor/optimized/pub_09_login_dialog.jpg)

*ภาพที่ 18  Public — Dialog เข้าสู่ระบบ
แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)*

# 7. ข้อกำหนดด้านข้อมูลและ API

## 7.1 โครงสร้างข้อมูลหลัก

| Entity | ข้อมูลสำคัญ | ความสัมพันธ์/กติกา |
| --- | --- | --- |
| User | profile, role, status, verification, image | role guard; owner check; รองรับ import/identity provider |
| Submission | title, artist[], create.startAt/endAt, status, artworks | endAt เป็นฐานคำนวณ initialSaleEndsAt |
| Artwork | artworkCode, title, artist, image, price, status, category | submissionArtworkId เชื่อมต้นทาง; direct-create ไม่เข้ากติกา 1 ปี |
| Artwork.postTermSale | applicable, initialSaleEndsAt, mode, decision, decisionAt, effectiveAt, recordedBy/As, contactMethod, note, history[], notifications | แหล่งสิทธิ์ซื้อหลักและ audit lifecycle |
| Order/Cart | buyer, items, status, payment, reservation | backend ตรวจ purchasable; reservation เดิมจบได้ |
| News/Category/Settings | content, image, category, status/role/config | ใช้ public/admin CRUD ตาม auth |

## 7.2 API ที่เกี่ยวข้อง

| Method/Path | สิทธิ์ | หน้าที่ |
| --- | --- | --- |
| GET /api/v1/artwork | Public | รายการผลงาน/แคตตาล็อก |
| POST /api/v1/artwork/explore | Public/Auth | ค้นหา/กรองผลงาน |
| GET /api/v1/artwork/view/:id | Public | เพิ่ม view count/ดูรายละเอียด |
| POST /api/v1/artwork | Auth | สร้างผลงาน |
| PUT /api/v1/artwork | Auth | แก้ไขผลงานตาม owner/admin policy |
| GET /api/v1/artwork/post-term | Auth | รายการ post-term สำหรับ Artist/Admin พร้อม filter วัน/decision/mode |
| POST /api/v1/artwork/post-term/decision | Auth | บันทึกความประสงค์รายชิ้น/หลายชิ้น พร้อม contactMethod/note |
| GET/POST/PUT/DELETE /api/v1/submission | ตาม route | CRUD และค้นหา Submission |
| POST /api/v1/order | Auth | สร้าง order; guard สิทธิ์ซื้อที่ backend |
| GET /api/v1/order/invoice/:id | Owner/Admin | ดาวน์โหลด invoice |
| GET /api/v1/order/certificate/:id | Owner/Admin | ดาวน์โหลด certificate/QR |
| GET/POST/PUT/DELETE /api/v1/new | ตาม route | CRUD ข่าวสารและอัปโหลดภาพ |
| GET /api/v1/dashboard/stats | Configured | สถิติ dashboard |
| GET/POST/PUT/DELETE /api/v1/settings/* | ตาม route | message/group/status/verification/role/storage |

เงื่อนไข API สำคัญ
ทุก endpoint ที่เปลี่ยนสิทธิ์หรือสถานะต้องตรวจ authentication/role/owner, validate input, คืน error ที่อ่านได้, และใช้ compare-and-set เมื่อการกดซ้ำอาจทำให้ decision/history ซ้ำ

# 8. Workflow และกติกาธุรกิจ

## 8.1 Submission → Artwork → สิทธิ์ขาย

| ลำดับ | เหตุการณ์ | ผลลัพธ์ที่คาดหวัง |
| --- | --- | --- |
| 1 | ศิลปินส่ง Submission พร้อม create.endAt | Submission อยู่ในสถานะรอตรวจ/เปิดตาม workflow |
| 2 | Admin ตรวจและอนุมัติ | สร้าง/อัปเดต Artwork; กำหนด postTermSale.applicable และ endAt + 1 ปี |
| 3 | ระหว่างปีแรก | mode initial_term; ขายได้; artist แก้ metadata ได้แต่ห้ามเปลี่ยน decision เอง |
| 4 | 30/7/0 วันก่อนครบกำหนด | ส่ง reminder ครั้งเดียวต่อช่วง; แสดง notice/queue |
| 5 | ศิลปินหรือ Admin บันทึก decision | เก็บ decisionAt, recordedBy/As, contactMethod, note, history; มีผลเมื่อถึงวันครบกำหนด |
| 6 | ถึงวันครบกำหนด | continue_sale → standard_sale; pending/display_only → display_only; ปิด order ใหม่ตาม guard |
| 7 | หลังหมดอายุ | เปลี่ยน standard/display ได้เหมือน Artwork ทั่วไป และบันทึก history ทุกครั้ง |

## 8.2 State machine แบบข้อความ

initial_term  ──(ครบกำหนด + continue_sale)──>  standard_sale  ──(เปลี่ยนใจ)──>  display_only

initial_term  ──(ครบกำหนด + pending/display_only)──>  display_only  ──(เลือกขายต่อ)──>  standard_sale

needsReview (ไม่มี Submission/endAt) ──> หยุดขาย + คิวตรวจสอบวันครบกำหนด ──> Admin แก้ข้อมูล/บันทึกผล

## 8.3 กรณีรายการจองและการยกเลิก

- คำสั่งซื้อ/การจองที่เกิดก่อนหมดสิทธิ์ให้ดำเนินการจนจบตาม order workflow แม้ภายหลังเป็น display_only
- คำสั่งซื้อใหม่หลังหมดสิทธิ์ต้องถูกปฏิเสธที่ backend หาก mode ไม่ใช่ standard_sale หรือยังไม่พ้น initial_term
- หาก reservation เดิมถูกยกเลิกหลังหมดสิทธิ์ ให้คืน sale status เป็น Exhibition เมื่อ effective mode เป็น display_only
- การซ่อนปุ่มซื้อในหน้าเว็บไม่ถือเป็นมาตรการความปลอดภัยเพียงพอ
# 9. ข้อกำหนดที่ไม่ใช่ฟังก์ชัน (Non-functional requirements)

| ด้าน | ข้อกำหนด |
| --- | --- |
| ความปลอดภัย | JWT/session guard, role/owner authorization, input validation, rate limit/helmet ตาม config, ไม่เชื่อข้อมูลจาก frontend |
| ความถูกต้องของเวลา | เก็บ timestamp เป็น Date/UTC และคำนวณวันครบกำหนดตาม Asia/Bangkok; รองรับปีอธิกสุรทิน |
| ความน่าเชื่อถือ | cron idempotent; compare-and-set; ไม่ส่ง notification ซ้ำ; transaction/state update ไม่ทำให้ขายซ้ำ |
| ประสิทธิภาพ | pagination/filter query; index ที่เหมาะกับ postTermSale.initialSaleEndsAt/decision/mode; lazy-load ภาพ |
| การเข้าถึง | keyboard, focus, aria-label, alt text, text+icon ไม่ใช้สีอย่างเดียว, responsive |
| การบำรุงรักษา | แยก service/model/route, testable pure functions, log error/context, migration dry-run |
| การสำรองข้อมูล | กำหนดรอบ backup MongoDB และ retention โดยผู้ดูแลระบบ; ทดสอบ restore ก่อนใช้งานจริง |
| การขยายระบบ | API versioning และ schema additive; งาน direct-create ไม่ถูกบังคับเข้า lifecycle 1 ปี |

# 10. ความปลอดภัยและการตรวจสอบย้อนหลัง

- ตรวจสิทธิ์ที่ backend ทุกจุดสร้าง/แก้ไข/ลบและตอนสร้าง order; owner แก้ได้เฉพาะผลงานของตนเอง
- บันทึก audit history เมื่อ decision เปลี่ยน รวมผู้บันทึก เวลา บทบาท ช่องทางติดต่อ และหมายเหตุ
- จำกัดการอัปโหลดด้วยชนิดไฟล์ ขนาด จำนวนไฟล์ และทำ image processing ก่อนเผยแพร่
- ไม่ log token/password/ข้อมูลส่วนบุคคลเกินจำเป็น และกำหนด retention ตามนโยบายหน่วยงาน
- migration post-term ต้องมี dry-run สรุปจำนวน continue/stop/missing ก่อนเขียนจริง และ rollback/backup plan
# 11. แผนการทดสอบและเกณฑ์ยอมรับ

การทดสอบขั้นต่ำใช้ Given–When–Then ด้านล่าง ร่วมกับ unit/integration test ของ backend, build/lint ของ frontend, API smoke test และการตรวจภาพหน้าจอทุก role

| Given | When | Then |
| --- | --- | --- |
| ก่อนครบ 1 ปี | Artist พยายามเปลี่ยน decision | ระบบปฏิเสธ; แก้ข้อมูล metadata ได้ และแสดงข้อความให้ติดต่อ Admin |
| มี decision continue_sale ล่วงหน้า | ถึง initialSaleEndsAt | mode เปลี่ยน standard_sale โดยไม่หยุดขาย |
| ครบกำหนดแต่ pending | ลูกค้าสร้าง order ใหม่ | backend ปฏิเสธ; public แสดง Display only; reservation เดิมทำต่อได้ |
| ครบกำหนดและเลือก continue | ลูกค้าสร้าง order ใหม่ | ผ่านได้หาก status/stock เงื่อนไขอื่นผ่าน |
| รายการจองเดิมถูกยกเลิกหลังหมดสิทธิ์ | ระบบคืนสถานะ | กลับ Exhibition หาก mode display_only ไม่ใช่ Available |
| cron ทำงานซ้ำ | รัน reminder/deadline job หลายครั้ง | ไม่ส่งซ้ำและไม่ push history ซ้ำโดยไม่จำเป็น |
| endAt เป็น leap day/เวลาไทย | คำนวณครบ 1 ปี | ได้วัน/เวลาครบกำหนดตามปฏิทินและ timezone ที่กำหนด |
| Admin บันทึกแทนหลาย artwork | ส่ง artworkIds พร้อม contact/note | ทุกชิ้นที่อนุญาตอัปเดต; audit ระบุผู้บันทึกและช่องทาง |
| Artwork direct-create | ไม่มี submissionArtworkId | ไม่ถูกบังคับเข้า post-term lifecycle |

หลักฐานการตรวจ ณ วันที่จัดทำ: backend Jest 9 test suites / 42 tests ผ่าน; targeted lifecycle/submission tests ผ่าน 14 tests; frontend npm run build ผ่าน โดยเหลือเพียง Sass deprecation และ asset-size warnings ที่ไม่ทำให้ build ล้มเหลว

# 12. การติดตั้ง ปฏิบัติการ และบำรุงรักษา

| หัวข้อ | ข้อกำหนด/ขั้นตอน |
| --- | --- |
| Environment | กำหนด .env แยก dev/test/prod; เก็บ secret ใน secret manager; ตั้ง API URL/frontend config ให้ตรง |
| Deploy | ติดตั้ง dependencies frontend/backend, build frontend, start Node/Express, ตรวจ health endpoint และ log |
| Database | สร้าง index, backup ก่อน migration, dry-run migratePostTermSale แล้วจึง apply |
| Cron | เปิดใช้งาน postTermSaleDeadline และ cartTimeout; monitor job duration/error และ notification counters |
| Monitoring | เก็บ error log, request ID, order/decision audit; แจ้งเตือนเมื่อ cron fail หรือ missing deadline ค้าง |
| Support | มีคู่มือ admin สำหรับ queue/filter/บันทึกแทน และคู่มือ artist สำหรับเลือกความประสงค์ |

# 13. ผลส่งมอบและเกณฑ์การรับมอบ

- source code frontend/backend พร้อม configuration ตัวอย่างและคำสั่งติดตั้ง
- database schema/migration/dry-run report และเอกสาร rollback/backup
- API contract หรือ Swagger/collection สำหรับ endpoint สำคัญ
- test report, test data ที่ไม่ใช่ข้อมูลจริง และหลักฐาน build/deploy
- คู่มือผู้ดูแลระบบ/ศิลปิน/ผู้ซื้อ และ TOR ฉบับนี้พร้อมภาพหน้าจอจริง
- เกณฑ์รับมอบ: ทุก acceptance scenario ผ่าน, no unauthorized purchase, audit/history ครบ, responsive/accessibility smoke pass, และเอกสารตรงกับ release ที่ส่งมอบ
# 14. สมมติฐาน ข้อจำกัด และรายการที่ต้องยืนยัน

- “1 ปี” หมายถึงหนึ่งปีปฏิทินจากวันและเวลาปิด Submission ใน Asia/Bangkok ตามแผนที่ล็อกไว้
- ภาพ/ข้อมูลทดสอบในเอกสารไม่ใช่ข้อมูลธุรกรรมจริง และไม่ควรเผยแพร่ต่อสาธารณะโดยไม่ตรวจ privacy
- รายละเอียดเชิงกฎหมายของสัญญา ค่าธรรมเนียม ภาษี SLA และ retention ข้อมูลต้องยืนยันกับหน่วยงาน/นิติการก่อนประกาศใช้
- การส่งอีเมลจริงต้องตั้ง SMTP/provider, sender identity, template และ retry policy ใน production
- หากข้อมูลเดิมไม่มี submissionArtworkId หรือ create.endAt ระบบจะหยุดขายและเข้าคิวตรวจสอบ ไม่เดาวันครบกำหนด
# ภาคผนวก ก. Route inventory ของ Frontend

| พื้นที่ | Route | บทบาท/หน้าที่ |
| --- | --- | --- |
| Public | / | Home |
| Public | /artworks | Catalog |
| Public | /artwork/:id | Artwork detail |
| Public | /news และ /news/:id | News list/detail |
| Public | /contact | Contact |
| Public | /artist-profile/:id | Public artist profile |
| Public | /payment | Payment |
| Public | /login, /privacy, /terms | Auth/legal |
| Admin | /admin | Overview |
| Admin | /admin/analytics | Analytics |
| Admin | /admin/artworks | Artwork management |
| Admin | /admin/submissions | Submission + post-term queue |
| Admin | /admin/submissions/:id | Submission detail |
| Admin | /admin/submissions/:submissionId/assignment/:id | Assignment |
| Admin | /admin/orders | Orders |
| Admin | /admin/users-management | Users |
| Admin | /admin/news | News |
| Artist | /artist/profile | Artist profile |
| Artist | /artist/submissions | My submissions |
| Artist | /artist/submissions/:id | Submission detail |
| Customer | /user/profile | Customer profile |
| Customer | /user/order | My orders |

# ภาคผนวก ข. Source map สำหรับการตรวจสอบ

| ส่วนงาน | ไฟล์/โฟลเดอร์หลัก |
| --- | --- |
| Post-term model | backend/server/Project/Artwork/models/artwork.model.js |
| Post-term service/API | backend/server/Project/Artwork/service/postTermSale.js; artwork.routes.js |
| Order guard | backend/server/Project/Order/service/order.js; backend/server/crons/cartTimeout.js |
| Deadline cron | backend/server/crons/postTermSaleDeadline.js |
| Migration | backend/scripts/migratePostTermSale.js |
| Admin UI | frontend/src/views/Admin/Submissions.vue; components/post_term/PostTermSaleQueue.vue |
| Artist UI | frontend/src/views/Artist/Profile.vue; components/PostTermSaleNotice.vue; Submissions.vue |
| Public UI | frontend/src/views/page/ArtworkDetail.vue; components/card/CardArtworks.vue |
| Auth/route | frontend/src/router/index.js; backend/server/middleware |
| Tests | backend/tests and jest configuration; frontend build/test configuration |

# ภาคผนวก ค. สถานะและคำศัพท์

| คำ/สถานะ | ความหมาย |
| --- | --- |
| Available | มีสิทธิ์ขาย/พร้อมซื้อเมื่อเงื่อนไขอื่นผ่าน |
| Exhibition | แสดง/จัดแสดง ไม่เปิดซื้อ |
| Sold Out | จำหน่ายครบ/หมด |
| initial_term | ช่วงปีแรกจาก Submission endAt |
| standard_sale | ขายต่อแบบปกติ ไม่มีกำหนดใหม่ |
| display_only | แสดงเฉย ๆ ไม่มีราคา/ตะกร้า/ปุ่มซื้อ |
| pending | ยังไม่ตอบความประสงค์ |
| needsReview | ข้อมูลต้นทางไม่พอ ต้องตรวจสอบวันครบกำหนด |

# ภาคผนวก ง. ดัชนีภาพหน้าจอ

ภาพที่ 1–18 ในหมวด 6 ครอบคลุมหน้าจอ public, artist, customer และ admin โดยภาพที่ 1 เป็น capture ล่าสุดของ Admin Submissions ที่มีแท็บ “จัดการการขายหลังครบ 1 ปี” ส่วนภาพอื่นเป็น capture จริงของ workflow ที่มีอยู่ในชุดภาพระบบ

# ภาคผนวก จ. Traceability matrix

| Requirement | UI/Code evidence | Test/acceptance |
| --- | --- | --- |
| T1 วันครบกำหนด +1 ปี | postTermSale service/model; Submission approval | leap year/timezone case |
| T2 Artist/Admin decision | PostTermSaleNotice; PostTermSaleQueue; decision API | owner/admin authorization; compare-set |
| T3 display only | CardArtworks; ArtworkDetail; order guard | no new order; old reservation continues |
| T4 reminder idempotent | postTermSaleDeadline cron; notifications fields | repeat cron sends once |
| T5 audit/migration | history[]; migratePostTermSale dry-run | missing source → needsReview |
| T6 responsive/accessibility | CoreUI/Vue components; aria/labels/loading feedback | desktop/mobile/keyboard smoke |


> หมายเหตุ: ภาพประกอบเป็นภาพหน้าจอจากระบบจริงในสภาพแวดล้อมทดสอบ ข้อมูลในภาพอาจเป็นข้อมูลตัวอย่าง
