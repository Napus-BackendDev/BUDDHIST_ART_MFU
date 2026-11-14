const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const valueOrDash = (value) => {
    const normalized = String(value ?? '').trim();
    return normalized || '-';
};

const bilingualValue = (primary, secondary, fallback = '-') => {
    const first = String(primary ?? '').trim();
    const second = String(secondary ?? '').trim();
    const values = [first, second].filter((value, index, list) => value && list.indexOf(value) === index);

    if (values.length === 0) return `<span>${escapeHtml(fallback)}</span>`;
    return values.map((value, index) => (
        `<span style="display:block;${index > 0 ? 'margin-top:2px;' : ''}">${escapeHtml(value)}</span>`
    )).join('');
};

const formatPrice = (price) => Number(price || 0).toLocaleString('en-US');

const THREE_DIM_CATEGORY_CODES = new Set(['SCULPTURE', 'INSTALLATION_ART']);
const THREE_DIM_CATEGORY_TERMS = [
    'sculpture',
    'installation',
    'ประติมากรรม',
    'การติดตั้ง',
    'จัดวาง'
];
const THREE_DIM_SIZE_PATTERN = /\d+(?:\.\d+)?\s*[x×*]\s*\d+(?:\.\d+)?\s*[x×*]\s*\d+(?:\.\d+)?/i;

/**
 * Resolves the certificate measurement row label ('SIZE' for 2D, 'DIMENSION' for 3D).
 */
function resolveMeasurementLabel({ category, size, is3D, measurementLabel } = {}) {
    if (measurementLabel) {
        return String(measurementLabel).trim().toUpperCase() === 'DIMENSION' ? 'DIMENSION' : 'SIZE';
    }
    if (typeof is3D === 'boolean') {
        return is3D ? 'DIMENSION' : 'SIZE';
    }

    if (category) {
        const code = String(category.code || '').trim().toUpperCase();
        if (THREE_DIM_CATEGORY_CODES.has(code)) {
            return 'DIMENSION';
        }
        const candidates = typeof category === 'string'
            ? [category]
            : [category.title?.en, category.title?.th, category.name?.en, category.name?.th];
        const joined = candidates.filter(Boolean).join(' ').toLowerCase();
        if (THREE_DIM_CATEGORY_TERMS.some((term) => joined.includes(term))) {
            return 'DIMENSION';
        }
    }

    if (size && THREE_DIM_SIZE_PATTERN.test(String(size))) {
        return 'DIMENSION';
    }

    return 'SIZE';
}

