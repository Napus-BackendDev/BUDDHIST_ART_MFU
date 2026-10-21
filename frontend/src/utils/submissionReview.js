// Review codes survive administrator changes to display labels.
export function reviewCode(status) {
    const value = status && status.approval || status;
    if (value && value.code) return String(value.code).toUpperCase();
    const title = typeof value === 'string' ? value : value && (value.title || value.name);
    const label = Array.isArray(title) ? (title.find(item => item.key === 'en') || {}).value : title;
    const code = String(label || '').trim().toUpperCase();
    return { PASSED: 'APPROVED', FAIL: 'REJECTED' }[code] || code;
}

export function reviewCounts(artworks = []) {
    return artworks.reduce((counts, artwork) => {
        const key = { APPROVED: 'approved', PENDING: 'pending', REJECTED: 'rejected' }[reviewCode(artwork.status)];
        if (key) counts[key]++;
        return counts;
    }, { approved: 0, pending: 0, rejected: 0 });
}

export function submissionProgress(submission) {
    let totalPossible = 0;
    let totalSubmitted = 0;
    (submission.assignments || []).forEach(task => {
        totalPossible += (task.artist && task.artist.length) || (submission.artist || []).length;
        const owners = new Set();
        (task.artworks || []).forEach(artwork => {
            const owner = artwork.owner || artwork.artist;
            const id = owner && (owner._id || owner).toString();
            if (id) owners.add(id);
        });
        totalSubmitted += owners.size;
    });
    return totalPossible ? Math.min(100, Math.round(totalSubmitted / totalPossible * 100)) : 0;
}
