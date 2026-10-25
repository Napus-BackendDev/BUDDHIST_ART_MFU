'use strict';

const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const axios = require('axios');

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);
const EXISTING_COLLECTION_STATUS = new Set([200, 201, 204, 405]);
const knownCollections = new Set();

const trimTrailingSlash = value => String(value || '').replace(/\/+$/, '');

function deriveWebDavUrl(shareUrl) {
    if (!shareUrl) return '';
    try {
        const url = new URL(shareUrl);
        const match = url.pathname.match(/\/s\/([^/]+)/i);
        if (!match) return '';
        return `${url.origin}/public.php/dav/files/${encodeURIComponent(match[1])}`;
    } catch (error) {
        return '';
    }
}

function config() {
    const shareUrl = trimTrailingSlash(process.env.MFU_DRIVE_SHARE_URL);
    const webDavUrl = trimTrailingSlash(process.env.MFU_DRIVE_WEBDAV_URL || deriveWebDavUrl(shareUrl));
    const publicUrl = trimTrailingSlash(process.env.MFU_DRIVE_PUBLIC_URL || webDavUrl);
    const enabled = TRUE_VALUES.has(String(process.env.MFU_DRIVE_ENABLED || '').toLowerCase());

    return {
        enabled,
        shareUrl,
        webDavUrl,
        publicUrl,
        username: process.env.MFU_DRIVE_USERNAME || '',
        password: process.env.MFU_DRIVE_PASSWORD || '',
        timeoutMs: Number(process.env.MFU_DRIVE_TIMEOUT_MS || 30000)
    };
}

function isEnabled() {
    return config().enabled;
}

function assertConfigured() {
    const current = config();
    if (!current.enabled) return current;
    if (!current.webDavUrl || !current.publicUrl) {
        throw new Error('MFU Drive is enabled but MFU_DRIVE_SHARE_URL or MFU_DRIVE_WEBDAV_URL is missing.');
    }
    return current;
}

function normalizeRelativePath(relativePath) {
    const value = String(relativePath || '').replace(/\\/g, '/').replace(/^\/+/, '');
    const normalized = path.posix.normalize(value);
    if (!normalized || normalized === '.' || normalized.startsWith('../') || normalized.includes('/../')) {
        throw new Error(`Invalid MFU Drive relative path: ${relativePath}`);
    }
    return normalized;
}

function encodePath(relativePath) {
    return normalizeRelativePath(relativePath)
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');
}

function decodePath(value) {
    try {
        return decodeURIComponent(value);
    } catch (error) {
        return value;
    }
}

function publicFileUrl(relativePath) {
    const current = assertConfigured();
    return `${current.publicUrl}/${encodePath(relativePath)}`;
}

function webDavFileUrl(relativePath) {
    const current = assertConfigured();
    return `${current.webDavUrl}/${encodePath(relativePath)}`;
}

function requestOptions(current, headers = {}) {
    const options = {
        headers,
        timeout: current.timeoutMs,
        maxContentLength: 50 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024,
        validateStatus: () => true
    };
    if (current.username) options.auth = { username: current.username, password: current.password };
    return options;
}

async function request(method, url, data, headers = {}) {
    const current = assertConfigured();
    const response = await axios({
        method,
        url,
        data,
        ...requestOptions(current, headers)
    });

    if (response.status < 200 || response.status >= 300) {
        const error = new Error(`MFU Drive ${method} failed with HTTP ${response.status}.`);
        error.status = response.status;
        error.response = response;
        throw error;
    }
    return response;
}

async function mkcol(url) {
    const response = await axios({ method: 'MKCOL', url, ...requestOptions(assertConfigured(), { 'Content-Length': '0' }) });
    if (!EXISTING_COLLECTION_STATUS.has(response.status)) {
        const error = new Error(`MFU Drive MKCOL failed with HTTP ${response.status}.`);
        error.status = response.status;
        error.response = response;
        throw error;
    }
}

