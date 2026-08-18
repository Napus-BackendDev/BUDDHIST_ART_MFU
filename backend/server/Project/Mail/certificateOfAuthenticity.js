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
        `<span style="${index === 0 ? 'font-weight:700;' : 'font-weight:400;'}">${escapeHtml(value)}</span>`
    )).join('<br>');
};

const formatPrice = (price) => Number(price || 0).toLocaleString('en-US');

module.exports = function certificateOfAuthenticityMailTemplate({
    buyerName,
    orderId,
    price,
    imageCid,
    imageSrc,
    titleEN,
    titleTH,
    artistEN,
    artistTH,
    size,
    year,
    techniqueEN,
    techniqueTH,
    artworkCode
}) {
    const artworkImageSource = imageSrc || (imageCid ? `cid:${imageCid}` : '');
    const artworkImage = artworkImageSource
        ? `<img src="${escapeHtml(artworkImageSource)}" alt="${escapeHtml(titleEN || titleTH || 'Artwork')}" style="display:block;width:100%;max-width:520px;height:auto;max-height:380px;object-fit:contain;margin:0 auto;border:0;">`
        : `<div style="width:100%;max-width:520px;height:280px;margin:0 auto;background:#f3f0e9;color:#8b8b8b;text-align:center;line-height:280px;font:16px Arial,sans-serif;">Artwork image unavailable</div>`;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate of Authenticity</title>
        <style>
            @media only screen and (max-width: 640px) {
                .certificate-shell { width: 100% !important; }
                .certificate-inner { padding-left: 18px !important; padding-right: 18px !important; }
                .certificate-title { font-size: 30px !important; letter-spacing: 0 !important; }
                .certificate-artwork { width: 100% !important; }
                .certificate-label { width: 34% !important; font-size: 14px !important; }
                .certificate-value { width: 66% !important; font-size: 16px !important; }
                .certificate-footer { font-size: 12px !important; }
            }
            @media print {
                html, body { background: #ffffff !important; }
                .certificate-shell { width: 720px !important; max-width: 720px !important; }
                .certificate-inner { padding: 82px 54px 24px !important; }
                .certificate-artwork { margin: 42px auto 42px !important; }
                .certificate-artwork img { max-height: 300px !important; }
                .certificate-footer { margin-top: 58px !important; font-size: 12px !important; }
            }
        </style>
    </head>
    <body style="margin:0;padding:0;background:#f7f7f5;color:#16181b;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
            Order ${escapeHtml(orderId || '-')} · ฿${formatPrice(price)} · ${escapeHtml(buyerName || '')}
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background:#f7f7f5;">
            <tr>
                <td align="center" style="padding:0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="720" class="certificate-shell" style="width:100%;max-width:720px;background:#fffefd;">
                        <tr>
                            <td class="certificate-inner" style="padding:122px 54px 32px;">
                                <h1 class="certificate-title" style="margin:0;text-align:center;color:#a84d18;font:700 38px/1.15 Georgia,'Times New Roman',serif;letter-spacing:.3px;">
                                    CERTIFICATE OF AUTHENTICITY
                                </h1>

                                <div class="certificate-artwork" style="width:520px;max-width:100%;margin:74px auto 66px;text-align:center;">
                                    ${artworkImage}
                                </div>

                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;font-family:Arial,'Helvetica Neue',sans-serif;">
                                    <tr>
                                        <td class="certificate-label" valign="top" width="190" style="width:190px;padding:0 16px 24px 0;text-align:right;color:#14171a;font:700 17px/1.35 Arial,'Helvetica Neue',sans-serif;">title</td>
                                        <td class="certificate-value" valign="top" style="padding:0 0 24px;color:#ad501a;font:17px/1.35 Arial,'Helvetica Neue',sans-serif;">${bilingualValue(titleEN, titleTH)}</td>
                                    </tr>
                                    <tr>
                                        <td class="certificate-label" valign="top" style="padding:0 16px 24px 0;text-align:right;color:#14171a;font:700 17px/1.35 Arial,'Helvetica Neue',sans-serif;">artist</td>
                                        <td class="certificate-value" valign="top" style="padding:0 0 24px;color:#ad501a;font:17px/1.35 Arial,'Helvetica Neue',sans-serif;">${bilingualValue(artistEN, artistTH)}</td>
                                    </tr>
                                    <tr>
                                        <td class="certificate-label" valign="top" style="padding:0 16px 24px 0;text-align:right;color:#14171a;font:700 17px/1.35 Arial,'Helvetica Neue',sans-serif;">frame dimension</td>
                                        <td class="certificate-value" valign="top" style="padding:0 0 24px;color:#14171a;font:17px/1.35 Arial,'Helvetica Neue',sans-serif;">${escapeHtml(valueOrDash(size))}</td>
                                    </tr>
                                    <tr>
                                        <td class="certificate-label" valign="top" style="padding:0 16px 24px 0;text-align:right;color:#14171a;font:700 17px/1.35 Arial,'Helvetica Neue',sans-serif;">date produced</td>
                                        <td class="certificate-value" valign="top" style="padding:0 0 24px;color:#14171a;font:17px/1.35 Arial,'Helvetica Neue',sans-serif;">${escapeHtml(valueOrDash(year))}</td>
                                    </tr>
                                    <tr>
                                        <td class="certificate-label" valign="top" style="padding:0 16px 24px 0;text-align:right;color:#14171a;font:700 17px/1.35 Arial,'Helvetica Neue',sans-serif;">medium and<br>materials</td>
                                        <td class="certificate-value" valign="top" style="padding:0 0 24px;color:#14171a;font:17px/1.35 Arial,'Helvetica Neue',sans-serif;">${bilingualValue(techniqueEN, techniqueTH)}</td>
                                    </tr>
                                    <tr>
                                        <td class="certificate-label" valign="top" style="padding:0 16px 0 0;text-align:right;color:#14171a;font:700 17px/1.35 Arial,'Helvetica Neue',sans-serif;">artist signature</td>
                                        <td class="certificate-value" valign="top" style="height:55px;padding:0;color:#14171a;font:17px/1.35 Arial,'Helvetica Neue',sans-serif;"><span style="display:block;height:55px;"></span></td>
                                    </tr>
                                </table>

                                <div class="certificate-footer" style="margin-top:96px;text-align:center;color:#b4531b;font:14px/1.65 Arial,'Helvetica Neue',sans-serif;">
                                    <div>“Buddhist Art MFU” — Short Course Program in Buddhist Art</div>
                                    <div>Mae Fah Luang University, Chiang Rai, Thailand</div>
                                    <div><a href="mailto:buddhistart@mfu.ac.th" style="color:#b4531b;text-decoration:none;">buddhistart@mfu.ac.th</a> &nbsp;|&nbsp; <a href="https://buddhistart.mfu.ac.th" style="color:#b4531b;text-decoration:none;">buddhistart.mfu.ac.th</a> &nbsp;|&nbsp; <a href="https://facebook.com/BuddhistArtMFU" style="color:#b4531b;text-decoration:none;">facebook.com/BuddhistArtMFU</a></div>
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
    </body>
    </html>
    `;
};
