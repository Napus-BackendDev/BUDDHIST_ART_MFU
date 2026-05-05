'use strict';
/**
 * composite.js — Artwork Certificate Generator
 * Overlays artist info and signatures onto a pre-designed PDF template.
 */

const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const sharp   = require('sharp');
const axios   = require('axios');
const fs      = require('fs');
const path    = require('path');

const FONT_URL     = 'https://github.com/google/fonts/raw/main/ofl/sarabun/Sarabun-Regular.ttf';
const TEMPLATE_PATH = path.join(__dirname, '../../public/template/template.pdf');

// ── Named colour constants ────────────────────────────────────────────────────
const COLOR_BLACK = rgb(0, 0, 0);

// ── Template coordinate map ───────────────────────────────────────────────────
const COORDS = {
    images: {
        artwork:    { x: 60,  y: 395, width: 200, height: 150 },
        signature1: { x: 370, y: 128, width: 85,  height: 40  },
        signature2: { x: 100, y: 128, width: 85,  height: 40  },
    },
    text: {
        artistName:    { x: 120, y: 630, size: 12, maxWidth: 150 },
        year:          { x: 508, y: 605, size: 12, maxWidth: 50  },
        artworkNameTH: { x: 365, y: 550, size: 12, maxWidth: 200 },
        size:          { x: 375, y: 520, size: 12, maxWidth: 150 },
        technique:     { x: 375, y: 497, size: 12, maxWidth: 150 },
        price:         { x: 375, y: 473, size: 12, maxWidth: 150 },
        description:   { x: 365, y: 450, size: 10, maxWidth: 200 },
    },
};

/**
 * Promise-based font buffer cache — loaded once per process.
 * Avoids a network round-trip on every certificate generation.
 */
let _fontCache = null;
function loadFont() {
    if (!_fontCache) {
        _fontCache = axios.get(FONT_URL, { responseType: 'arraybuffer' })
            .then(r => r.data)
            .catch(err => {
                _fontCache = null; // reset so it retries on next call
                return Promise.reject(err);
            });
    }
    return _fontCache;
}

/**
 * Word-wrap text to fit within maxWidth pts.
 * Supports long words that exceed the limit by breaking them character-by-character.
 * @param {string} text
 * @param {number} maxWidth  Column width in pts
 * @param {Object} font      pdf-lib embedded font
 * @param {number} fontSize
 * @param {number} [padding=15] Inner padding subtracted from maxWidth
 * @returns {string[]} Array of wrapped lines
 */
function wrapText(text, maxWidth, font, fontSize, padding = 15) {
    const limit = maxWidth - padding;
    const lines = [];
    let current = '';

    String(text || '').split(' ').forEach(word => {
        if (font.widthOfTextAtSize(word, fontSize) > limit) {
            // Word is too long — break character by character
            for (const char of word) {
                if (font.widthOfTextAtSize(current + char, fontSize) > limit) {
                    if (current) lines.push(current);
                    current = char;
                } else {
                    current += char;
                }
            }
        } else {
            const candidate = current ? `${current} ${word}` : word;
            if (font.widthOfTextAtSize(candidate, fontSize) <= limit) {
                current = candidate;
            } else {
                if (current) lines.push(current);
                current = word;
            }
        }
    });

    if (current) lines.push(current);
    return lines;
}

/**
 * Embed and draw an image onto a PDF page, centered within the target box.
 * Silently skips if the path is falsy or the file does not exist.
 */
async function drawImage(pdfDoc, page, imgPath, box) {
    if (!imgPath || !fs.existsSync(imgPath)) return;

    const buf  = await sharp(imgPath)
        .resize(box.width, box.height, { fit: 'inside' })
        .toFormat('png')
        .toBuffer();
    const img  = await pdfDoc.embedPng(buf);
    const dims = img.scaleToFit(box.width, box.height);

    page.drawImage(img, {
        x: box.x + (box.width  - dims.width)  / 2,
        y: box.y + (box.height - dims.height) / 2,
        width:  dims.width,
        height: dims.height,
    });
}

