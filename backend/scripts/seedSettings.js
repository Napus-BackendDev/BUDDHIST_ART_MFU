'use strict';

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.dev') });

const Group = require('../server/Project/Settings/models/group.model');
const Status = require('../server/Project/Settings/models/status.model');
const Role = require('../server/Project/Settings/models/role.model');
const Category = require('../server/Project/Artwork/models/category.model');
const Storage = require('../server/Project/Settings/models/storage.model');
const User = require('../server/Project/User/models/user.model');

async function seedAll() {
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

        // 1. Clear existing data
        console.log('Clearing existing Settings Groups, Statuses, Roles, Categories, and Storages...');
        await Group.deleteMany({});
        await Status.deleteMany({});
        await Role.deleteMany({});
        await Category.deleteMany({});
        await Storage.deleteMany({});

        // 2. Create Groups
        console.log('Seeding Groups...');
        const saleGroup = await Group.create({
            code: 'SALE_STATUS',
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
            code: 'SHOW_STATUS',
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
            code: 'STUDENT_GROUP',
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
                _id: mongoose.Types.ObjectId("69678075e5f76f7a8c42dc12"),
                code: 'AVAILABLE',
                title: [{ key: 'en', value: 'Available' }, { key: 'th', value: 'พร้อมขาย' }],
                group: saleGroup._id
            },
            {
                code: 'EXHIBITION',
                title: [{ key: 'en', value: 'Exhibition' }, { key: 'th', value: 'กำลังร่วมแสดงงาน' }],
                group: saleGroup._id
            },
            {
                code: 'SOLD_OUT',
                title: [{ key: 'en', value: 'Sold Out' }, { key: 'th', value: 'ขายแล้ว' }],
                group: saleGroup._id
            }
        ];

        // Show Statuses
        const showStatuses = [
            {
                _id: mongoose.Types.ObjectId("69677d4de5f76f7a8c42dbf6"),
                code: 'PENDING',
                title: [{ key: 'en', value: 'Pending' }, { key: 'th', value: 'รอตรวจสอบ' }],
                group: showGroup._id
            },
            {
                code: 'APPROVED',
                title: [{ key: 'en', value: 'Approved' }, { key: 'th', value: 'อนุมัติ' }],
                group: showGroup._id
            },
            {
                code: 'REJECTED',
                title: [{ key: 'en', value: 'Rejected' }, { key: 'th', value: 'ไม่นุมัติ' }],
                group: showGroup._id
            },
            {
                code: 'RESERVED',
                title: [{ key: 'en', value: 'Reserved' }, { key: 'th', value: 'รอชำระเงิน' }],
                group: showGroup._id
            }
        ];

        // Student Statuses
        const studentStatuses = [
            {
                code: 'NEW_STUDENT',
                title: [{ key: 'en', value: 'NewStudent' }, { key: 'th', value: 'ผู้เรียนใหม่' }],
                group: studentGroup._id
            },
            {
                code: 'OLD_STUDENT',
                title: [{ key: 'en', value: 'OldStudent' }, { key: 'th', value: 'ผู้เรียนเก่า' }],
                group: studentGroup._id
            }
        ];

        await Status.insertMany([...saleStatuses, ...showStatuses, ...studentStatuses]);
        console.log('All statuses seeded successfully!');

        // 4. Create Roles
        console.log('Seeding Roles...');
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
                    { key: 'en', value: 'Customer' },
                    { key: 'th', value: 'ลูกค้า' }
                ],
                description: [
                    { key: 'en', value: 'Standard user access for browsing and ordering' },
                    { key: 'th', value: 'การเข้าถึงของผู้ใช้ปกติสำหรับการเรียกดูและสั่งซื้อ' }
                ]
            }
        ];
        await Role.insertMany(roles);
        console.log('All roles seeded successfully!');

        // 5. Create Categories
        console.log('Seeding Categories...');
        const categories = [
            {
                code: 'PAINTING',
                title: [
                    { key: 'en', value: 'Painting' },
                    { key: 'th', value: 'จิตรกรรม' }
                ],
                description: [
                    { key: 'en', value: 'Art created with paint on a surface' },
                    { key: 'th', value: 'ผลงานศิลปะที่สร้างสรรค์ด้วยการระบายสีลงบนพื้นระนาบ' }
                ]
            },
            {
                code: 'SCULPTURE',
                title: [
                    { key: 'en', value: 'Sculpture' },
                    { key: 'th', value: 'ประติมากรรม' }
                ],
                description: [
                    { key: 'en', value: 'Three-dimensional art created by shaping or combining materials' },
                    { key: 'th', value: 'ผลงานศิลปะสามมิติที่สร้างสรรค์โดยการปั้น แกะสลัก หรือหล่อ' }
                ]
            },
            {
                code: 'MIXED_MEDIA',
                title: [
                    { key: 'en', value: 'Mixed Media' },
                    { key: 'th', value: 'สื่อผสม' }
                ],
                description: [
                    { key: 'en', value: 'Art created using more than one medium' },
                    { key: 'th', value: 'ผลงานศิลปะที่สร้างสรรค์โดยใช้วัสดุและสื่อมากกว่าหนึ่งชนิด' }
                ]
            },
            {
                code: 'DRAWING',
                title: [
                    { key: 'en', value: 'Drawing' },
                    { key: 'th', value: 'การวาดเส้น' }
                ],
                description: [
                    { key: 'en', value: 'Art created using lines or areas of tone, usually on paper' },
                    { key: 'th', value: 'ผลงานศิลปะที่สร้างสรรค์โดยการขีดเขียนหรือวาดเส้นลงบนพื้นระนาบ' }
                ]
            },
            {
                code: 'DIGITAL_ART',
                title: [
                    { key: 'en', value: 'Digital Art' },
                    { key: 'th', value: 'ศิลปะดิจิทัล' }
                ],
                description: [
                    { key: 'en', value: 'Art created or presented using digital technology' },
                    { key: 'th', value: 'ผลงานศิลปะที่สร้างสรรค์โดยใช้เทคโนโลยีดิจิทัล' }
                ]
            },
            {
                code: 'INSTALLATION_ART',
                title: [
                    { key: 'en', value: 'Installation Art' },
                    { key: 'th', value: 'ศิลปะการติดตั้ง' }
                ],
                description: [
                    { key: 'en', value: 'Three-dimensional works designed to transform the perception of a space' },
                    { key: 'th', value: 'ผลงานศิลปะที่สร้างสรรค์เพื่อติดตั้งในพื้นที่เฉพาะเจาะจง' }
                ]
            },
            {
                _id: mongoose.Types.ObjectId("69b917247aa08919285fb7ee"),
                code: 'OTHERS',
                title: [
                    { key: 'en', value: 'Others' },
                    { key: 'th', value: 'อื่นๆ' }
                ],
                description: [
                    { key: 'en', value: 'Other types of art not listed above' },
                    { key: 'th', value: 'ผลงานศิลปะประเภทอื่นๆ ที่ไม่ได้ระบุไว้ข้างต้น' }
                ]
            }
        ];
        await Category.insertMany(categories);
        console.log('All categories seeded successfully!');

        // 6. Create Storages
        console.log('Seeding Storages...');
        const storages = [
            {
                title: [
                    { key: 'en', value: 'University' },
                    { key: 'th', value: 'จัดเก็บไว้ภายในมหาลัย' }
                ]
            },
            {
                title: [
                    { key: 'en', value: 'Home' },
                    { key: 'th', value: 'จัดเก็บไว้ภายนอกมหาลัย' }
                ]
            }
        ];
        await Storage.insertMany(storages);
        console.log('All storages seeded successfully!');

        // 7. Create Admin User
        console.log('Seeding Admin User...');
        const adminRole = await Role.findOne({ "title.value": "Admin" });
        if (adminRole) {
            await User.deleteMany({ "contact.personalEmail": "napus.dev@gmail.com" });
            await User.create({
                studentId: "ADMIN-01",
                name: [
                    { key: 'en', value: 'Napus Admin' },
                    { key: 'th', value: 'ผู้ดูแลระบบ ณภัส' }
                ],
                role: adminRole._id,
                contact: {
                    personalEmail: "napus.dev@gmail.com"
                }
            });
            console.log('Admin user seeded successfully!');
        } else {
            console.error('Admin role not found, skipping Admin user seeding.');
        }

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit();
    }
}

seedAll();
