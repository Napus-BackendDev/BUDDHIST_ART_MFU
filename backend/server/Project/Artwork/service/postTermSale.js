const mongoose = require('mongoose');
const ArtworkModel = require('../models/artwork.model');
const StatusModel = require('../../Settings/models/status.model');
const ResMessage = require('../../Settings/service/message');
const { queryForCode, STATUS_CODES } = require('../../Settings/statusCodes');

const MODES = Object.freeze({ INITIAL: 'initial_term', STANDARD: 'standard_sale', DISPLAY: 'display_only' });
const DECISIONS = Object.freeze({ PENDING: 'pending', CONTINUE: 'continue_sale', DISPLAY: 'display_only' });
const ADMIN_CONTACT_METHODS = new Set(['phone', 'email', 'in_person']);

const idString = value => value && (value._id || value).toString();
const isValidObjectId = value => mongoose.Types.ObjectId.isValid(value);

// Add one calendar year while preserving the stored UTC instant. This also makes
// the result deterministic regardless of the server's local timezone.
const addCalendarYear = value => {
    if (!value) return null;
    const result = new Date(value);
    if (Number.isNaN(result.getTime())) return null;
    result.setUTCFullYear(result.getUTCFullYear() + 1);
    return result;
};

const buildPostTermSale = endAt => {
    const initialSaleEndsAt = addCalendarYear(endAt);
    if (!initialSaleEndsAt) {
        return {
            applicable: true,
            needsReview: true,
            mode: MODES.DISPLAY,
            decision: DECISIONS.PENDING,
            note: 'Submission endAt is missing; review the deadline before enabling sale.'
        };
    }
    return {
        applicable: true,
        initialSaleEndsAt,
        mode: MODES.INITIAL,
        decision: DECISIONS.PENDING,
        effectiveAt: initialSaleEndsAt
    };
};

const getEffectiveMode = (postTermSale, now = new Date()) => {
    if (!postTermSale?.applicable) return null;
    if (postTermSale.needsReview || !postTermSale.initialSaleEndsAt) return MODES.DISPLAY;
    if (new Date(postTermSale.initialSaleEndsAt) > now) return MODES.INITIAL;
    return postTermSale.decision === DECISIONS.CONTINUE ? MODES.STANDARD : MODES.DISPLAY;
};

const isPostTermPurchasable = (artwork, now = new Date()) => {
    if (!artwork?.postTermSale?.applicable) return true;
    if (artwork.postTermSale.needsReview) return false;
    return getEffectiveMode(artwork.postTermSale, now) !== MODES.DISPLAY;
};

const isAdminUser = request => String(request?.user?.role || '').toLowerCase() === 'admin';
const requestUserId = request => request?.user?.userId || request?.user?._id || request?.user?.id || null;
const sameId = (a, b) => !!a && !!b && idString(a) === idString(b);

const getStatus = async name => {
    const code = STATUS_CODES[String(name).toUpperCase().replace(/ /g, '_')] || String(name).toUpperCase().replace(/ /g, '_');
    return StatusModel.findOne(queryForCode(code)).lean();
};

const statusId = (status, field) => idString(status?.status?.[field] || status?.[field]);

const setSaleStatusForMode = async (artwork, mode, statuses = {}) => {
    if (!artwork || !mode) return artwork;
    const currentApproval = statusId(artwork, 'approval');
    const currentSale = statusId(artwork, 'sale');
    const soldOutId = idString(statuses.soldOut);
    const reservedId = idString(statuses.reserved);
    const availableId = idString(statuses.available);
    const exhibitionId = idString(statuses.exhibition);

    // A reserved or sold artwork must keep its transaction/result state. The
    // post-term mode remains authoritative for whether a new order may start.
    if ((soldOutId && currentSale === soldOutId) || (reservedId && currentApproval === reservedId)) {
        return artwork;
    }

    let nextSale = null;
    if (mode === MODES.DISPLAY) nextSale = exhibitionId;
    if (mode === MODES.STANDARD) {
        nextSale = availableId;
    }
    if (!nextSale || nextSale === currentSale) return artwork;
    return ArtworkModel.findOneAndUpdate(
        { _id: artwork._id },
        { $set: { 'status.sale': nextSale } },
        { new: true }
    ).lean();
};

