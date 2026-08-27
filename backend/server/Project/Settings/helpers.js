const crypto = require('crypto');

const titleValue = (titles, key) => {
    if (!Array.isArray(titles)) return '';
    const item = titles.find(value => value && value.key === key);
    return item && typeof item.value === 'string' ? item.value.trim() : '';
};

const normalizeTitles = titles => {
    const source = Array.isArray(titles) ? titles : [];
    return ['th', 'en'].map(key => ({
        key,
        value: String(titleValue(source, key) || '').trim()
    }));
};

const generatedCode = (value, prefix = 'CUSTOM') => {
    const slug = String(value || '')
        .normalize('NFKD')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toUpperCase()
        .slice(0, 48);
    const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}_${slug || 'ITEM'}_${suffix}`;
};

const sanitizeCreate = (body, prefix) => ({
    title: normalizeTitles(body && body.title),
    description: normalizeTitles(body && body.description),
    code: generatedCode(titleValue(body && body.title, 'en'), prefix)
});

const sanitizeUpdate = body => {
    const data = {
        title: normalizeTitles(body && body.title),
        description: normalizeTitles(body && body.description)
    };
    // code is deliberately ignored: it is an immutable workflow identity.
    return data;
};

module.exports = {
    titleValue,
    normalizeTitles,
    generatedCode,
    sanitizeCreate,
    sanitizeUpdate
};