module.exports = function certificateOfAuthenticityMailTemplate({
    buyerName,
    orderId,
    price,
    imageCid,
    imageSrc,
    logoCid,
    logoSrc,
    fontCss = '',
    title,
    titleEN,
    titleTH,
    artist,
    artistEN,
    artistTH,
    size,
    category,
    is3D,
    measurementLabel,
    year,
    technique,
    techniqueEN,
    techniqueTH,
    edition,
    artworkCode
}) {
    const resolvedTitleEN = titleEN || title || '';
    const resolvedArtistEN = artistEN || artist || '';
    const resolvedTechniqueEN = techniqueEN || technique || '';
    const signatureOwnerName = valueOrDash(resolvedArtistEN || artistTH);

    const logoSource = logoSrc || (logoCid ? `cid:${logoCid}` : '');
    const topLogoBlock = logoSource
        ? `<img src="${escapeHtml(logoSource)}" alt="Buddhist Art MFU" style="display:block;height:86px;width:auto;margin:0 auto 10px;border:0;">`
        : '';

    const artworkImageSource = imageSrc || (imageCid ? `cid:${imageCid}` : '');
    const artworkImage = artworkImageSource
        ? `<div style="display:inline-block;padding:8px;background:#ffffff;border:1px solid #d9d0c3;"><img src="${escapeHtml(artworkImageSource)}" alt="${escapeHtml(resolvedTitleEN || titleTH || 'Artwork')}" style="display:block;max-width:360px;width:auto;height:auto;max-height:245px;object-fit:contain;margin:0 auto;border:0;"></div>`
        : `<div style="width:330px;max-width:100%;height:215px;margin:0 auto;background:#ebe5da;border:1px solid #d9d0c3;color:#5f5650;text-align:center;font:14px/215px 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;">Artwork image unavailable</div>`;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate of Authenticity</title>
        <style>
            @page {
                size: A4 portrait;
                margin: 0;
            }
            ${fontCss}
            html, body {
                margin: 0;
                padding: 0;
                background: #f5f2eb;
                color: #1f1b18;
                font-family: 'MFUFont', 'Segoe UI', 'Leelawadee UI', Arial, sans-serif;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            @media only screen and (max-width: 640px) {
                .certificate-shell { width: 100% !important; }
                .certificate-outer-pad { padding: 12px !important; }
                .certificate-inner { padding: 24px 16px !important; }
                .certificate-title { font-size: 22px !important; letter-spacing: 1px !important; }
                .certificate-meta { width: 100% !important; }
                .certificate-label { width: 40% !important; padding-right: 12px !important; font-size: 10px !important; }
                .certificate-value { width: 60% !important; padding-left: 14px !important; font-size: 13.5px !important; }
                .certificate-sign-line { width: 200px !important; }
            }
            @media print {
                html, body {
                    width: 210mm;
                    height: 296mm;
                    background: #f5f2eb !important;
                    overflow: hidden;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .certificate-bg {
                    width: 210mm !important;
                    height: 296mm !important;
                    background: #f5f2eb !important;
                    table-layout: fixed;
                }
                .certificate-outer-pad {
                    width: 210mm !important;
                    height: 296mm !important;
                    padding: 9mm !important;
                    box-sizing: border-box !important;
                    vertical-align: top !important;
                }
                .certificate-shell {
                    width: 100% !important;
                    max-width: 100% !important;
                    height: 278mm !important;
                    box-sizing: border-box !important;
                    background: #f5f2eb !important;
                }
                .certificate-frame-pad {
                    height: 100% !important;
                    box-sizing: border-box !important;
                }
                .certificate-inner-table {
                    height: 100% !important;
                }
                .certificate-inner {
                    height: 100% !important;
                    box-sizing: border-box !important;
                    padding: 36px 52px 30px !important;
                }
                .certificate-print-layout {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 100%;
                }
            }
        </style>
    </head>
    <body style="margin:0;padding:0;background:#f5f2eb;color:#1f1b18;font-family:'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
            Order ${escapeHtml(orderId || '-')} · ฿${formatPrice(price)} · ${escapeHtml(buyerName || '')}
        </div>
        <table role="presentation" class="certificate-bg" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background:#f5f2eb;">
            <tr>
                <td align="center" class="certificate-outer-pad" style="padding:24px;background:#f5f2eb;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="742" class="certificate-shell" style="width:100%;max-width:742px;background:#f5f2eb;border:1.5px solid #c9bba8;">
                        <tr>
                            <td class="certificate-frame-pad" style="padding:5px;">
                                <table role="presentation" class="certificate-inner-table" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border:0.8px solid #ddd2c3;background:#f5f2eb;">
                                    <tr>
                                        <td class="certificate-inner" valign="top" style="padding:36px 58px 30px;background:#f5f2eb;">
                                            <div class="certificate-print-layout">
                                                <!-- Top Emblem + Brand + Title + Divider -->
                                                <div>
                                                    <div style="text-align:center;">
                                                        ${topLogoBlock}
                                                        <div style="font:600 15px/1.25 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;letter-spacing:3px;color:#3d2b24;text-transform:uppercase;">
                                                            BUDDHIST ART MFU
                                                        </div>
                                                    </div>

                                                    <h1 class="certificate-title" style="margin:18px 0 12px;text-align:center;color:#612721;font:600 28px/1.18 Georgia,'Times New Roman',serif;letter-spacing:2.4px;text-transform:uppercase;">
                                                        CERTIFICATE OF AUTHENTICITY
                                                    </h1>
                                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;margin:0 auto;">
                                                        <tr>
                                                            <td valign="middle" style="width:46%;vertical-align:middle;padding:0;"><div style="border-top:1px solid #cfc4b4;height:0;font-size:0;line-height:0;"></div></td>
                                                            <td valign="middle" style="width:8%;text-align:center;vertical-align:middle;color:#8a5248;font-size:12px;line-height:1;">&#10070;</td>
                                                            <td valign="middle" style="width:46%;vertical-align:middle;padding:0;"><div style="border-top:1px solid #cfc4b4;height:0;font-size:0;line-height:0;"></div></td>
                                                        </tr>
                                                    </table>
                                                </div>

                                                <!-- Artwork Preview -->
                                                <div class="certificate-artwork" style="margin:22px auto;text-align:center;">
                                                    ${artworkImage}
                                                </div>

                                                <!-- Metadata Specification Table with Vertical Divider -->
                                                <table role="presentation" class="certificate-meta" cellpadding="0" cellspacing="0" border="0" width="500" align="center" style="width:500px;max-width:100%;margin:0 auto 14px;border-collapse:collapse;">
                                                    <tr>
                                                        <td class="certificate-label" valign="top" width="180" style="width:180px;padding:7px 22px 7px 0;text-align:right;border-right:1px solid #cfc4b4;color:#5f5650;font:600 11px/1.5 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;letter-spacing:1.3px;text-transform:uppercase;">ARTWORK TITLE</td>
                                                        <td class="certificate-value" valign="top" style="padding:5px 0 8px 24px;color:#1f1b18;font:500 14.5px/1.45 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;">${bilingualValue(resolvedTitleEN, titleTH)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="certificate-label" valign="top" style="padding:7px 22px 7px 0;text-align:right;border-right:1px solid #cfc4b4;color:#5f5650;font:600 11px/1.5 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;letter-spacing:1.3px;text-transform:uppercase;">ARTIST</td>
                                                        <td class="certificate-value" valign="top" style="padding:5px 0 8px 24px;color:#1f1b18;font:500 14.5px/1.45 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;">${bilingualValue(resolvedArtistEN, artistTH)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="certificate-label" valign="top" style="padding:7px 22px 7px 0;text-align:right;border-right:1px solid #cfc4b4;color:#5f5650;font:600 11px/1.5 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;letter-spacing:1.3px;text-transform:uppercase;">YEAR OF CREATION</td>
                                                        <td class="certificate-value" valign="top" style="padding:5px 0 8px 24px;color:#1f1b18;font:500 14.5px/1.45 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;">${escapeHtml(valueOrDash(year))}</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="certificate-label" valign="top" style="padding:7px 22px 7px 0;text-align:right;border-right:1px solid #cfc4b4;color:#5f5650;font:600 11px/1.5 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;letter-spacing:1.3px;text-transform:uppercase;">TECHNIQUE</td>
                                                        <td class="certificate-value" valign="top" style="padding:5px 0 8px 24px;color:#1f1b18;font:500 14.5px/1.45 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;">${bilingualValue(resolvedTechniqueEN, techniqueTH)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="certificate-label" valign="top" style="padding:7px 22px 7px 0;text-align:right;border-right:1px solid #cfc4b4;color:#5f5650;font:600 11px/1.5 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;letter-spacing:1.3px;text-transform:uppercase;">${escapeHtml(resolveMeasurementLabel({ category, size, is3D, measurementLabel }))}</td>
                                                        <td class="certificate-value" valign="top" style="padding:5px 0 8px 24px;color:#1f1b18;font:500 14.5px/1.45 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;">${escapeHtml(valueOrDash(size))}</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="certificate-label" valign="top" style="padding:7px 22px 7px 0;text-align:right;border-right:1px solid #cfc4b4;color:#5f5650;font:600 11px/1.5 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;letter-spacing:1.3px;text-transform:uppercase;">EDITION</td>
                                                        <td class="certificate-value" valign="top" style="padding:5px 0 8px 24px;color:#1f1b18;font:500 14.5px/1.45 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;">${escapeHtml(valueOrDash(edition || 'Original work'))}</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="certificate-label" valign="top" style="padding:7px 22px 7px 0;text-align:right;border-right:1px solid #cfc4b4;color:#5f5650;font:600 11px/1.5 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;letter-spacing:1.3px;text-transform:uppercase;">CERTIFICATE NO.</td>
                                                        <td class="certificate-value" valign="top" style="padding:5px 0 8px 24px;color:#1f1b18;font:500 14.5px/1.45 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;">${escapeHtml(valueOrDash(artworkCode))}</td>
                                                    </tr>
                                                </table>

                                                <!-- Bottom Signature + Footer -->
                                                <div>
                                                    <div style="text-align:center;margin:0 auto 22px;">
                                                        <div style="height:44px;"></div>
                                                        <div class="certificate-sign-line" style="width:250px;max-width:100%;border-bottom:1px solid #786e67;margin:0 auto 8px;"></div>
                                                        <div style="font:600 14.5px/1.35 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;color:#1f1b18;">
                                                            ${escapeHtml(signatureOwnerName)}
                                                        </div>
                                                        <div style="margin-top:3px;font:500 11px/1.3 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:#5f5650;">
                                                            Artist
                                                        </div>
                                                    </div>

                                                    <div class="certificate-footer" style="text-align:center;color:#5f5650;font:400 11.5px/1.6 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;">
                                                        <div style="color:#612721;font:600 12.5px/1.5 'MFUFont','Segoe UI','Leelawadee UI',Arial,sans-serif;">Buddhist Art MFU</div>
                                                        <div>Short Course Program in Buddhist Art</div>
                                                        <div>Mae Fah Luang University, Chiang Rai, Thailand</div>
                                                        <div style="margin-top:3px;">Tel 0-5391-7897 to 8036 &nbsp;|&nbsp; <a href="https://www.buddhistartspace.mfu.ac.th" style="color:#5f5650;text-decoration:none;">www.buddhistartspace.mfu.ac.th</a></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style="display:none;max-height:0;overflow:hidden;">
                                                Artwork code: ${escapeHtml(artworkCode || '-')} · Certificate recipient: ${escapeHtml(buyerName || '-')}
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};