/**
 * Generate an artwork certificate PDF by filling a pre-designed template.
 *
 * @param {Object} params
 * @param {string}      params.artworkPath    - Absolute path to the artwork image
 * @param {string|null} params.signature1Path - Absolute path to signature 1 (optional)
 * @param {string|null} params.signature2Path - Absolute path to signature 2 (optional)
 * @param {Object}      params.info           - Certificate text fields (see COORDS.text keys)
 * @param {string|null} params.outputPath     - If set, also writes the PDF to disk
 * @returns {Promise<Buffer|string>} Buffer if no outputPath, else the output file path
 */
const generateCertificate = async ({ artworkPath, signature1Path, signature2Path, info, outputPath }) => {
    // ── Validations ──────────────────────────────────────────────────────────
    if (!fs.existsSync(TEMPLATE_PATH)) throw new Error('PDF template not found');
    if (!artworkPath || !fs.existsSync(artworkPath)) throw new Error('Artwork image not found');
    if (!info) throw new Error('Certificate information is required');

    // ── Load template + font ─────────────────────────────────────────────────
    const fontBuffer = await loadFont();
    const pdfDoc     = await PDFDocument.load(fs.readFileSync(TEMPLATE_PATH));
    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont(fontBuffer);
    const page = pdfDoc.getPages()[0];

    // ── Smart title logic: combine TH + EN if they fit on one line ───────────
    const displayInfo = { ...info };
    if (info.artworkNameTH && info.artworkNameEN) {
        const slot     = COORDS.text.artworkNameTH;
        const combined = `${info.artworkNameTH} (${info.artworkNameEN})`;
        displayInfo.artworkNameTH = font.widthOfTextAtSize(combined, slot.size) <= (slot.maxWidth - 15)
            ? combined
            : info.artworkNameTH;
    }

    // ── Draw images ──────────────────────────────────────────────────────────
    await drawImage(pdfDoc, page, artworkPath,    COORDS.images.artwork);
    await drawImage(pdfDoc, page, signature1Path, COORDS.images.signature1);
    await drawImage(pdfDoc, page, signature2Path, COORDS.images.signature2);

    // ── Draw text fields with word-wrapping ──────────────────────────────────
    for (const [key, slot] of Object.entries(COORDS.text)) {
        const val = displayInfo[key];
        if (!val) continue;

        const lines = wrapText(String(val), slot.maxWidth, font, slot.size);
        lines.forEach((line, i) => {
            page.drawText(line, {
                x:     slot.x,
                y:     slot.y - i * slot.size * 1.2,
                size:  slot.size,
                font,
                color: COLOR_BLACK,
            });
        });
    }

    // ── Save ─────────────────────────────────────────────────────────────────
    const pdfBytes = await pdfDoc.save();

    if (outputPath) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, pdfBytes);
        return outputPath;
    }

    return Buffer.from(pdfBytes);
};

module.exports = { generateCertificate };

// ── Standalone test (node composite.js) ──────────────────────────────────────
if (require.main === module) {
    const root = path.join(__dirname, '../../public');
    (async () => {
        try {
            await generateCertificate({
                artworkPath:    path.join(root, 'data/uploads/artwork/artwork-1777229372320-369014989.jpg'),
                signature1Path: path.join(root, 'data/uploads/signature/sign.png'),
                signature2Path: path.join(root, 'data/uploads/signature/sign.png'),
                info: {
                    artistName:    'Arunee Rattanakorn',
                    year:          '2024',
                    artworkNameTH: 'รรลุธรรม',
                    artworkNameEN: 'Enlightenment',
                    size:          '60 x 80 cm',
                    technique:     'Acrylic on Canvas',
                    price:         '25,000 THB',
                    description:   'This artwork explores the journey of the mind towards peace and spiritual awakening.',
                },
                outputPath: path.join(root, 'output/TEST_CERTIFICATE.pdf'),
            });
            console.log('✅ Certificate test completed successfully');
        } catch (e) {
            console.error('❌ Certificate test failed:', e.message);
        }
    })();
}