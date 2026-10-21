const ArtworkCounter = require('../models/artworkCounter.model');

const cleanSegment = (value, fallback) => {
    const cleaned = String(value || '').normalize('NFKD')
        .replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    return cleaned || fallback;
};

/*
 * Shared identifier format:
 * {entityPrefix}-{studentIdFirst2}-{submissionCourseLevel}-{studentIdLast3}-{sequence2}
 * Example: BA-68-05-049-01
 *
 * Academic year stays in its own database field. It is not part of the
 * identifier, so code remains stable when record is edited.
 */
const getCodeParts = ({ artist, studentId, courseLevel }) => {
    const rawStudentId = artist?.studentId || studentId;
    const normalizedStudentId = cleanSegment(rawStudentId, 'UNKNOWN');

    return {
        studentId: normalizedStudentId,
        studentPrefix: normalizedStudentId.slice(0, 2).padStart(2, '0'),
        studentSuffix: normalizedStudentId.slice(-3).padStart(3, '0'),
        level: cleanSegment(courseLevel, '00').padStart(2, '0').slice(-2)
    };
};

const generateCode = async ({ prefix, entity, artist, studentId, courseLevel }) => {
    if (entity === 'ARTWORK' && !artist?.studentId && !studentId) {
        throw new Error('ARTWORK_CODE_REQUIRES_ARTIST_STUDENT_ID');
    }

    const parts = getCodeParts({ artist, studentId, courseLevel });
    const codePrefix = prefix + '-' + parts.studentPrefix + '-' + parts.level + '-' + parts.studentSuffix;
    // The counter must share the exact namespace that appears in the code.
    // Different full student IDs can share the first two and last three digits.
    const scope = entity + ':' + codePrefix;
    const [Model, field] = {
        ARTWORK: [require('../models/artwork.model'), 'artworkCode'],
        SUBMISSION: [require('../../Submission/models/submission.model'), 'submissionCode'],
        ORDER: [require('../../Order/models/order.model'), 'orderNumber']
    }[entity];
    const pattern = new RegExp('^' + codePrefix + '-[0-9]{2}$');
    const [issued, legacy] = await Promise.all([
        Model.findOne({ [field]: pattern }).sort({ [field]: -1 }).select(field).lean(),
        ArtworkCounter.findOne({ scope: new RegExp('^' + entity + ':' + parts.studentPrefix + '[A-Z0-9]*' + parts.studentSuffix + ':' + parts.level + '$') })
            .sort({ sequence: -1 }).select('sequence').lean()
    ]);
    let floor = Math.max(Number(issued?.[field]?.slice(-2)) || 0, legacy?.sequence || 0);
    if (entity === 'ARTWORK') {
        // Pending submission pieces can already reserve a code before publication.
        const reserved = await require('../../Submission/models/submission.model').aggregate([
            { $match: { 'assignments.artworks.artworkCode': pattern } },
            { $unwind: '$assignments' }, { $unwind: '$assignments.artworks' },
            { $match: { 'assignments.artworks.artworkCode': pattern } },
            { $sort: { 'assignments.artworks.artworkCode': -1 } }, { $limit: 1 },
            { $project: { code: '$assignments.artworks.artworkCode' } }
        ]);
        floor = Math.max(floor, Number(reserved[0]?.code?.slice(-2)) || 0);
    }
    try {
        await ArtworkCounter.findOneAndUpdate({ scope }, { $max: { sequence: floor } }, { upsert: true, setDefaultsOnInsert: false });
    } catch (error) {
        if (error.code !== 11000) throw error;
        // A concurrent initializer won the unique scope insert.
        await ArtworkCounter.updateOne({ scope }, { $max: { sequence: floor } });
    }
    const counter = await ArtworkCounter.findOneAndUpdate(
        { scope },
        { $inc: { sequence: 1 } },
        { new: true }
    );

    if (counter.sequence > 99) {
        throw new Error(entity + '_CODE_SEQUENCE_EXHAUSTED');
    }

    return codePrefix + '-' + String(counter.sequence).padStart(2, '0');
};

const generateArtworkCode = (options) => generateCode({
    ...options,
    entity: 'ARTWORK',
    prefix: 'BA'
});

const generateSubmissionCode = (options) => generateCode({
    ...options,
    entity: 'SUBMISSION',
    prefix: 'SUB'
});

const generateOrderCode = (options) => generateCode({
    ...options,
    entity: 'ORDER',
    prefix: 'ORD'
});

module.exports = {
    cleanSegment,
    getCodeParts,
    generateArtworkCode,
    generateSubmissionCode,
    generateOrderCode
};
