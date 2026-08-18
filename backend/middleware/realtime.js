const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const READ_ONLY_SEGMENTS = new Set([
    'auth',
    'certificate',
    'explore',
    'explorers',
    'invoice'
]);

function getApiSegments(url) {
    return String(url || '')
        .split('?')[0]
        .split('/')
        .filter(Boolean);
}

function isDataMutation(request) {
    if (!MUTATION_METHODS.has(request.method)) return false;

    const segments = getApiSegments(request.originalUrl);
    const apiIndex = segments.indexOf('api');
    const resourceSegments = apiIndex >= 0 ? segments.slice(apiIndex + 2) : segments;

    // These POST endpoints query or authenticate; they do not change data.
    return !resourceSegments.some(segment => READ_ONLY_SEGMENTS.has(segment))
        && !(resourceSegments[0] === 'order' && resourceSegments[1] === 'order');
}

function getChange(resourceUrl, request) {
    const segments = getApiSegments(resourceUrl);
    const apiIndex = segments.indexOf('api');
    const resourceSegments = apiIndex >= 0 ? segments.slice(apiIndex + 2) : segments;
    const resource = resourceSegments[0] || 'unknown';
    const scope = resourceSegments.slice(0, 2).join('.') || resource;
    const id = request.body && typeof request.body._id === 'string'
        ? request.body._id
        : null;

    return {
        resource,
        scope,
        action: request.method.toLowerCase(),
        id,
        occurredAt: new Date().toISOString()
    };
}

module.exports = function realtimeMutationEmitter(request, response, next) {
    if (!isDataMutation(request)) return next();

    response.on('finish', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) return;

        const io = request.app.get('io');
        if (!io) return;

        io.emit('admin:data-changed', getChange(request.originalUrl, request));
    });

    next();
};

module.exports.isDataMutation = isDataMutation;
module.exports.getChange = getChange;
