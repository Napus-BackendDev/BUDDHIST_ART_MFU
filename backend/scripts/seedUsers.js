'use strict';

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../server/Project/User/models/user.model');
const Role = require('../server/Project/Settings/models/role.model');

async function seedUsers() {
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

        // 1. Fetch Roles
        const roles = await Role.find({});
        const adminRole = roles.find(r => r.title.some(t => t.value === 'Admin'));
        const artistRole = roles.find(r => r.title.some(t => t.value === 'Artist'));
        const customerRole = roles.find(r => r.title.some(t => t.value === 'Customer'));

        if (!adminRole || !artistRole || !customerRole) {
            throw new Error('Required roles (Admin, Artist, Customer) not found in database. Please run npm run seed:role first.');
        }

        // 2. Clear existing test users (optional)
        console.log('Cleaning up existing users with these emails...');
        await User.deleteMany({
            'contact.studentEmail': { 
                $in: [
                    '6631503129@lamduan.mfu.ac.th', 
                    'saishanghlang@gmail.com', 
                    'saishanghlang20122002@gmail.com'
                ] 
            }
        });

        // 3. Define Users
        const users = [
            {
                studentId: '6631503129',
                name: [{ key: 'en', value: 'MFU Admin' }, { key: 'th', value: 'ผู้ดูแลระบบ MFU' }],
                role: adminRole._id,
                contact: {
                    studentEmail: '6631503129@lamduan.mfu.ac.th',
                    personalEmail: '6631503129@lamduan.mfu.ac.th'
                },
                password: 'Password123'
            },
            {
                studentId: 'ARTIST_01',
                name: [{ key: 'en', value: 'Artist User' }, { key: 'th', value: 'ผู้ใช้ศิลปิน' }],
                role: artistRole._id,
                contact: {
                    studentEmail: 'saishanghlang@gmail.com',
                    personalEmail: 'saishanghlang@gmail.com'
                },
                password: 'Password123'
            },
            {
                studentId: 'USER_01',
                name: [{ key: 'en', value: 'Regular User' }, { key: 'th', value: 'ผู้ใช้ทั่วไป' }],
                role: customerRole._id,
                contact: {
                    studentEmail: 'saishanghlang20122002@gmail.com',
                    personalEmail: 'saishanghlang20122002@gmail.com'
                },
                password: 'Password123'
            }
        ];

        // 4. Create Users
        console.log('Seeding Users...');
        await User.insertMany(users);
        console.log('All 3 users seeded successfully!');

    } catch (error) {
        console.error('Error seeding users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit();
    }
}

seedUsers();
