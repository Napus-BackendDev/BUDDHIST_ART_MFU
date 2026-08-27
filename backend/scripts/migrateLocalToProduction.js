'use strict';

/**
 * Replace the configured Production application database with the Local
 * application database after creating a BSON backup of Production.
 *
 * Usage:
 *   node scripts/migrateLocalToProduction.js          # read-only preflight
 *   node scripts/migrateLocalToProduction.js --apply # backup + replace
 *
 * The script deliberately uses the native MongoDB driver so BSON values,
 * ObjectIds, dates, binary fields, and existing indexes are copied unchanged.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const { BSON, EJSON } = require('bson');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_SOURCE_ENV = path.join(ROOT, '.env.development');
const DEFAULT_TARGET_ENV = path.join(ROOT, '.env.production');
const OUTPUT_ROOT = path.resolve(ROOT, '..', 'outputs');
const BATCH_SIZE = 500;

const args = process.argv.slice(2);
const isApply = args.includes('--apply');

const getArg = (name, fallback) => {
    const index = args.indexOf(name);
    return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const sourceEnvPath = path.resolve(getArg('--source-env', DEFAULT_SOURCE_ENV));
const targetEnvPath = path.resolve(getArg('--target-env', DEFAULT_TARGET_ENV));

const readEnv = (envPath) => {
    if (!fs.existsSync(envPath)) throw new Error(`Environment file not found: ${envPath}`);
    const parsed = {};
    fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const separator = trimmed.indexOf('=');
        if (separator < 1) return;
        const key = trimmed.slice(0, separator).trim();
        let value = trimmed.slice(separator + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        parsed[key] = value;
    });
    return parsed;
};

const getUriParts = (uri, label) => {
    const match = String(uri || '').match(/^(mongodb(?:\+srv)?:)\/\/([^/]+)\/([^?]*)/i);
    if (!match || !['mongodb:', 'mongodb+srv:'].includes(match[1].toLowerCase())) {
        throw new Error(`${label} MONGODB is not a valid MongoDB URI.`);
    }
    const authority = match[2];
    const at = authority.lastIndexOf('@');
    const hosts = (at >= 0 ? authority.slice(at + 1) : authority).split(',');
    const hostname = hosts[0].replace(/^\[/, '').split(']')[0].split(':')[0].toLowerCase();
    return { protocol: match[1].toLowerCase(), hostname, pathname: `/${match[3]}` };
};

const hostOf = (parsed) => parsed.hostname.toLowerCase();

const assertSafety = (sourceEnv, targetEnv, sourceUri, targetUri) => {
    if (sourceEnv.NODE_ENV !== 'development') {
        throw new Error('Refusing to use source: source NODE_ENV must be development.');
    }
    if (targetEnv.NODE_ENV !== 'production') {
        throw new Error('Refusing to use target: target NODE_ENV must be production.');
    }
    if (!['localhost', '127.0.0.1', '::1'].includes(hostOf(sourceUri))) {
        throw new Error('Refusing to use source: source MongoDB host must be localhost.');
    }
    if (['localhost', '127.0.0.1', '::1'].includes(hostOf(targetUri))) {
        throw new Error('Refusing to use target: target MongoDB host must not be localhost.');
    }
    if (sourceUri.pathname.slice(1) !== 'Buddhist') {
        throw new Error('Refusing to use source: expected Local database Buddhist.');
    }
    if (targetUri.pathname.slice(1) !== 'buddhist_art_mfu') {
        throw new Error('Refusing to use target: expected Production database buddhist_art_mfu.');
    }
};

const withoutIdIndex = (indexes) => indexes
    .filter((index) => index.name !== '_id_')
    .map((index) => {
        const copy = { ...index };
        delete copy.v;
        // `background` is a legacy build option and is rejected by some
        // MongoDB server versions when sent back as an index specification.
        delete copy.background;
        return copy;
    });

const listCollections = async (db) => db.listCollections({}, { nameOnly: false }).toArray();

const getCollectionSnapshot = async (db, info) => {
    const collection = db.collection(info.name);
    const indexes = await collection.listIndexes().toArray();
    const docs = await collection.find({}).sort({ _id: 1 }).toArray();
    const hash = crypto.createHash('sha256');
    docs.forEach((doc) => hash.update(BSON.serialize(doc)));
    return {
        name: info.name,
        options: info.options || {},
        indexes,
        count: docs.length,
        digest: hash.digest('hex'),
        docs
    };
};

const getDatabaseSummary = async (db) => {
    const infos = await listCollections(db);
    const snapshots = [];
    for (const info of infos) snapshots.push(await getCollectionSnapshot(db, info));
    return snapshots.map(({ docs, ...summary }) => summary);
};

const writeBsonFile = async (filePath, docs) => {
    const handle = await fs.promises.open(filePath, 'w');
    try {
        for (const doc of docs) await handle.write(BSON.serialize(doc));
    } finally {
        await handle.close();
    }
};

const createBackup = async (db, backupDir) => {
    await fs.promises.mkdir(backupDir, { recursive: true });
    const infos = await listCollections(db);
    const metadata = {
        format: 'bson-concatenated-v1',
        createdAt: new Date().toISOString(),
        database: db.databaseName,
        collections: []
    };
    for (const info of infos) {
        const snapshot = await getCollectionSnapshot(db, info);
        const safeName = info.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const bsonFile = `${safeName}.bson`;
        await writeBsonFile(path.join(backupDir, bsonFile), snapshot.docs || []);
        metadata.collections.push({ ...snapshot, docs: undefined, bsonFile });
    }
    await fs.promises.writeFile(
        path.join(backupDir, 'metadata.json'),
        EJSON.stringify(metadata, null, 2),
        'utf8'
    );
    return metadata;
};

const insertInBatches = async (collection, docs) => {
    for (let index = 0; index < docs.length; index += BATCH_SIZE) {
        const batch = docs.slice(index, index + BATCH_SIZE);
        if (batch.length) await collection.insertMany(batch, { ordered: true });
    }
};

const copyDatabase = async (sourceDb, targetDb) => {
    const sourceInfos = await listCollections(sourceDb);
    await targetDb.dropDatabase();
    for (const info of sourceInfos) {
        const source = sourceDb.collection(info.name);
        const target = await targetDb.createCollection(info.name, info.options || {});
        const docs = await source.find({}).sort({ _id: 1 }).toArray();
        await insertInBatches(target, docs);
        const indexes = await source.listIndexes().toArray();
        const specs = withoutIdIndex(indexes);
        if (specs.length) await target.createIndexes(specs);
    }
    return sourceInfos.map((info) => info.name);
};

const verifyDatabase = async (sourceDb, targetDb) => {
    const sourceSummary = await getDatabaseSummary(sourceDb);
    const targetSummary = await getDatabaseSummary(targetDb);
    const sourceByName = new Map(sourceSummary.map((item) => [item.name, item]));
    const targetByName = new Map(targetSummary.map((item) => [item.name, item]));
    const mismatches = [];
    for (const [name, source] of sourceByName) {
        const target = targetByName.get(name);
        if (!target || target.count !== source.count || target.digest !== source.digest) {
            mismatches.push({
                collection: name,
                sourceCount: source.count,
                targetCount: target ? target.count : 0,
                sourceDigest: source.digest,
                targetDigest: target ? target.digest : null
            });
        }
    }
    for (const name of targetByName.keys()) if (!sourceByName.has(name)) mismatches.push({ collection: name, unexpected: true });
    return { sourceSummary, targetSummary, mismatches };
};

const connect = async (uri) => new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 120000,
    maxPoolSize: 5
});

const run = async () => {
    const sourceEnv = readEnv(sourceEnvPath);
    const targetEnv = readEnv(targetEnvPath);
    const sourceUri = getUriParts(sourceEnv.MONGODB, 'Source');
    const targetUri = getUriParts(targetEnv.MONGODB, 'Target');
    assertSafety(sourceEnv, targetEnv, sourceUri, targetUri);

    const sourceClient = await connect(sourceEnv.MONGODB);
    const targetClient = await connect(targetEnv.MONGODB);
    try {
        await sourceClient.connect();
        await targetClient.connect();
        const sourceDb = sourceClient.db(sourceUri.pathname.slice(1));
        const targetDb = targetClient.db(targetUri.pathname.slice(1));
        const sourceSummary = await getDatabaseSummary(sourceDb);
        const targetSummary = await getDatabaseSummary(targetDb);
        const payload = {
            mode: isApply ? 'apply' : 'dry-run',
            source: { host: hostOf(sourceUri), database: sourceDb.databaseName, collections: sourceSummary },
            target: { host: hostOf(targetUri), database: targetDb.databaseName, collections: targetSummary },
            targetWillBeReplaced: isApply
        };
        if (!isApply) {
            console.log(JSON.stringify(payload, null, 2));
            return;
        }

        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.resolve(getArg('--backup-dir', path.join(OUTPUT_ROOT, `production_backup_before_local_migration_${stamp}`)));
        const backup = await createBackup(targetDb, backupDir);
        await copyDatabase(sourceDb, targetDb);
        const verification = await verifyDatabase(sourceDb, targetDb);
        if (verification.mismatches.length) {
            throw new Error(`Verification failed for ${verification.mismatches.length} collection(s). Backup is available at ${backupDir}.`);
        }
        console.log(JSON.stringify({
            ...payload,
            backup: {
                path: backupDir,
                collectionCount: backup.collections.length,
                documentCount: backup.collections.reduce((sum, item) => sum + item.count, 0)
            },
            applied: true,
            copiedCollections: verification.sourceSummary.length,
            copiedDocuments: verification.sourceSummary.reduce((sum, item) => sum + item.count, 0),
            verification: 'passed'
        }, null, 2));
    } finally {
        await Promise.all([sourceClient.close(), targetClient.close()]);
    }
};

run().catch((error) => {
    console.error(`Local to Production migration failed: ${error.message}`);
    process.exitCode = 1;
});
