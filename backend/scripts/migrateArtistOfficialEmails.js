'use strict';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../server/Project/User/models/user.model');
const Role = require('../server/Project/Settings/models/role.model');
const {
    normalizeStudentId,
    normalizeEmail,
    buildOfficialEmail,
    isOfficialEmail
} = require('../server/Project/User/service/officialEmail');

const isApply = process.argv.includes('--apply');

const getMongoHost = () => {
    try {
        return new URL(process.env.MONGODB).hostname;
    } catch (error) {
        return '';
    }
};

const getArtistRoles = async () => Role.find({
    title: { $elemMatch: { key: 'en', value: /^artist$/i } }
}).select('_id').lean();

const inspectChanges = (users) => users.reduce((changes, user) => {
    const studentId = normalizeStudentId(user.studentId);
    const officialEmail = normalizeEmail(user.contact && user.contact.studentEmail);
    const personalEmail = normalizeEmail(user.contact && user.contact.personalEmail);
    const derivedEmail = buildOfficialEmail(studentId);

    if (!derivedEmail) {
        changes.invalid.push({ id: String(user._id), studentId });
        return changes;
    }

    if (officialEmail.toLowerCase() === derivedEmail && (personalEmail || isOfficialEmail(officialEmail))) {
        return changes;
    }

    const nextPersonalEmail = personalEmail || (!isOfficialEmail(officialEmail) ? officialEmail : '');
    changes.updates.push({
        user,
        studentId,
        derivedEmail,
        before: {
            studentEmail: officialEmail || null,
            personalEmail: personalEmail || null
        },
        after: {
            studentEmail: derivedEmail,
            personalEmail: nextPersonalEmail || null
        },
        moveLegacyOfficial: !personalEmail && !!officialEmail && !isOfficialEmail(officialEmail)
    });
    return changes;
}, { updates: [], invalid: [] });

const ensureNoConflicts = async (updates) => {
    const byEmail = new Map();
    updates.forEach(update => {
        const owner = byEmail.get(update.derivedEmail);
        if (owner && String(owner.user._id) !== String(update.user._id)) {
            throw new Error(`Duplicate target Official Email in Artist records: ${update.derivedEmail}`);
        }
        byEmail.set(update.derivedEmail, update);
    });

    const existing = await User.find({
        'contact.studentEmail': { $in: updates.map(update => update.derivedEmail) },
        _id: { $nin: updates.map(update => update.user._id) }
    }).select('_id studentId contact.studentEmail').lean();
    if (existing.length) {
        const details = existing.map(user => `${user.studentId}:${user.contact && user.contact.studentEmail}`).join(', ');
        throw new Error(`Target Official Email is already used by another account: ${details}`);
    }
};

const writeBackup = (updates) => {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.resolve(__dirname, '../../outputs');
    const backupPath = path.join(outputDir, `artist_official_email_migration_${stamp}.json`);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(backupPath, JSON.stringify(updates.map(update => ({
        _id: String(update.user._id),
        studentId: update.studentId,
        before: update.before,
        after: update.after
    })), null, 2), 'utf8');
    return backupPath;
};

const run = async () => {
    if (isApply && (process.env.NODE_ENV !== 'development' || !['localhost', '127.0.0.1', '::1'].includes(getMongoHost()))) {
        throw new Error('Refusing to apply migration: NODE_ENV must be development and MONGODB host must be localhost.');
    }

    const artistRoles = await getArtistRoles();
    if (!artistRoles.length) throw new Error('Artist role is not configured.');
    const artistRoleIds = artistRoles.map(role => role._id);

    const users = await User.find({ role: { $in: artistRoleIds } })
        .select('studentId contact role')
        .lean();
    const changes = inspectChanges(users);

    console.log(JSON.stringify({
        mode: isApply ? 'apply' : 'dry-run',
        scope: 'Artist',
        totalArtistUsers: users.length,
        pendingUpdates: changes.updates.length,
        invalidStudentIds: changes.invalid.length
    }, null, 2));

    if (changes.invalid.length) {
        throw new Error(`Cannot continue: ${changes.invalid.length} Artist records have an invalid Student ID.`);
    }
    if (!changes.updates.length || !isApply) return;

    await ensureNoConflicts(changes.updates);
    const backupPath = writeBackup(changes.updates);
    await User.bulkWrite(changes.updates.map(update => ({
        updateOne: {
            filter: { _id: update.user._id },
            update: {
                $set: {
                    'contact.studentEmail': update.after.studentEmail,
                    'contact.personalEmail': update.after.personalEmail
                }
            }
        }
    })), { ordered: true });

    const remainingUsers = await User.find({ role: { $in: artistRoleIds } })
        .select('studentId contact.studentEmail')
        .lean();
    const remaining = remainingUsers.filter(user => (
        normalizeEmail(user.contact && user.contact.studentEmail).toLowerCase()
        !== buildOfficialEmail(user.studentId)
    )).length;
    console.log(JSON.stringify({
        applied: changes.updates.length,
        remainingArtistEmailMismatches: remaining,
        backupPath
    }, null, 2));
};

mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(run)
    .catch(error => {
        console.error(`Artist Official Email migration failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
