const STATUS_CODES = Object.freeze({
    AVAILABLE: 'AVAILABLE',
    EXHIBITION: 'EXHIBITION',
    SOLD_OUT: 'SOLD_OUT',
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    RESERVED: 'RESERVED',
    NEW_STUDENT: 'NEW_STUDENT',
    OLD_STUDENT: 'OLD_STUDENT',
    CANCELLED: 'CANCELLED'
});

const LEGACY_NAMES = Object.freeze({
    AVAILABLE: ['Available'], EXHIBITION: ['Exhibition'], SOLD_OUT: ['Sold Out'],
    PENDING: ['Pending'], APPROVED: ['Approved'], REJECTED: ['Rejected'],
    RESERVED: ['Reserved'], NEW_STUDENT: ['NewStudent', 'New Student'],
    OLD_STUDENT: ['OldStudent', 'Old Student'], CANCELLED: ['Cancelled']
});

const queryForCode = code => ({
    $or: [
        { code },
        { 'title.value': { $in: LEGACY_NAMES[code] || [] }, 'title.key': 'en' }
    ]
});

const hasCode = (status, code) => Boolean(status && (status.code === code || (Array.isArray(status.title) && status.title.some(item => item.key === 'en' && (LEGACY_NAMES[code] || []).includes(item.value)))));

module.exports = { STATUS_CODES, LEGACY_NAMES, queryForCode, hasCode };
