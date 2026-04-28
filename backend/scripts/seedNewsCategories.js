'use strict';

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Category = require('../server/Project/Settings/models/category.model');

async function seedNewsCategories() {
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
        console.log('Clearing existing News Categories...');
        await Category.deleteMany({});

        // 2. Define Categories
        const categories = [
            {
                title: [
                    { key: 'en', value: 'Exhibition' },
                    { key: 'th', value: 'นิทรรศการ' }
                ],
                description: [
                    { key: 'en', value: 'Art exhibitions and galleries' },
                    { key: 'th', value: 'ข่าวสารงานนิทรรศการและแกลเลอรี' }
                ]
            },
            {
                title: [
                    { key: 'en', value: 'Workshop' },
                    { key: 'th', value: 'เวิร์กชอป' }
                ],
                description: [
                    { key: 'en', value: 'Art workshops and learning activities' },
                    { key: 'th', value: 'กิจกรรมเวิร์กชอปและกิจกรรมการเรียนรู้ศิลปะ' }
                ]
            },
            {
                title: [
                    { key: 'en', value: 'Award' },
                    { key: 'th', value: 'รางวัล' }
                ],
                description: [
                    { key: 'en', value: 'Awards and achievements' },
                    { key: 'th', value: 'ข่าวสารการรับรางวัลและความสำเร็จต่างๆ' }
                ]
            },
            {
                title: [
                    { key: 'en', value: 'Press' },
                    { key: 'th', value: 'ข่าวประชาสัมพันธ์' }
                ],
                description: [
                    { key: 'en', value: 'Official press releases' },
                    { key: 'th', value: 'ข่าวประชาสัมพันธ์อย่างเป็นทางการ' }
                ]
            },
            {
                title: [
                    { key: 'en', value: 'Event' },
                    { key: 'th', value: 'กิจกรรม' }
                ],
                description: [
                    { key: 'en', value: 'General events and news' },
                    { key: 'th', value: 'ข่าวกิจกรรมทั่วไป' }
                ]
            },
            {
                title: [
                    { key: 'en', value: 'Research' },
                    { key: 'th', value: 'งานวิจัย' }
                ],
                description: [
                    { key: 'en', value: 'Art research and publications' },
                    { key: 'th', value: 'งานวิจัยและสิ่งพิมพ์ทางศิลปะ' }
                ]
            }
        ];

        // 3. Create Categories
        console.log('Seeding News Categories...');
        await Category.insertMany(categories);
        console.log('All news categories seeded successfully!');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit();
    }
}

seedNewsCategories();