const sendDecisionMail = async (artwork, decision) => {
    const email = artwork?.artist?.contact?.studentEmail || artwork?.artist?.contact?.personalEmail;
    if (!email) return;
    try {
        const { sendMail } = require('../../../../helpers/google/Mail');
        const title = artwork.title?.find(item => item.key === 'th')?.value
            || artwork.title?.find(item => item.key === 'en')?.value
            || 'Artwork';
        const choice = decision === DECISIONS.CONTINUE ? 'วางขายต่อแบบปกติ / Continue regular sale' : 'แสดงเฉย ๆ / Display only';
        const html = `<p>บันทึกความประสงค์สำหรับผลงาน <strong>${title}</strong> แล้ว</p><p>ผลการเลือก: <strong>${choice}</strong></p>`;
        await sendMail(email, 'ยืนยันการขายผลงานครบสิทธิ์ 1 ปี - พุทธศิลปกรรม มฟล.', '', html);
    } catch (error) {
        console.error('[PostTermSale] Decision email failed:', error.message);
    }
};

const sendReminderMail = async (artwork, kind) => {
    const email = artwork?.artist?.contact?.studentEmail || artwork?.artist?.contact?.personalEmail;
    if (!email) return;
    try {
        const { sendMail } = require('../../../../helpers/google/Mail');
        const title = artwork.title?.find(item => item.key === 'th')?.value
            || artwork.title?.find(item => item.key === 'en')?.value
            || 'Artwork';
        const suffix = kind === 'expired'
            ? 'ครบกำหนดแล้ว ระบบหยุดรับคำสั่งซื้อใหม่จนกว่าจะได้รับความประสงค์'
            : `สิทธิ์ขายจะครบกำหนดใน ${kind} วัน กรุณาเลือกขายต่อแบบปกติหรือแสดงเฉย ๆ`;
        await sendMail(email, 'แจ้งเตือนการขายผลงานครบสิทธิ์ 1 ปี - พุทธศิลปกรรม มฟล.', '', `<p>${title}</p><p>${suffix}</p>`);
    } catch (error) {
        console.error('[PostTermSale] Reminder email failed:', error.message);
    }
};

const populateArtwork = query => query
    .populate('artist')
    .populate('status.approval')
    .populate('status.sale')
    .populate('category')
    .populate('storage');

