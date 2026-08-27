'use strict';

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.dev') });

const Group = require('../server/Project/Settings/models/group.model');
const Status = require('../server/Project/Settings/models/status.model');
const Category = require('../server/Project/Artwork/models/category.model');

const bilingual = (th, en) => [
    { key: 'th', value: th },
    { key: 'en', value: en }
];

const fixedId = value => new mongoose.Types.ObjectId(value);

const upsertDefault = async (Model, item) => {
    const { code, _id, ...fields } = item;
    const update = { $setOnInsert: { code, ...fields } };
    if (_id) update.$setOnInsert._id = fixedId(_id);
    return Model.findOneAndUpdate({ code }, update, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    }).lean();
};

const groupDefaults = [
    { code: 'SALE_STATUS', title: bilingual('สถานะการขาย', 'Sale Status'), description: bilingual('สถานะสำหรับการจัดการการขายผลงานศิลปะ', 'Statuses for artwork sales') },
    { code: 'SHOW_STATUS', title: bilingual('สถานะการแสดงผล', 'Show Status'), description: bilingual('สถานะสำหรับการอนุมัติการแสดงผลผลงานศิลปะ', 'Statuses for artwork display approval') },
    { code: 'STUDENT_GROUP', title: bilingual('กลุ่มนักศึกษา', 'Student Group'), description: bilingual('หมวดหมู่สำหรับนักศึกษา', 'Categories for students') }
];

const statusDefaults = groupIds => [
    { code: 'AVAILABLE', _id: '69678075e5f76f7a8c42dc12', title: bilingual('พร้อมขาย', 'Available'), group: groupIds.SALE_STATUS },
    { code: 'EXHIBITION', _id: '6a7c67ac1ec8e06e58fea351', title: bilingual('กำลังร่วมแสดงงาน', 'Exhibition'), group: groupIds.SALE_STATUS },
    { code: 'SOLD_OUT', title: bilingual('ขายแล้ว', 'Sold Out'), group: groupIds.SALE_STATUS },
    { code: 'PENDING', _id: '69677d4de5f76f7a8c42dbf6', title: bilingual('รอตรวจสอบ', 'Pending'), group: groupIds.SHOW_STATUS },
    { code: 'APPROVED', _id: '6a7c67ac1ec8e06e58fea357', title: bilingual('อนุมัติ', 'Approved'), group: groupIds.SHOW_STATUS },
    { code: 'REJECTED', title: bilingual('ไม่อนุมัติ', 'Rejected'), group: groupIds.SHOW_STATUS },
    { code: 'RESERVED', _id: '6a7c67ac1ec8e06e58fea35a', title: bilingual('รอชำระเงิน', 'Reserved'), group: groupIds.SHOW_STATUS },
    { code: 'NEW_STUDENT', title: bilingual('ผู้เรียนใหม่', 'NewStudent'), group: groupIds.STUDENT_GROUP },
    { code: 'OLD_STUDENT', title: bilingual('ผู้เรียนเก่า', 'OldStudent'), group: groupIds.STUDENT_GROUP },
    { code: 'CANCELLED', title: bilingual('ยกเลิก', 'Cancelled'), group: groupIds.SHOW_STATUS }
];

const categoryDefaults = [
    { code: 'PAINTING', _id: '6a7c67ac1ec8e06e58fea377', title: bilingual('จิตรกรรม', 'Painting'), description: bilingual('ผลงานศิลปะที่สร้างสรรค์ด้วยการระบายสีลงบนพื้นระนาบ', 'Art created with paint on a surface') },
    { code: 'SCULPTURE', _id: '6a7c67ac1ec8e06e58fea381', title: bilingual('ประติมากรรม', 'Sculpture'), description: bilingual('ผลงานศิลปะสามมิติที่สร้างสรรค์โดยการปั้น แกะสลัก หรือหล่อ', 'Three-dimensional art created by shaping or combining materials') },
    { code: 'MIXED_MEDIA', title: bilingual('สื่อผสม', 'Mixed Media'), description: bilingual('ผลงานศิลปะที่สร้างสรรค์โดยใช้วัสดุและสื่อมากกว่าหนึ่งชนิด', 'Art created using more than one medium') },
    { code: 'DRAWING', title: bilingual('การวาดเส้น', 'Drawing'), description: bilingual('ผลงานศิลปะที่สร้างสรรค์โดยการขีดเขียนหรือวาดเส้นลงบนพื้นระนาบ', 'Art created using lines or areas of tone, usually on paper') },
    { code: 'DIGITAL_ART', _id: '6a7c67ac1ec8e06e58fea390', title: bilingual('ศิลปะดิจิทัล', 'Digital Art'), description: bilingual('ผลงานศิลปะที่สร้างสรรค์โดยใช้เทคโนโลยีดิจิทัล', 'Art created or presented using digital technology') },
    { code: 'INSTALLATION_ART', title: bilingual('ศิลปะการติดตั้ง', 'Installation Art'), description: bilingual('ผลงานศิลปะที่สร้างสรรค์เพื่อติดตั้งในพื้นที่เฉพาะเจาะจง', 'Three-dimensional works designed to transform the perception of a space') },
    { code: 'OTHERS', _id: '69b917247aa08919285fb7ee', title: bilingual('อื่นๆ', 'Others'), description: bilingual('ผลงานศิลปะประเภทอื่นๆ ที่ไม่ได้ระบุไว้ข้างต้น', 'Other types of art not listed above') }
];

async function main() {
    if (!process.env.MONGODB) throw new Error('MONGODB URI not found in .env.dev');
    await mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true });

    const groups = {};
    for (const item of groupDefaults) {
        const saved = await upsertDefault(Group, item);
        groups[item.code] = saved._id;
    }
    for (const item of statusDefaults(groups)) await upsertDefault(Status, item);
    for (const item of categoryDefaults) await upsertDefault(Category, item);

    console.log(JSON.stringify({
        groups: await Group.countDocuments(),
        statuses: await Status.countDocuments(),
        categories: await Category.countDocuments()
    }));
}

main()
    .catch(error => { console.error(error); process.exitCode = 1; })
    .finally(async () => { await mongoose.disconnect(); });

