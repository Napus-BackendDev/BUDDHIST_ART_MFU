'use strict';

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.dev') });

const Group = require('../server/Project/Settings/models/group.model');
const Status = require('../server/Project/Settings/models/status.model');
const Category = require('../server/Project/Artwork/models/category.model');

const firstTitle = doc => Array.isArray(doc.title)
    ? (doc.title.find(item => item.key === 'en') || doc.title[0] || {}).value || ''
    : '';

const slug = value => String(value || '')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()
    .slice(0, 40) || 'ITEM';

const assignUniqueCodes = async (Model, known, prefix) => {
    const allDocs = await Model.find({}).select('_id code title').lean();
    const counts = allDocs.reduce((map, doc) => {
        if (doc.code) map.set(doc.code, (map.get(doc.code) || 0) + 1);
        return map;
    }, new Map());
    const duplicates = [...counts.entries()].filter(([, count]) => count > 1).map(([code]) => code);
    if (duplicates.length) throw new Error(`${Model.modelName} has duplicate codes: ${duplicates.join(', ')}`);

    const docs = allDocs.filter(doc => !doc.code);
    const used = new Set(counts.keys());
    for (const doc of docs) {
        const title = firstTitle(doc);
        const exact = known[title.toLowerCase()];
        let code = exact || `${prefix}_${slug(title)}`;
        if (used.has(code)) code = `${code}_${String(doc._id).slice(-6).toUpperCase()}`;
        used.add(code);
        await Model.updateOne({ _id: doc._id }, { $set: { code } });
    }

    const remaining = await Model.find({}).select('code').lean();
    const finalCodes = remaining.map(doc => doc.code).filter(Boolean);
    if (finalCodes.length !== remaining.length || new Set(finalCodes).size !== finalCodes.length) {
        throw new Error(`${Model.modelName} migration left empty or duplicate codes.`);
    }
};

async function main() {
    if (!process.env.MONGODB) throw new Error('MONGODB URI not found in .env.dev');
    await mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true });
    await assignUniqueCodes(Group, {
        'sale status': 'SALE_STATUS',
        'show status': 'SHOW_STATUS',
        'student group': 'STUDENT_GROUP'
    }, 'GROUP');
    await assignUniqueCodes(Status, {
        'available': 'AVAILABLE', 'exhibition': 'EXHIBITION', 'sold out': 'SOLD_OUT',
        'pending': 'PENDING', 'approved': 'APPROVED', 'rejected': 'REJECTED',
        'reserved': 'RESERVED', 'newstudent': 'NEW_STUDENT', 'oldstudent': 'OLD_STUDENT',
        'new student': 'NEW_STUDENT', 'old student': 'OLD_STUDENT'
    }, 'STATUS');
    await assignUniqueCodes(Category, {}, 'CATEGORY');
    console.log('Setting codes migrated successfully.');
    await mongoose.disconnect();
}

main().catch(error => { console.error(error); process.exitCode = 1; });
