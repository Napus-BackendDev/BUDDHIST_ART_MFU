'use strict';

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Artwork = require('../server/Project/Artwork/models/artwork.model');
const Category = require('../server/Project/Artwork/models/category.model');
const User = require('../server/Project/User/models/user.model');
const Status = require('../server/Project/Settings/models/status.model');
const Group = require('../server/Project/Settings/models/group.model');

async function seedArtworks() {
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
        const artist = await User.findOne({ studentId: 'ARTIST_01' });
        const categories = await Category.find({});
        const statuses = await Status.find({}).populate('group');

        const paintingCat = categories.find(c => c.title.some(t => t.value === 'Painting'));
        const sculptureCat = categories.find(c => c.title.some(t => t.value === 'Sculpture'));
        
        const approvedStatus = statuses.find(s => s.title.some(t => t.value === 'Approved'));
        const availableStatus = statuses.find(s => s.title.some(t => t.value === 'Available'));
        const exhibitionStatus = statuses.find(s => s.title.some(t => t.value === 'Exhibition'));

        if (!artist || !paintingCat || !approvedStatus || !availableStatus) {
            throw new Error('Required dependencies not found. Please run seed:role, seed:category, and seed:user first.');
        }

        // 2. Clear existing data
        console.log('Clearing existing Artworks...');
        await Artwork.deleteMany({});

        // 3. Define Artworks
        const artworks = [
            {
                title: [{ key: 'en', value: 'Sukhothai Buddha' }, { key: 'th', value: 'พระพุทธรูปสมัยสุโขทัย' }],
                description: [{ key: 'en', value: 'Classic Sukhothai style Buddha image in walking posture.' }, { key: 'th', value: 'พระพุทธรูปปางลีลา ศิลปะสมัยสุโขทัย' }],
                technique: [{ key: 'en', value: 'Bronze Casting' }, { key: 'th', value: 'หล่อโลหะสัมฤทธิ์' }],
                size: [{ key: 'en', value: '80 x 30 cm' }, { key: 'th', value: '80 x 30 ซม.' }],
                price: 45000,
                artist: artist._id,
                category: sculptureCat._id,
                image: 'https://images.unsplash.com/photo-1541944743827-e04bb645f946',
                status: {
                    approval: approvedStatus._id,
                    sale: exhibitionStatus._id
                }
            },
            {
                title: [{ key: 'en', value: 'Golden Lotus' }, { key: 'th', value: 'บัวทอง' }],
                description: [{ key: 'en', value: 'Abstract painting of a blooming lotus representing enlightenment.' }, { key: 'th', value: 'ภาพเขียนแนวร่วมสมัยของดอกบัวที่เบ่งบาน' }],
                technique: [{ key: 'en', value: 'Oil on Canvas' }, { key: 'th', value: 'สีน้ำมันบนผืนผ้าใบ' }],
                size: [{ key: 'en', value: '100 x 100 cm' }, { key: 'th', value: '100 x 100 ซม.' }],
                price: 15000,
                artist: artist._id,
                category: paintingCat._id,
                image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
                status: {
                    approval: approvedStatus._id,
                    sale: availableStatus._id
                }
            },
            {
                title: [{ key: 'en', value: 'Dharma Wheel' }, { key: 'th', value: 'ธรรมจักร' }],
                description: [{ key: 'en', value: 'Detailed wood carving of the wheel of law.' }, { key: 'th', value: 'งานแกะสลักไม้รูปธรรมจักร' }],
                technique: [{ key: 'en', value: 'Wood Carving' }, { key: 'th', value: 'แกะสลักไม้' }],
                size: [{ key: 'en', value: '50 x 50 cm' }, { key: 'th', value: '50 x 50 ซม.' }],
                price: 8500,
                artist: artist._id,
                category: sculptureCat._id,
                image: 'https://images.unsplash.com/photo-1505410603994-c3ac6269711f',
                status: {
                    approval: approvedStatus._id,
                    sale: availableStatus._id
                }
            }
        ];

        // 4. Create Artworks
        console.log('Seeding Artworks...');
        await Artwork.insertMany(artworks);
        console.log('Sample artworks seeded successfully!');

    } catch (error) {
        console.error('Error seeding artworks:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit();
    }
}

seedArtworks();
