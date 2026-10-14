'use strict';

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const mongoose = require('mongoose');

const cfg = require('../config/config');
const mfuDrive = require('../helpers/mfuDrive');
const Artwork = require('../server/Project/Artwork/models/artwork.model');
const New = require('../server/Project/New/models/new.model');
const Order = require('../server/Project/Order/models/order.model');
const Submission = require('../server/Project/Submission/models/submission.model');
const User = require('../server/Project/User/models/user.model');

const PUBLIC_ROOT = path.resolve(__dirname, '../public');
const dryRun = process.argv.includes('--dry-run') || /^(1|true|yes)$/i.test(process.env.MFU_DRIVE_MIGRATION_DRY_RUN || '');

const contentTypeFor = filePath => ({
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
}[path.extname(filePath).toLowerCase()] || 'application/octet-stream');

const report = {
    scannedFiles: 0,
    uploadedFiles: 0,
    reusedFiles: 0,
    missingFiles: 0,
    missingExamples: [],
    skippedExternal: 0,
    updatedDocuments: 0,
    updatedReferences: 0,
};

function localPathFor(relativePath) {
    const normalized = mfuDrive.normalizeRelativePath(relativePath);
    const absolute = path.resolve(PUBLIC_ROOT, normalized);
    if (absolute !== PUBLIC_ROOT && !absolute.startsWith(`${PUBLIC_ROOT}${path.sep}`)) {
        throw new Error(`Resolved image path escaped public root: ${relativePath}`);
    }
    return absolute;
}

async function walkFiles(directory) {
    const entries = await fsp.readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...await walkFiles(fullPath));
        else if (entry.isFile()) files.push(fullPath);
    }
    return files;
}

function relativeFromLocalAbsolute(filePath) {
    return path.relative(PUBLIC_ROOT, filePath).replace(/\\/g, '/');
}

async function buildLocalFileIndex() {
    const index = new Set();
    for (const root of ['account', 'system']) {
        const directory = path.join(PUBLIC_ROOT, root);
        if (!fs.existsSync(directory)) continue;
        const files = await walkFiles(directory);
        files.forEach(file => index.add(relativeFromLocalAbsolute(file)));
    }
    report.scannedFiles = index.size;
    return index;
}

function toRelativePath(value) {
    return mfuDrive.relativePathFromStoredUrl(value);
}

async function migrateReference(value, localFiles, uploadCache) {
    if (!value || typeof value !== 'string') return value;
    const relativePath = toRelativePath(value);
    if (!relativePath) {
        report.skippedExternal += 1;
        return value;
    }

    const localPath = localPathFor(relativePath);
    if (!localFiles.has(relativePath) || !fs.existsSync(localPath)) {
        report.missingFiles += 1;
        if (report.missingExamples.length < 10) report.missingExamples.push(relativePath);
        return value;
    }

    let uploaded = uploadCache.get(relativePath);
    if (!uploaded) {
        if (dryRun) {
            uploaded = { url: mfuDrive.publicFileUrl(relativePath) };
        } else {
            console.log(`[MFU Drive] Uploading ${relativePath}`);
            uploaded = await mfuDrive.uploadLocalFile(relativePath, localPath, contentTypeFor(localPath));
            report.uploadedFiles += 1;
        }
        uploadCache.set(relativePath, uploaded);
    } else {
        report.reusedFiles += 1;
    }

    if (value === uploaded.url) return value;
    report.updatedReferences += 1;
    return uploaded.url;
}

async function migrateCollection(Model, imageMapper, localFiles, uploadCache) {
    const documents = await Model.find();
    for (const document of documents) {
        const changed = await imageMapper(document, localFiles, uploadCache);
        if (changed && !dryRun) {
            await document.save();
            report.updatedDocuments += 1;
        }
    }
}

async function migrateArtwork(document, localFiles, uploadCache) {
    const next = await migrateReference(document.image, localFiles, uploadCache);
    if (next === document.image) return false;
    document.image = next;
    return true;
}

async function migrateUser(document, localFiles, uploadCache) {
    const next = await migrateReference(document.image, localFiles, uploadCache);
    if (next === document.image) return false;
    document.image = next;
    return true;
}

async function migrateNews(document, localFiles, uploadCache) {
    let changed = false;
    const images = [];
    for (const image of document.images || []) {
        const next = await migrateReference(image, localFiles, uploadCache);
        changed = changed || next !== image;
        images.push(next);
    }
    if (changed) document.images = images;
    return changed;
}

async function migrateOrder(document, localFiles, uploadCache) {
    const next = await migrateReference(document.image, localFiles, uploadCache);
    if (next === document.image) return false;
    document.image = next;
    return true;
}

async function migrateSubmission(document, localFiles, uploadCache) {
    let changed = false;
    for (const assignment of document.assignments || []) {
        for (const artwork of assignment.artworks || []) {
            const next = await migrateReference(artwork.image, localFiles, uploadCache);
            if (next !== artwork.image) {
                artwork.image = next;
                changed = true;
            }
        }
    }
    return changed;
}

async function main() {
    if (!mfuDrive.isEnabled()) throw new Error('Set MFU_DRIVE_ENABLED=true before running image migration.');
    mfuDrive.assertConfigured();

    const localFiles = await buildLocalFileIndex();
    const uploadCache = new Map();

    await mongoose.connect(cfg.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await migrateCollection(Artwork, migrateArtwork, localFiles, uploadCache);
    await migrateCollection(User, migrateUser, localFiles, uploadCache);
    await migrateCollection(New, migrateNews, localFiles, uploadCache);
    await migrateCollection(Order, migrateOrder, localFiles, uploadCache);
    await migrateCollection(Submission, migrateSubmission, localFiles, uploadCache);

    console.log(JSON.stringify({ dryRun, ...report }, null, 2));
}

main()
    .catch(error => {
        console.error(error.stack || error.message || error);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
    });
