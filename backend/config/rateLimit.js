const rateLimit = require('express-rate-limit');
const { isIP } = require('net');

function configureTrustProxy(app, env = process.env) {
    const proxies = (env.TRUSTED_PROXIES || '').split(',').map(s => s.trim()).filter(Boolean);
    for (const proxy of proxies) {
        const [address, prefix, extra] = proxy.split('/');
        const version = isIP(address);
        if (!version || extra !== undefined || (prefix !== undefined &&
            (!/^\d+$/.test(prefix) || Number(prefix) <= 0 || Number(prefix) > (version === 4 ? 32 : 128)))) {
            throw new Error('TRUSTED_PROXIES must contain explicit proxy IP addresses or non-global CIDRs.');
        }
    }
    app.set('trust proxy', proxies.length ? proxies : false);
}

function positiveInteger(env, name, fallback) {
    if (env[name] === undefined || env[name] === '') return fallback;
    const value = Number(env[name]);
    if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`${name} must be a positive integer.`);
    return value;
}

function createApiLimiter(env = process.env) {
    // Independent budgets prevent public reads from locking out login or writes.
    const defaults = { READ: [120, 60000], IMAGE: [60, 60000], WRITE: [30, 60000], UPLOAD: [10, 300000], AUTH: [10, 900000] };
    const policies = {};
    for (const [name, [max, windowMs]] of Object.entries(defaults)) {
        policies[name] = rateLimit({
            windowMs: positiveInteger(env, `RATE_LIMIT_${name}_WINDOW_MS`, windowMs),
            limit: positiveInteger(env, `RATE_LIMIT_${name}_MAX`, max),
            standardHeaders: 'draft-7', legacyHeaders: false,
            skipSuccessfulRequests: name === 'AUTH',
            handler(req, res) {
                const retryAfter = Math.max(1, Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000));
                if (req.rateLimit.used === req.rateLimit.limit + 1) console.warn('[RateLimit]', { policy: name, ip: req.ip });
                res.set('Retry-After', String(retryAfter));
                res.status(429).json({ code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.', retryAfter });
            }
        });
    }
    return (req, res, next) => {
        if (req.method === 'OPTIONS') return next();
        const path = req.path.replace(/\/+$/, '').toLowerCase();
        const reading = ['GET', 'HEAD'].includes(req.method);
        let policy;
        if (/^\/(google\/auth|user\/auth(?:\/|$))/.test(path)) policy = 'AUTH';
        else if (!reading && /\/(upload|import-excel)$/.test(path)) policy = 'UPLOAD';
        else if (reading && /^\/submission\/image\//.test(path)) policy = 'IMAGE';
        else policy = reading ? 'READ' : 'WRITE';
        return policies[policy](req, res, next);
    };
}

module.exports = { createApiLimiter, configureTrustProxy };