async function ensureCollection(relativeDirectory) {
    const directory = normalizeRelativePath(relativeDirectory);
    const segments = directory.split('/');
    let current = '';

    // The configured base folder (e.g. .../<share>/qa-ui-YYYYMMDD) may not exist yet; a share root answers 405.
    // Best effort: a refusal here (permissions, share-root quirks) must not block uploads;
    // the nested MKCOL and the PUT below still fail loudly if the folder really is missing.
    if (!knownCollections.has('')) {
        await mkcol(assertConfigured().webDavUrl).catch(() => {});
        knownCollections.add('');
    }

    for (const segment of segments) {
        current = current ? `${current}/${segment}` : segment;
        if (knownCollections.has(current)) continue;
        await mkcol(webDavFileUrl(current));
        knownCollections.add(current);
    }
}

async function uploadBuffer(relativePath, buffer, contentType = 'application/octet-stream') {
    const target = normalizeRelativePath(relativePath);
    const directory = path.posix.dirname(target);
    if (directory && directory !== '.') await ensureCollection(directory);

    await request('PUT', webDavFileUrl(target), buffer, {
        'Content-Type': contentType,
        'Content-Length': String(buffer.length)
    });
    return { relativePath: target, url: publicFileUrl(target) };
}

async function uploadLocalFile(relativePath, localPath, contentType = 'application/octet-stream') {
    return uploadBuffer(relativePath, await fs.readFile(localPath), contentType);
}

async function downloadBuffer(relativePath) {
    const response = await axios({
        method: 'GET',
        url: webDavFileUrl(relativePath),
        responseType: 'arraybuffer',
        ...requestOptions(assertConfigured())
    });
    if (response.status < 200 || response.status >= 300) {
        const error = new Error(`MFU Drive GET failed with HTTP ${response.status}.`);
        error.status = response.status;
        error.response = response;
        throw error;
    }
    return Buffer.from(response.data);
}

async function deleteFile(relativePath) {
    await request('DELETE', webDavFileUrl(relativePath));
}

async function materializeToTemp(relativePath) {
    const normalized = normalizeRelativePath(relativePath);
    const buffer = await downloadBuffer(normalized);
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'buddhist-art-mfu-'));
    const filePath = path.join(directory, path.basename(normalized));
    await fs.writeFile(filePath, buffer);
    return {
        filePath,
        cleanup: () => fs.rm(directory, { recursive: true, force: true })
    };
}

function relativePathFromPublicFolder(folderPath, filename) {
    const normalized = String(folderPath || '').replace(/\\/g, '/');
    const marker = '/public/';
    const markerIndex = normalized.lastIndexOf(marker);
    if (markerIndex < 0) throw new Error(`Cannot resolve public path from: ${folderPath}`);
    const publicRelative = normalized.slice(markerIndex + marker.length).replace(/^\/+|\/+$/g, '');
    return normalizeRelativePath(`${publicRelative}/${filename}`);
}

function relativePathFromStoredUrl(value) {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw) return null;

    const current = config();
    if (current.publicUrl && raw.startsWith(`${current.publicUrl}/`)) {
        return normalizeRelativePath(decodePath(raw.slice(`${current.publicUrl}/`.length)));
    }
    if (raw.startsWith('/')) return normalizeRelativePath(raw);

    try {
        const parsed = new URL(raw);
        const publicMarker = '/public/';
        const markerIndex = parsed.pathname.lastIndexOf(publicMarker);
        if (markerIndex >= 0) return normalizeRelativePath(decodePath(parsed.pathname.slice(markerIndex + publicMarker.length)));
        const knownRoot = parsed.pathname.match(/\/(account|system)\/.*$/i);
        return knownRoot ? normalizeRelativePath(decodePath(knownRoot[0])) : null;
    } catch (error) {
        return null;
    }
}

module.exports = {
    config,
    isEnabled,
    assertConfigured,
    normalizeRelativePath,
    publicFileUrl,
    webDavFileUrl,
    ensureCollection,
    uploadBuffer,
    uploadLocalFile,
    downloadBuffer,
    deleteFile,
    materializeToTemp,
    relativePathFromPublicFolder,
    relativePathFromStoredUrl
};
