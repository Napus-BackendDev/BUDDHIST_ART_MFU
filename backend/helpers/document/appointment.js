'use strict';
/**
 * appointment.js — Reservation PDF (Buddhist Art MFU template style)
 * Colors : Burgundy #800000, White, Light-grey
 * Size   : Fixed A4  (595.28 × 841.89 pt)
 */

const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const axios   = require('axios');

// ── Font URLs ─────────────────────────────────────────────────────────────────
const FONT_REG_URL  = 'https://github.com/google/fonts/raw/main/ofl/sarabun/Sarabun-Regular.ttf';
const FONT_BOLD_URL = 'https://github.com/google/fonts/raw/main/ofl/sarabun/Sarabun-Bold.ttf';

/**
 * Promise-based font buffer cache.
 * Fonts are downloaded once per process and reused across all PDF calls,
 * avoiding a network round-trip on every order.
 */
let _fontCache = null;
function loadFonts() {
    if (!_fontCache) {
        _fontCache = Promise.all([
            axios.get(FONT_REG_URL,  { responseType: 'arraybuffer' }).then(r => r.data),
            axios.get(FONT_BOLD_URL, { responseType: 'arraybuffer' }).then(r => r.data),
        ])
        .then(([reg, bold]) => ({ reg, bold }))
        .catch(err => {
            _fontCache = null; // reset so it retries on next call
            return Promise.reject(err);
        });
    }
    return _fontCache;
}

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
    burgundy:  rgb(0.502, 0.000, 0.000),  // #800000
    white:     rgb(1.000, 1.000, 1.000),
    darkGrey:  rgb(0.250, 0.250, 0.250),
    mutedGrey: rgb(0.500, 0.500, 0.500),
    lightGrey: rgb(0.925, 0.925, 0.925),  // section header bg
    rowAlt:    rgb(0.975, 0.975, 0.975),
    border:    rgb(0.800, 0.800, 0.800),
    totalBg:   rgb(0.910, 0.910, 0.910),
};

// ── A4 page constants ─────────────────────────────────────────────────────────
const PW = 595.28;
const PH = 841.89;
const ML = 45;            // margin left
const MR = 45;            // margin right
const CW = PW - ML - MR; // usable content width = 505.28

// ── Layout heights / vertical rhythm ─────────────────────────────────────────
const HEADER_H       = 62;  // title + subtitle + separator
const SECTION_BAR_H  = 22;  // "Customer Information" bar
const FIELD_ROW_H    = 28;  // vertical gap between each field row
const TABLE_HDR_H    = 26;  // table header row height
const DATA_ROW_H     = 22;  // each artwork row
const TOTALS_H       = 50;  // subtotal + burgundy line + net total
const FOOTER_H       = 60;  // dashed line + notes

// Minimum Y reserved at bottom for totals + footer
const BOTTOM_RESERVE = TOTALS_H + FOOTER_H;

// ── Table column definitions ──────────────────────────────────────────────────
const COLS = [
    { label: '#',                x: ML,       w: 25,        align: 'center' },
    { label: 'Item Description', x: ML + 25,  w: 215,       align: 'left'   },
    { label: 'Artist',           x: ML + 240, w: 125,       align: 'left'   },
    { label: 'Technique',        x: ML + 365, w: 90,        align: 'left'   },
    { label: 'Unit Price (THB)', x: ML + 455, w: CW - 455,  align: 'right'  },
];

// ── Drawing helpers ───────────────────────────────────────────────────────────

/** Fill a solid rectangle */
const fill = (pg, x, y, w, h, color) =>
    pg.drawRectangle({ x, y, width: w, height: h, color });

/** Horizontal solid line */
const hline = (pg, y, x1 = ML, x2 = ML + CW, color = C.border, t = 0.5) =>
    pg.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: t, color });

