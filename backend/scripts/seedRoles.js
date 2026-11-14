'use strict';

const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');

const envCandidates = [
    path.join(__dirname, '../.env.development'),
    path.join(__dirname, '../.env.dev'),
    path.join(__dirname, '../.env'),
];
for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
        break;
    }
}

const { ensureDefaultRoles } = require('../server/Project/Settings/service/role');

async function seedRoles() {
    let exitCode = 0;
    try {
        const mongoURI = process.env.MONGODB || process.env.MONGO_URI || 'mongodb://localhost:27017/Buddhist';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        });
        console.log('Connected successfully. Running idempotent role upsert...');

        const results = await ensureDefaultRoles();
        for (const item of results) {
            const titleEn = (item.role && Array.isArray(item.role.title) && (item.role.title.find(t => t.key === 'en') || {}).value) || 'Unknown';
            console.log(`- [${item.action}] ${titleEn} (isSystem=${Boolean(item.role && item.role.isSystem)})`);
        }
        console.log('Role upsert completed cleanly without removing existing IDs.');
    } catch (error) {
        exitCode = 1;
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(exitCode);
    }
}

seedRoles();
