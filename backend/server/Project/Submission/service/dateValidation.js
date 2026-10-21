module.exports = function hasInvalidSubmissionDates(data) {
    const ranges = [data && data.create, ...(Array.isArray(data && data.assignments) ? data.assignments.map(a => a.create) : [])];
    return ranges.some(range => {
        if (!range) return false;
        const values = [range.startAt, range.endAt];
        if (values.some(value => value != null && value !== '' && !Number.isFinite(new Date(value).getTime()))) return true;
        return values.every(value => value != null && value !== '') && new Date(range.endAt) < new Date(range.startAt);
    });
};
