'use strict';

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Role = require('../server/Project/Settings/models/role.model');

async function seedRoles() {
    try {
        const mongoURI = process.env.MONGODB;
        if (!mongoURI) {
            throw new Error('MONGODB URI not found in .env');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
            family: 4
        });
        console.log('Connected successfully.');

        // 1. Clear existing data
        console.log('Clearing existing Roles...');
        await Role.deleteMany({});

        // 2. Define Roles
        const roles = [
            {
                title: [
                    { key: 'en', value: 'Admin' },
                    { key: 'th', value: 'ผู้ดูแลระบบ' }
                ],
                description: [
                    { key: 'en', value: 'Full access to all administrative features' },
                    { key: 'th', value: 'เข้าถึงฟีเจอร์การดูแลระบบทั้งหมด' }
                ]
            },
            {
                title: [
                    { key: 'en', value: 'Artist' },
                    { key: 'th', value: 'ศิลปิน' }
                ],
                description: [
                    { key: 'en', value: 'Can manage their own profile and artworks' },
                    { key: 'th', value: 'สามารถจัดการข้อมูลส่วนตัวและผลงานศิลปะของตนเอง' }
                ]
            },
            {
                title: [
                    { key: 'en', value: 'Developer' },
                    { key: 'th', value: 'นักพัฒนา' }
                ],
                description: [
                    { key: 'en', value: 'System developers with technical access' },
                    { key: 'th', value: 'นักพัฒนาระบบที่มีการเข้าถึงทางเทคนิค' }
                ]
            },
            {
                title: [
                    { key: 'en', value: 'Evaluator' },
                    { key: 'th', value: 'ผู้ประเมิน' }
                ],
                description: [
                    { key: 'en', value: 'Responsible for evaluating submissions' },
                    { key: 'th', value: 'รับผิดชอบในการประเมินผลงาน' }
                ]
            },
            {
                title: [
                    { key: 'en', value: 'Customer' },
                    { key: 'th', value: 'ลูกค้า/นักศึกษา' }
                ],
                description: [
                    { key: 'en', value: 'Standard user access for browsing and ordering' },
                    { key: 'th', value: 'การเข้าถึงของผู้ใช้ปกติสำหรับการเรียกดูและสั่งซื้อ' }
                ]
            }
        ];

        // 3. Create Roles
        console.log('Seeding Roles...');
        await Role.insertMany(roles);
        console.log('All roles seeded successfully!');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit();
    }
}

seedRoles();