/** Horizontal dashed line */
function dashedLine(pg, y, x1 = ML, x2 = ML + CW, dash = 4, gap = 4) {
    for (let x = x1; x < x2; x += dash + gap) {
        pg.drawLine({ start: { x, y }, end: { x: Math.min(x + dash, x2), y }, thickness: 0.6, color: C.border });
    }
}

/**
 * Clip text to fit within maxW pts.
 * Returns the original string if it fits, or a truncated string with '…'.
 * @param {string} text
 * @param {number} maxW  - maximum width in pts (must be > 0)
 */
function clip(text, maxW, font, size) {
    let t = String(text ?? '—');
    if (font.widthOfTextAtSize(t, size) <= maxW) return t;
    while (t.length > 1 && font.widthOfTextAtSize(t + '…', size) > maxW) {
        t = t.slice(0, -1);
    }
    return t + '…';
}

/** Draw text, optionally clipped to maxW */
function txt(pg, text, x, y, font, size, color = C.darkGrey, maxW = null) {
    const t = (maxW !== null && maxW > 0) ? clip(text, maxW, font, size) : String(text ?? '—');
    pg.drawText(t, { x, y, size, font, color });
}

/** Right-aligned text within a column box */
function txtRight(pg, text, colX, colW, y, font, size, color = C.darkGrey) {
    const t  = String(text ?? '—');
    const tw = font.widthOfTextAtSize(t, size);
    pg.drawText(t, { x: colX + colW - tw - 2, y, size, font, color });
}

/** Center-aligned text within a column box */
function txtCenter(pg, text, colX, colW, y, font, size, color = C.darkGrey) {
    const t  = String(text ?? '—');
    const tw = font.widthOfTextAtSize(t, size);
    pg.drawText(t, { x: colX + (colW - tw) / 2, y, size, font, color });
}

// ── Data helpers ──────────────────────────────────────────────────────────────

/** Format a number with thousands separator, or '—' if invalid */
function fmtNum(n) {
    const v = Number(n);
    return isNaN(v) ? '—' : v.toLocaleString('en-US');
}

/**
 * Resolve a multilingual field (array of { key, value } objects or plain string).
 * Falls back to first available value if the requested language key is absent.
 */
function getLang(field, key = 'en') {
    if (!field) return '';
    if (Array.isArray(field)) {
        const match = field.find(f => f.key === key);
        return match?.value || field[0]?.value || '';
    }
    return String(field);
}

/** Resolve order status from a populated status document */
function resolveStatus(statusField) {
    if (!statusField?.title) return 'Pending Review';
    const titles = statusField.title;
    if (Array.isArray(titles)) {
        return titles.find(t => t.key === 'en')?.value || titles[0]?.value || 'Pending Review';
    }
    return String(titles);
}

// ── Main generator ────────────────────────────────────────────────────────────

/**
 * Generate a Reservation / Order Confirmation PDF.
 *
 * @param {Object} params
 * @param {Object}   params.order    - Populated order document from MongoDB
 * @param {Array}    params.artworks - Array of populated artwork objects
 * @returns {Promise<Buffer>} PDF as a Node.js Buffer
 */