const applyDecision = async ({ artworkId, decision, request }) => {
    if (!isValidObjectId(artworkId)) {
        const error = new Error('ARTWORK_ID_REQUIRED');
        error.statusCode = 400;
        throw error;
    }
    if (![DECISIONS.CONTINUE, DECISIONS.DISPLAY].includes(decision)) {
        const error = new Error('POST_TERM_DECISION_REQUIRED');
        error.statusCode = 400;
        throw error;
    }
    const artwork = await populateArtwork(ArtworkModel.findById(artworkId));
    if (!artwork) {
        const error = new Error('ARTWORK_NOT_FOUND');
        error.statusCode = 404;
        throw error;
    }
    const principalId = requestUserId(request);
    if (!isAdminUser(request) && !sameId(artwork.artist, principalId)) {
        const error = new Error('ARTWORK_OWNER_REQUIRED');
        error.statusCode = 403;
        throw error;
    }
    if (!artwork.postTermSale?.applicable || !artwork.postTermSale.initialSaleEndsAt) {
        const error = new Error('POST_TERM_NOT_APPLICABLE');
        error.statusCode = 409;
        throw error;
    }

    const now = new Date();
    const currentSaleData = typeof artwork.postTermSale?.toObject === 'function'
        ? artwork.postTermSale.toObject()
        : { ...(artwork.postTermSale || {}) };
    const mode = getEffectiveMode({ ...currentSaleData, decision }, now);
    // Repeated clicks for the already-effective choice are idempotent and do
    // not create duplicate audit entries or confirmation emails.
    if (currentSaleData.decision === decision
        && currentSaleData.decisionAt
        && getEffectiveMode(currentSaleData, now) === mode) {
        return artwork;
    }
    const recordedAs = isAdminUser(request) ? 'admin' : 'artist';
    const contactMethod = request.body?.contactMethod || (recordedAs === 'artist' ? 'portal' : null);
    if (recordedAs === 'admin' && !ADMIN_CONTACT_METHODS.has(contactMethod)) {
        const error = new Error('CONTACT_METHOD_REQUIRED');
        error.statusCode = 400;
        throw error;
    }
    const historyEntry = {
        decision,
        mode,
        recordedAt: now,
        recordedBy: isValidObjectId(principalId) ? principalId : null,
        recordedAs,
        contactMethod,
        note: String(request.body?.note || '').trim()
    };
    const updated = await ArtworkModel.findOneAndUpdate(
        {
            _id: artwork._id,
            'postTermSale.applicable': true,
            'postTermSale.initialSaleEndsAt': artwork.postTermSale.initialSaleEndsAt,
            'postTermSale.decision': currentSaleData.decision,
            'postTermSale.mode': currentSaleData.mode
        },
        {
            $set: {
                'postTermSale.decision': decision,
                'postTermSale.mode': mode,
                'postTermSale.decisionAt': now,
                'postTermSale.effectiveAt': artwork.postTermSale.initialSaleEndsAt,
                'postTermSale.recordedBy': historyEntry.recordedBy,
                'postTermSale.recordedAs': recordedAs,
                'postTermSale.contactMethod': contactMethod,
                'postTermSale.note': historyEntry.note
            },
            $push: { 'postTermSale.history': historyEntry }
        },
        { new: true }
    ).lean();
    if (!updated) {
        const error = new Error('POST_TERM_CONFLICT');
        error.statusCode = 409;
        throw error;
    }

    const statuses = {
        available: await getStatus('Available'),
        exhibition: await getStatus('Exhibition'),
        soldOut: await getStatus('Sold Out'),
        reserved: await getStatus('Reserved'),
        approved: await getStatus('Approved')
    };
    await setSaleStatusForMode(updated, mode, statuses);
    const result = await populateArtwork(ArtworkModel.findById(updated._id));
    await sendDecisionMail(result, decision);
    return result;
};

const sendJson = async (response, code, data) => ResMessage.sendResponse(response, 0, code, data);

exports.constants = { MODES, DECISIONS, addCalendarYear, buildPostTermSale, getEffectiveMode, isPostTermPurchasable, isAdminUser, requestUserId };
exports.getEffectiveMode = getEffectiveMode;
exports.isPostTermPurchasable = isPostTermPurchasable;
exports.buildPostTermSale = buildPostTermSale;
exports.addCalendarYear = addCalendarYear;
exports.isAdminUser = isAdminUser;
exports.requestUserId = requestUserId;
exports.setSaleStatusForMode = setSaleStatusForMode;

exports.onList = async (request, response) => {
    try {
        const admin = isAdminUser(request);
        const query = { 'postTermSale.applicable': true };
        const userId = requestUserId(request);
        if (!admin) {
            if (!isValidObjectId(userId)) return sendJson(response, 40300, null);
            query.artist = userId;
        } else if (request.query.artist && isValidObjectId(request.query.artist)) {
            query.artist = request.query.artist;
        }
        if (request.query.decision && Object.values(DECISIONS).includes(request.query.decision)) {
            query['postTermSale.decision'] = request.query.decision;
        }
        if (request.query.mode && Object.values(MODES).includes(request.query.mode)) {
            query['postTermSale.mode'] = request.query.mode;
        }
        const fromDate = request.query.fromDate || request.query.from;
        const toDate = request.query.toDate || request.query.to;
        if (fromDate || toDate) {
            query['postTermSale.initialSaleEndsAt'] = {};
            const from = fromDate ? new Date(fromDate) : null;
            const to = toDate ? new Date(toDate) : null;
            if (from && !Number.isNaN(from.getTime())) query['postTermSale.initialSaleEndsAt'].$gte = from;
            if (to && !Number.isNaN(to.getTime())) query['postTermSale.initialSaleEndsAt'].$lte = to;
            if (!Object.keys(query['postTermSale.initialSaleEndsAt']).length) delete query['postTermSale.initialSaleEndsAt'];
        }
        const docs = await populateArtwork(ArtworkModel.find(query).sort({ 'postTermSale.initialSaleEndsAt': 1 })).lean();
        return sendJson(response, 20000, docs);
    } catch (error) {
        console.error('[PostTermSale] List failed:', error);
        return sendJson(response, 40400, null);
    }
};

