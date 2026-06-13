const fs = require('fs');
const path = require('path');
const PdfService = require('./helpers/pdf.service');

async function generateMock() {
    try {
        console.log('Generating mock certificate...');
        const mockData = {
            artworkPath: '', // Will leave empty so it falls back to no image gracefully or we could provide a dummy path
            info: {
                artworkNameTH: 'พระพุทธรูปปางมารวิชัย (จำลอง)',
                artworkNameEN: 'Buddha Subduing Mara (Replica)',
                artistName: 'นาย ศิลปิน ทดสอบ (Mr. Artist Test)',
                year: '2024',
                technique: 'Bronze Casting (หล่อสำริด)',
                size: '30 x 45 x 20 cm',
                price: '70 บาท (70 THB)',
                description: 'This is to certify that the mentioned artwork is an authentic work created by the artist. (เอกสารรับรองผลงานจำลองเพื่อการทดสอบ)'
            }
        };

        const pdfBuffer = await PdfService.generateCertificate(mockData);
        
        const outputPath = path.join(__dirname, 'mock_certificate.pdf');
        fs.writeFileSync(outputPath, pdfBuffer);
        
        console.log('Mock certificate generated successfully at:', outputPath);
        process.exit(0);
    } catch (error) {
        console.error('Failed to generate mock certificate:', error);
        process.exit(1);
    }
}

generateMock();
