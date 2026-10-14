'use strict';

const axios = require('axios');
const sharp = require('sharp');
const mongoose = require('mongoose');
const Submission = require('../models/submission.model');

const cache = new Map();
const pending = new Map();
const MAX_BYTES = 10 * 1024 * 1024;
const CACHE_BYTES = 64 * 1024 * 1024;
const TTL = 60 * 60 * 1000;
let cachedBytes = 0;

function allowedUrl(value) {
    const url = new URL(value);
    const allowed = ['drive.google.com', 'drive.usercontent.google.com', 'mfudrive.mfu.ac.th'].includes(url.hostname)
        || /^lh\d+\.googleusercontent\.com$/.test(url.hostname);
    if (!allowed || url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) {
        throw new Error('Unsupported image host');
    }
    return url;
}

async function download(value) {
    let url = allowedUrl(value);
    for (let i = 0; i < 5; i++) {
        const response = await axios.get(url.href, {
            responseType: 'arraybuffer', timeout: 15000, maxContentLength: MAX_BYTES,
            maxRedirects: 0, validateStatus: () => true
        });
        if ([301, 302, 303, 307, 308].includes(response.status) && response.headers.location) {
            url = allowedUrl(new URL(response.headers.location, url).href);
            continue;
        }
        if (response.status !== 200 || !/^image\/(jpeg|png|webp|gif)\b/i.test(response.headers['content-type'] || '')) {
            throw new Error('Image provider did not return an image');
        }
        const input = Buffer.from(response.data);
        if (input.length > MAX_BYTES) throw new Error('Image exceeds size limit');
        return sharp(input, { limitInputPixels: 40000000 }).rotate()
            .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 }).toBuffer();
    }
    throw new Error('Too many image redirects');
}

async function loadImage(source) {
    const url = allowedUrl(source);
    let candidates = [url.href];
    if (url.hostname === 'drive.google.com') {
        const id = url.searchParams.get('id') || (url.pathname.match(/\/file\/d\/([^/]+)/) || [])[1];
        if (!id || !/^[\w-]+$/.test(id)) throw new Error('Invalid Drive file ID');
        candidates = [`https://lh3.googleusercontent.com/d/${id}`, `https://drive.google.com/uc?export=download&id=${id}`];
    }
    for (const candidate of candidates) {
        try { return await download(candidate); } catch (_) { /* Try the other public image endpoint. */ }
    }
    throw new Error('Image is unavailable or not publicly shared');
}

async function cachedImage(source) {
    const entry = cache.get(source);
    if (entry && entry.expires > Date.now()) return entry.buffer;
    if (entry) { cachedBytes -= entry.buffer.length; cache.delete(source); }
    if (pending.has(source)) return pending.get(source);
    const task = loadImage(source).then(buffer => {
        while (cachedBytes + buffer.length > CACHE_BYTES && cache.size) {
            const key = cache.keys().next().value;
            cachedBytes -= cache.get(key).buffer.length;
            cache.delete(key);
        }
        cache.set(source, { buffer, expires: Date.now() + TTL });
        cachedBytes += buffer.length;
        return buffer;
    }).finally(() => pending.delete(source));
    pending.set(source, task);
    return task;
}

exports.onImage = async (req, res) => {
    const id = req.params.artworkId;
    if (!/^[a-f\d]{24}$/i.test(id || '') || !mongoose.Types.ObjectId.isValid(id)) return res.sendStatus(400);
    try {
        // Like the existing public Submission query, this only reads stored artwork data.
        const document = await Submission.findOne({ 'assignments.artworks._id': id })
            .select('assignments.artworks._id assignments.artworks.image').lean();
        const artwork = document?.assignments?.flatMap(a => a.artworks || []).find(a => String(a._id) === id);
        if (!artwork?.image) return res.sendStatus(404);
        const buffer = await cachedImage(artwork.image);
        res.set('Cache-Control', 'public, max-age=3600');
        res.set('X-Content-Type-Options', 'nosniff');
        return res.type('jpeg').send(buffer);
    } catch (_) {
        return res.status(502).json({ message: 'Image is unavailable. Check the source link or upload an image file.' });
    }
};