exports.onDecision = async (request, response) => {
    try {
        const artworkIds = Array.isArray(request.body?.artworkIds)
            ? request.body.artworkIds
            : [request.body?.artworkId];
        const uniqueIds = [...new Set(artworkIds.filter(Boolean).map(String))];
        if (!uniqueIds.length) return sendJson(response, 40000, { error: 'ARTWORK_ID_REQUIRED' });
        const results = [];
        for (const artworkId of uniqueIds) {
            results.push(await applyDecision({ artworkId, decision: request.body.decision, request }));
        }
        return sendJson(response, 20000, results);
    } catch (error) {
        const code = error.statusCode === 403 ? 40300 : error.statusCode === 404 ? 40400 : error.statusCode === 409 ? 40900 : 40000;
        return sendJson(response, code, { error: error.message });
    }
};

exports.runJob = async (now = new Date()) => {
    const docs = await populateArtwork(ArtworkModel.find({
        'postTermSale.applicable': true,
        'postTermSale.initialSaleEndsAt': { $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) }
    })).lean();
    const statuses = {
        available: await getStatus('Available'),
        exhibition: await getStatus('Exhibition'),
        soldOut: await getStatus('Sold Out'),
        reserved: await getStatus('Reserved'),
        approved: await getStatus('Approved')
    };
    let transitioned = 0;
    let reminded = 0;
    for (const doc of docs) {
        const endAt = new Date(doc.postTermSale.initialSaleEndsAt);
        const daysUntil = (endAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
        const updates = {};
        let reminder = null;
        let reminderPath = null;
        if (daysUntil <= 30 && daysUntil > 7 && !doc.postTermSale.notifications?.day30SentAt) {
            reminderPath = 'postTermSale.notifications.day30SentAt';
            reminder = '30';
        } else if (daysUntil <= 7 && daysUntil > 0 && !doc.postTermSale.notifications?.day7SentAt) {
            reminderPath = 'postTermSale.notifications.day7SentAt';
            reminder = '7';
        }
        if (endAt <= now && !doc.postTermSale.notifications?.expiredSentAt) {
            reminderPath = 'postTermSale.notifications.expiredSentAt';
            reminder = 'expired';
        }
        // Claim each reminder with a compare-and-set update. This prevents two
        // overlapping cron workers from sending the same email twice.
        if (reminderPath) {
            const claimed = await ArtworkModel.findOneAndUpdate(
                { _id: doc._id, [reminderPath]: null },
                { $set: { [reminderPath]: now } },
                { new: true }
            ).lean();
            if (!claimed) reminder = null;
        }
        if (endAt <= now && doc.postTermSale.mode === MODES.INITIAL) {
            const mode = doc.postTermSale.decision === DECISIONS.CONTINUE ? MODES.STANDARD : MODES.DISPLAY;
            updates['postTermSale.mode'] = mode;
            updates['postTermSale.effectiveAt'] = endAt;
            updates['postTermSale.recordedAs'] = doc.postTermSale.decision === DECISIONS.PENDING ? 'system' : doc.postTermSale.recordedAs;
            const historyEntry = {
                decision: doc.postTermSale.decision,
                mode,
                recordedAt: now,
                recordedAs: 'system',
                contactMethod: 'system',
                note: doc.postTermSale.decision === DECISIONS.PENDING
                    ? 'Automatically applied because no decision was recorded by the deadline.'
                    : 'Automatically applied at the end of the initial sale term.'
            };
            await ArtworkModel.updateOne(
                { _id: doc._id, 'postTermSale.mode': MODES.INITIAL },
                { $set: updates, $push: { 'postTermSale.history': historyEntry } }
            );
            await setSaleStatusForMode({ ...doc, postTermSale: { ...doc.postTermSale, mode } }, mode, statuses);
            transitioned += 1;
        }
        if (reminder) {
            await sendReminderMail(doc, reminder);
            reminded += 1;
        }
    }
    return { transitioned, reminded };
};

module.exports = exports;
