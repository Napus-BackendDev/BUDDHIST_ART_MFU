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
    const scope = entity + ':' + parts.studentId + ':' + parts.level;
    const counter = await ArtworkCounter.findOneAndUpdate(
        { scope },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (counter.sequence > 99) {
        throw new Error(entity + '_CODE_SEQUENCE_EXHAUSTED');
    }

    return prefix + '-' + parts.studentPrefix + '-' + parts.level + '-' +
        parts.studentSuffix + '-' + String(counter.sequence).padStart(2, '0');
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
