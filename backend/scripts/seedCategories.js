'use strict';

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.dev') });

const Category = require('../server/Project/Artwork/models/category.model');

async function seedCategories() {
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
        console.log('Clearing existing Categories...');
        await Category.deleteMany({});

        // 2. Define Categories
        const categories = [
            {
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

        // 3. Create Categories
        console.log('Seeding Categories...');
        await Category.insertMany(categories);
        console.log('All categories seeded successfully!');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit();
    }
}

seedCategories();
