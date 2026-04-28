'use strict';

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const New = require('../server/Project/New/models/new.model');
const Category = require('../server/Project/Settings/models/category.model');

async function seedNews() {
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

        // 1. Fetch Dependencies
        const newsCategories = await Category.find({});
        
        const exhibitionCat = newsCategories.find(c => c.title.some(t => t.value === 'Exhibition'));
        const workshopCat = newsCategories.find(c => c.title.some(t => t.value === 'Workshop'));

        if (!exhibitionCat || !workshopCat) {
            throw new Error('News categories not found. Please run seed:news-category first.');
        }

        // 2. Clear existing data
        console.log('Clearing existing News...');
        await New.deleteMany({});

        // 3. Define News items
        const newsItems = [
            {
                title: [{ key: 'en', value: 'Grand Exhibition 2024' }, { key: 'th', value: 'นิทรรศการครั้งยิ่งใหญ่แห่งปี 2567' }],
                description: [{ key: 'en', value: 'Join us for the annual Buddhist Art exhibition at MFU Gallery.' }, { key: 'th', value: 'ขอเชิญร่วมชมนิทรรศการพุทธศิลป์ประจำปี ณ หอศิลป์ มฟล.' }],
                category: exhibitionCat._id,
                images: ['https://images.unsplash.com/photo-1518998053574-53ee7537d40e'],
                views: 120
            },
            {
                title: [{ key: 'en', value: 'Traditional Painting Workshop' }, { key: 'th', value: 'เวิร์กชอปการเขียนภาพจิตรกรรมไทย' }],
                description: [{ key: 'en', value: 'Learn the secrets of traditional Lanna painting from masters.' }, { key: 'th', value: 'เรียนรู้เคล็ดลับการเขียนภาพจิตรกรรมล้านนาจากปรมาจารย์' }],
                category: workshopCat._id,
                images: ['https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b'],
                views: 85
            }
        ];

        // 4. Create News
        console.log('Seeding News items...');
        await New.insertMany(newsItems);
        console.log('Sample news seeded successfully!');

    } catch (error) {
        console.error('Error seeding news:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit();
    }
}

seedNews();
