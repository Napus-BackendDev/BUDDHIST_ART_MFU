const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const FONT_URL = 'https://github.com/google/fonts/raw/main/ofl/sarabun/Sarabun-Regular.ttf';
const TEMPLATE_PATH = path.join(__dirname, '../../public/system/doc/Certification Tempate.pdf');

const COORDS = {
    images: {
        artwork:    { x: 60,  y: 395, width: 200, height: 150 },
        signature1: { x: 370, y: 128, width: 85,  height: 40  },
        signature2: { x: 100, y: 128, width: 85,  height: 40  }
    },
    text: {
        artistName:    { x: 120, y: 630, size: 12, maxWidth: 150 },
        year:          { x: 508, y: 605, size: 12, maxWidth: 50  },
        artworkNameTH: { x: 365, y: 550, size: 12, maxWidth: 200 },
        size:          { x: 375, y: 520, size: 12, maxWidth: 150 },
        technique:     { x: 375, y: 497, size: 12, maxWidth: 150 },
        price:         { x: 375, y: 473, size: 12, maxWidth: 150 },
        description:   { x: 365, y: 450, size: 10, maxWidth: 200 }
    }
};

/** Helper to wrap text with padding and word-breaking support */
function wrapText(text, maxWidth, font, fontSize) {
    const limit = maxWidth - 15;
    const lines = [];
    let currentLine = '';

    String(text || '').split(' ').forEach(word => {
        if (font.widthOfTextAtSize(word, fontSize) > limit) {
            for (const char of word) {
                if (font.widthOfTextAtSize(currentLine + char, fontSize) > limit) {
                    lines.push(currentLine);
                    currentLine = char;
                } else currentLine += char;
            }
        } else {
            const test = currentLine ? `${currentLine} ${word}` : word;
            if (font.widthOfTextAtSize(test, fontSize) <= limit) currentLine = test;
            else { lines.push(currentLine); currentLine = word; }
        }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
}

/** Internal helper to process and draw images */
async function drawImage(pdfDoc, page, imgPath, box) {
    if (!imgPath || !fs.existsSync(imgPath)) return;
    const buf = await sharp(imgPath).resize(box.width, box.height, { fit: 'inside' }).toFormat('png').toBuffer();
    const img = await pdfDoc.embedPng(buf);
    const dims = img.scaleToFit(box.width, box.height);
    page.drawImage(img, {
        x: box.x + (box.width - dims.width) / 2,
        y: box.y + (box.height - dims.height) / 2,
        width: dims.width, height: dims.height
    });
}

/** Main Certificate Generator */
const generateCertificate = async ({ artworkPath, signature1Path, signature2Path, info, outputPath }) => {
    try {
        console.log('Generating Certificate...');

        // 1. Validations
        if (!fs.existsSync(TEMPLATE_PATH)) throw new Error('PDF Template not found');
        if (!artworkPath || !fs.existsSync(artworkPath)) throw new Error('Artwork image not found');
        if (!info) throw new Error('Certificate information is missing');

        // 2. Load Template and Register Fontkit
        const pdfDoc = await PDFDocument.load(fs.readFileSync(TEMPLATE_PATH));
        pdfDoc.registerFontkit(fontkit);
        const page = pdfDoc.getPages()[0];

        // 3. Load Custom Thai Font from URL
        const fontRes = await axios.get(FONT_URL, { responseType: 'arraybuffer' });
        const font = await pdfDoc.embedFont(fontRes.data);

        // 4. Smart Name Logic (Combine TH and EN only if they fit on one line)
        const displayInfo = { ...info };
        if (info.artworkNameTH && info.artworkNameEN) {
            const combinedName = `${info.artworkNameTH} (${info.artworkNameEN})`;
            const slot = COORDS.text.artworkNameTH;
            const textWidth = font.widthOfTextAtSize(combinedName, slot.size);
            
            // If combined fits in one line (with padding), use it. Otherwise, TH only.
            if (textWidth <= (slot.maxWidth - 15)) {
                displayInfo.artworkNameTH = combinedName;
            } else {
                displayInfo.artworkNameTH = info.artworkNameTH;
            }
        }

        // 5. Draw Images
        await drawImage(pdfDoc, page, artworkPath, COORDS.images.artwork);
        await drawImage(pdfDoc, page, signature1Path, COORDS.images.signature1);
        await drawImage(pdfDoc, page, signature2Path, COORDS.images.signature2);

        // 6. Draw Text Fields with Wrapping
        Object.entries(COORDS.text).forEach(([key, slot]) => {
            const val = displayInfo[key];
            if (!val) return;
            const lines = wrapText(val, slot.maxWidth, font, slot.size);
            lines.forEach((line, i) => {
                page.drawText(line, { 
                    x: slot.x, 
                    y: slot.y - (i * slot.size * 1.2), 
                    size: slot.size, 
                    font, 
                    color: rgb(0,0,0) 
                });
            });
        });

        // 7. Save and Return
        const pdfBytes = await pdfDoc.save();
        if (outputPath) {
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, pdfBytes);
            console.log(`Success saved to: ${outputPath}`);
        }
        
        return pdfBytes;

    } catch (err) {
        console.error('Certificate Generation Error:', err);
        throw err;
    }
};

module.exports = { generateCertificate };

// Standalone Test Block
if (require.main === module) {
    (async () => {
        const root = path.join(__dirname, '../../public');
        try {
            await generateCertificate({
                artworkPath: path.join(root, 'data/uploads/artwork/artwork-1777229372320-369014989.jpg'),
                signature1Path: path.join(root, 'data/uploads/signature/sign.png'),
                signature2Path: path.join(root, 'data/uploads/signature/sign.png'),
                info: {
                    artistName: 'Arunee Rattanakorn',
                    year: '2024',
                    artworkNameTH: 'รรลุธรรม',
                    artworkNameEN: 'Enlightenment',
                    size: '60 x 80 cm',
                    technique: 'Acrylic on Canvas',
                    price: '25,000 THB',
                    description: 'This artwork explores the journey of the mind towards peace and spiritual awakening.'
                },
                outputPath: path.join(root, 'output/TEST_CERTIFICATE.pdf')
            });
            console.log('--- TEST COMPLETED SUCCESSFULLY ---');
        } catch (e) {
            console.error('--- TEST FAILED ---', e.message);
        }
    })();
}