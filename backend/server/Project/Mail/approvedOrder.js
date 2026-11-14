const certificateOfAuthenticityMail = require('./certificateOfAuthenticity');

const localized = (value, key) => {
    if (Array.isArray(value)) {
        return value.find((item) => item && item.key === key)?.value || '';
    }
    return key === 'en' ? value || '' : '';
};

module.exports = function approvedOrderMailTemplate({
    buyerName,
    orderId,
    artworkTitle,
    price,
    artwork = {},
    imageCid,
    logoCid
}) {
    return certificateOfAuthenticityMail({
        buyerName,
        orderId,
        price,
        imageCid,
        logoCid,
        titleEN: localized(artwork.title, 'en') || artworkTitle,
        titleTH: localized(artwork.title, 'th'),
        artistEN: localized(artwork.artist?.name, 'en'),
        artistTH: localized(artwork.artist?.name, 'th'),
        size: localized(artwork.size, 'en') || localized(artwork.size, 'th'),
        category: artwork.category,
        is3D: artwork.is3D,
        year: artwork.createdAt ? new Date(artwork.createdAt).getFullYear() : new Date().getFullYear(),
        techniqueEN: localized(artwork.technique, 'en'),
        techniqueTH: localized(artwork.technique, 'th'),
        artworkCode: artwork.artworkCode
    });
};
