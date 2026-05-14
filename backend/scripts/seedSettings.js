'use strict';

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.dev') });

const Group = require('../server/Project/Settings/models/group.model');
const Status = require('../server/Project/Settings/models/status.model');

async function seedSettings() {
    try {
        const mongoURI = process.env.MONGODB;
        if (!mongoURI) {
            throw new Error('MONGODB URI not found in .env.dev');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log('Connected successfully.');

        // 1. Clear existing data (optional, but safer for a clean seed)
        console.log('Clearing existing Settings Groups and Statuses...');
        await Group.deleteMany({});
        await Status.deleteMany({});

        // 2. Create Groups
        console.log('Seeding Groups...');
        const saleGroup = await Group.create({
            title: [
                { key: 'en', value: 'Sale Status' },
                { key: 'th', value: 'สถานะการขาย' }
            ],
            description: [
                { key: 'en', value: 'Statuses for artwork sales' },
                { key: 'th', value: 'สถานะสำหรับการจัดการการขายผลงานศิลปะ' }
            ]
        });

        const showGroup = await Group.create({
            title: [
                { key: 'en', value: 'Show Status' },
                { key: 'th', value: 'สถานะการแสดงผล' }
            ],
            description: [
                { key: 'en', value: 'Statuses for artwork display approval' },
                { key: 'th', value: 'สถานะสำหรับการอนุมัติการแสดงผลผลงานศิลปะ' }
            ]
        });

        const studentGroup = await Group.create({
            title: [
                { key: 'en', value: 'Student Group' },
                { key: 'th', value: 'กลุ่มนักศึกษา' }
            ],
            description: [
                { key: 'en', value: 'Categories for students' },
                { key: 'th', value: 'หมวดหมู่สำหรับนักศึกษา' }
            ]
        });

        console.log(`Groups created: ${saleGroup.title[0].value}, ${showGroup.title[0].value}, ${studentGroup.title[0].value}`);

        // 3. Create Statuses
        console.log('Seeding Statuses...');

        // Sale Statuses
        const saleStatuses = [
            {
                title: [{ key: 'en', value: 'Available' }, { key: 'th', value: 'ว่าง' }],
                group: saleGroup._id
            },
            {
                title: [{ key: 'en', value: 'Exhibition' }, { key: 'th', value: 'กำลังร่วมแสดงงาน' }],
                group: saleGroup._id
            },
            {
                title: [{ key: 'en', value: 'Sold Out' }, { key: 'th', value: 'ขายแล้ว' }],
                group: saleGroup._id
            }
        ];

        // Show Statuses
        const showStatuses = [
            {
                title: [{ key: 'en', value: 'Pending' }, { key: 'th', value: 'รอตรวจสอบ' }],
                group: showGroup._id
            },
            {
                title: [{ key: 'en', value: 'Approved' }, { key: 'th', value: 'อนุมัติ' }],
                group: showGroup._id
            },
            {
                title: [{ key: 'en', value: 'Rejected' }, { key: 'th', value: 'ไม่นุมัติ' }],
                group: showGroup._id
            },
            {
                title: [{ key: 'en', value: 'Reserved' }, { key: 'th', value: 'รอชำระเงิน' }],
                group: showGroup._id
            }
        ];

        // Student Statuses
        const studentStatuses = [
            {
                title: [{ key: 'en', value: 'NewStudent' }, { key: 'th', value: 'นักศึกษาใหม่' }],
                group: studentGroup._id
            },
            {
                title: [{ key: 'en', value: 'OldStudent' }, { key: 'th', value: 'นักศึกษาเก่า' }],
                group: studentGroup._id
            }
        ];

        await Status.insertMany([...saleStatuses, ...showStatuses, ...studentStatuses]);
        console.log('All statuses seeded successfully!');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit();
    }
}

seedSettings();
