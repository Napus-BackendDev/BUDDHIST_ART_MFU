'use strict';

const OFFICIAL_EMAIL_DOMAIN = 'lamduan.mfu.ac.th';

const normalizeStudentId = (value) => String(value == null ? '' : value).trim();
// Course names come from spreadsheets: drop zero-width characters and doubled Thai vowel marks (e.g. "พุุทธ").
const normalizeCourse = (value) => String(value == null ? '' : value)
    .replace(/[​-‍⁠﻿]/g, '')
    .replace(/([ัิ-ฺ็-๎])\1+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeEmail = (value) => {
    const email = String(value == null ? '' : value).trim();
    return email === '-' ? '' : email;
};

const isStudentIdPart = (studentId) => /^[A-Za-z0-9._-]+$/.test(studentId);

const buildOfficialEmail = (studentId) => {
    const normalizedId = normalizeStudentId(studentId);
    if (!normalizedId || !isStudentIdPart(normalizedId)) return '';
    return `${normalizedId}@${OFFICIAL_EMAIL_DOMAIN}`.toLowerCase();
};

const isOfficialEmail = (email) => normalizeEmail(email).toLowerCase().endsWith(`@${OFFICIAL_EMAIL_DOMAIN}`);

const getRoleName = (role) => {
    if (!role) return '';
    if (typeof role === 'string') return role.trim().toLowerCase();
    if (role.title && Array.isArray(role.title)) {
        const title = role.title.find(item => item.key === 'en') || role.title[0];
        return title && title.value ? String(title.value).trim().toLowerCase() : '';
    }
    return '';
};

const isArtistRole = (role, roleNameById = new Map()) => {
    const directName = getRoleName(role);
    if (directName) return directName === 'artist';
    const roleId = role && role._id ? String(role._id) : String(role || '');
    return roleNameById.get(roleId) === 'artist';
};

/**
 * Derive Artist contact details without losing a legacy non-Lamduan address.
 * A supplied Personal Email always wins; an existing Personal Email wins over
 * a legacy Official Email when importing/updating an existing account.
 */
const normalizeArtistContact = (studentId, incomingContact = {}, existingContact = {}) => {
    const incoming = incomingContact && typeof incomingContact.toObject === 'function'
        ? incomingContact.toObject()
        : (incomingContact || {});
    const existing = existingContact && typeof existingContact.toObject === 'function'
        ? existingContact.toObject()
        : (existingContact || {});
    const officialEmail = buildOfficialEmail(studentId);
    if (!officialEmail) return { ...existing, ...incoming };

    const incomingOfficial = normalizeEmail(incoming.studentEmail);
    const existingOfficial = normalizeEmail(existing.studentEmail);
    const incomingPersonal = normalizeEmail(incoming.personalEmail);
    const existingPersonal = normalizeEmail(existing.personalEmail);
    const legacyOfficial = [incomingOfficial, existingOfficial]
        .find(email => email && !isOfficialEmail(email));

    return {
        ...existing,
        ...incoming,
        studentEmail: officialEmail,
        personalEmail: incomingPersonal || existingPersonal || legacyOfficial || null
    };
};

module.exports = {
    OFFICIAL_EMAIL_DOMAIN,
    normalizeStudentId,
    normalizeCourse,
    normalizeEmail,
    buildOfficialEmail,
    isOfficialEmail,
    getRoleName,
    isArtistRole,
    normalizeArtistContact
};