const generateReservationPDF = async ({ order, artworks = [] }) => {
    if (!order) throw new Error('generateReservationPDF: order is required');

    // ── 1. Embed fonts (from cache) ──────────────────────────────────────────
    const { reg: rb, bold: bb } = await loadFonts();
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const fReg  = await pdfDoc.embedFont(rb);
    const fBold = await pdfDoc.embedFont(bb);
    const page  = pdfDoc.addPage([PW, PH]);

    // ── 2. Resolve order data ────────────────────────────────────────────────
    const orderId   = String(order._id || '—');
    const orderDate = new Date(order.createdAt || Date.now())
        .toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const buyerName = order.contact?.name      || '—';
    const email     = order.contact?.email     || '—';
    const tel       = order.contact?.telephone || '—';
    const billAddr  = order.address?.bill      || '—';
    const shipAddr  = order.address?.shipping  || billAddr;
    const carrier   = order.carrier            || 'Thailand Post';
    const tracking  = order.trackingId         || 'Pending';
    const status    = resolveStatus(order.status);

    // ── 3. HEADER ────────────────────────────────────────────────────────────
    const TOP = PH - 40;   // topmost content Y

    txt(page, 'Buddhist Art MFU',
        ML, TOP, fBold, 26, C.burgundy);
    txt(page, 'Buddhist Art Center, Mae Fah Luang University',
        ML, TOP - 18, fReg, 9, C.mutedGrey);

    // Right-side: Issued Date + Order ID
    const RX = ML + CW - 145;
    txt(page, 'Issued Date:', RX, TOP,      fBold, 9, C.darkGrey);
    txt(page, orderDate,      RX, TOP - 14, fReg,  9, C.darkGrey, 145);
    txt(page, 'Order ID:',   RX, TOP - 30, fBold, 9, C.darkGrey);
    txt(page, orderId.length > 24 ? '…' + orderId.slice(-22) : orderId,
        RX, TOP - 44, fReg, 8, C.darkGrey, 145);

    // Thick burgundy separator below header
    const SEP_Y = TOP - HEADER_H;
    fill(page, ML, SEP_Y, CW, 3, C.burgundy);

    // ── 4. CUSTOMER INFORMATION ──────────────────────────────────────────────
    const BAR_Y = SEP_Y - 22;
    fill(page, ML,     BAR_Y, CW, SECTION_BAR_H, C.lightGrey); // grey bar
    fill(page, ML,     BAR_Y, 6,  SECTION_BAR_H, C.burgundy);  // left accent
    txt(page, 'Customer Information', ML + 14, BAR_Y + 7, fBold, 10, C.darkGrey);

    const LX   = ML;
    const RCX  = ML + CW / 2 + 5;
    const CW2  = CW / 2 - 15;
    const FLBL = 8;    // field label font size
    const FVAL = 8.5;  // field value font size

    const leftFields  = [
        ['Name',             buyerName],
        ['Email',            email    ],
        ['Telephone',        tel      ],
        ['Billing Address',  billAddr ],
        ['Shipping Address', shipAddr ],
    ];
    const rightFields = [
        ['Status',      status  ],
        ['Carrier',     carrier ],
        ['Tracking ID', tracking],
    ];

    let lY = BAR_Y - 14;
    leftFields.forEach(([label, val]) => {
        txt(page, label, LX, lY,      fBold, FLBL, C.mutedGrey);
        txt(page, val,   LX, lY - 13, fReg,  FVAL, C.darkGrey, CW2);
        lY -= FIELD_ROW_H;
    });

    let rY = BAR_Y - 14;
    rightFields.forEach(([label, val]) => {
        txt(page, label, RCX, rY,      fBold, FLBL, C.mutedGrey);
        txt(page, val,   RCX, rY - 13, fReg,  FVAL, C.darkGrey, CW2);
        rY -= FIELD_ROW_H;
    });

    // ── 5. ITEMS TABLE ───────────────────────────────────────────────────────
    const TABLE_TOP = BAR_Y - (leftFields.length * FIELD_ROW_H) - 16;
    hline(page, TABLE_TOP + 2, ML, ML + CW, C.border, 0.5);

    const TH_Y = TABLE_TOP - TABLE_HDR_H;
    fill(page, ML, TH_Y, CW, TABLE_HDR_H, C.burgundy);

    // Table column headers
    const thY = TH_Y + (TABLE_HDR_H - 8) / 2;
    COLS.forEach(col => {
        if (col.align === 'right')       txtRight (page, col.label, col.x, col.w, thY, fBold, 8, C.white);
        else if (col.align === 'center') txtCenter(page, col.label, col.x, col.w, thY, fBold, 8, C.white);
        else                             txt      (page, col.label, col.x + 4, thY, fBold, 8, C.white);
    });

    // Overflow guard: cap rows to what physically fits on the page
    const maxRows     = Math.floor((TH_Y - BOTTOM_RESERVE) / DATA_ROW_H);
    const visibleRows = artworks.slice(0, maxRows);

    let rowY  = TH_Y;
    let total = 0;

    visibleRows.forEach((art, idx) => {
        rowY -= DATA_ROW_H;
        if (idx % 2 === 1) fill(page, ML, rowY, CW, DATA_ROW_H, C.rowAlt);

        const cy        = rowY + DATA_ROW_H / 2 - 4; // vertical center of row
        const artTitle  = getLang(art.title, 'en') || getLang(art.title, 'th') || 'Untitled';
        const artArtist = art.artist
            ? (getLang(art.artist.name, 'en') || getLang(art.artist.name, 'th') || '—')
            : '—';
        const artTech   = getLang(art.technique, 'en') || '—';
        const price     = Number(art.price) || 0;
        total += price;

        txtCenter(page, String(idx + 1),  COLS[0].x, COLS[0].w,     cy, fReg,  9, C.darkGrey);
        txt      (page, artTitle,         COLS[1].x + 4, cy, fBold,  9, C.darkGrey, COLS[1].w - 8);
        txt      (page, artArtist,        COLS[2].x + 4, cy, fReg,   9, C.darkGrey, COLS[2].w - 8);
        txt      (page, artTech,          COLS[3].x + 4, cy, fReg,   9, C.darkGrey, COLS[3].w - 8);
        txtRight (page, fmtNum(price),    COLS[4].x, COLS[4].w,      cy, fReg,  9, C.darkGrey);

        hline(page, rowY, ML, ML + CW, C.border, 0.35);
    });

    // Overflow notice if rows were capped
    if (artworks.length > maxRows) {
        const remaining = artworks.length - maxRows;
        txt(page, `… and ${remaining} more item(s). See order details online.`,
            ML, rowY - 10, fReg, 7.5, C.mutedGrey);
        rowY -= 14;
    }

    // ── 6. TOTALS ────────────────────────────────────────────────────────────
    const TX = ML + CW * 0.5;
    const TW = CW * 0.5;
    const SY = rowY - 16;

    txt(page, 'Subtotal', TX + 4, SY, fReg, 9, C.mutedGrey);
    txtRight(page, fmtNum(total), TX, TW, SY, fReg, 9, C.darkGrey);

    // Burgundy divider between subtotal and net total
    fill(page, TX, SY - 10, TW, 2, C.burgundy);

    const NY = SY - 28;
    fill(page, TX, NY, TW, 20, C.totalBg);
    txt(page, 'Net Total (THB)', TX + 4, NY + 6, fBold, 10, C.burgundy);
    txtRight(page, fmtNum(total), TX, TW - 4, NY + 6, fBold, 10, C.burgundy);

    // ── 7. FOOTER ────────────────────────────────────────────────────────────
    const FY = 75;
    dashedLine(page, FY);
    txt(page, 'Notes:', ML, FY - 14, fBold, 8, C.darkGrey);
    txt(page,
        'This document serves as your official reservation confirmation. Our team will contact you regarding payment and shipping.',
        ML, FY - 26, fReg, 7.5, C.mutedGrey, CW);
    txt(page,
        'This is an official document from Mae Fah Luang University. All prices are in Thai Baht (THB).',
        ML, FY - 38, fReg, 7.5, C.mutedGrey, CW);

    const genText = `Generated: ${new Date().toLocaleString('en-GB')}`;
    const genW    = fReg.widthOfTextAtSize(genText, 7);
    txt(page, genText, PW - MR - genW, FY - 38, fReg, 7, C.border);

    // ── 8. Serialize ─────────────────────────────────────────────────────────
    return Buffer.from(await pdfDoc.save());
};

module.exports = { generateReservationPDF };