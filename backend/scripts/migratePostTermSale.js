'use strict';

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.dev') });

const Artwork = require('../server/Project/Artwork/models/artwork.model');
const Submission = require('../server/Project/Submission/models/submission.model');
const Status = require('../server/Project/Settings/models/status.model');
const { buildPostTermSale, getEffectiveMode, constants } = require('../server/Project/Artwork/service/postTermSale');

const idString = value => value && (value._id || value).toString();

async function migrate({ apply = false } = {}) {
    const [exhibition, soldOut, reserved] = await Promise.all([
        Status.findOne({ 'title.value': 'Exhibition', 'title.key': 'en' }).lean(),
        Status.findOne({ 'title.value': 'Sold Out', 'title.key': 'en' }).lean(),
        Status.findOne({ 'title.value': 'Reserved', 'title.key': 'en' }).lean()
    ]);
    const artworks = await Artwork.find({
        submissionArtworkId: { $exists: true, $ne: null },
        $or: [{ 'postTermSale.applicable': { $ne: true } }, { 'postTermSale.needsReview': true }]
    }).lean();
    const summary = {
        scanned: artworks.length,
        initialized: 0,
        wouldContinueSale: 0,
        wouldPauseSale: 0,
        missingSubmission: 0,
        missingEndAt: 0,
        needsReview: 0,
        applied: apply
    };
    const now = new Date();

    for (const artwork of artworks) {
        const submission = await Submission.findOne(
            { 'assignments.artworks._id': artwork.submissionArtworkId },
            { 'create.endAt': 1 }
        ).lean();
        const endAt = submission?.create?.endAt;
        let update = null;
        if (!submission) {
            summary.missingSubmission += 1;
            summary.needsReview += 1;
            update = {
                'postTermSale.applicable': true,
                'postTermSale.needsReview': true,
                'postTermSale.reviewReason': 'Source Submission was not found',
                'postTermSale.mode': constants.MODES.DISPLAY,
                'postTermSale.decision': constants.DECISIONS.PENDING,
                'postTermSale.note': 'ต้องตรวจสอบ Submission ต้นทางและวันครบกำหนดก่อนเปิดขาย'
            };
            if (exhibition && idString(artwork.status?.sale) !== idString(soldOut) && idString(artwork.status?.approval) !== idString(reserved)) {
                update['status.sale'] = exhibition._id;
            }
        } else if (!endAt) {
            summary.missingEndAt += 1;
            summary.needsReview += 1;
            update = {
                'postTermSale.applicable': true,
                'postTermSale.needsReview': true,
                'postTermSale.reviewReason': 'Submission endAt is missing',
                'postTermSale.mode': constants.MODES.DISPLAY,
                'postTermSale.decision': constants.DECISIONS.PENDING,
                'postTermSale.note': 'ต้องตรวจสอบวันครบกำหนดก่อนเปิดขาย'
            };
            if (exhibition && idString(artwork.status?.sale) !== idString(soldOut) && idString(artwork.status?.approval) !== idString(reserved)) {
                update['status.sale'] = exhibition._id;
            }
        } else {
            const postTermSale = buildPostTermSale(endAt);
            const mode = getEffectiveMode(postTermSale, now);
            summary.initialized += 1;
            if (mode === constants.MODES.DISPLAY) summary.wouldPauseSale += 1;
            if (mode !== constants.MODES.DISPLAY) summary.wouldContinueSale += 1;
            if (mode === constants.MODES.DISPLAY) {
                postTermSale.mode = constants.MODES.DISPLAY;
                postTermSale.effectiveAt = postTermSale.initialSaleEndsAt;
                postTermSale.recordedAs = 'system';
                postTermSale.history = [{
                    decision: postTermSale.decision,
                    mode: constants.MODES.DISPLAY,
                    recordedAt: now,
                    recordedAs: 'system',
                    contactMethod: 'system',
                    note: 'Migrated after the initial sale term had already ended.'
                }];
            }
            update = { postTermSale };
            if (mode === constants.MODES.DISPLAY
                && exhibition
                && idString(artwork.status?.sale) !== idString(soldOut)
                && idString(artwork.status?.approval) !== idString(reserved)) {
                update['status.sale'] = exhibition._id;
            }
        }
        if (apply) await Artwork.updateOne({ _id: artwork._id }, { $set: update });
    }
    return summary;
}

async function main() {
    if (!process.env.MONGODB) throw new Error('MONGODB URI not found in .env.dev');
    await mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true });
    const summary = await migrate({ apply: process.argv.includes('--apply') });
    console.log(JSON.stringify(summary, null, 2));
    await mongoose.disconnect();
}

if (require.main === module) {
    main().catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
}

module.exports = { migrate };
