const fs = require('fs');
const path = require('path');
const mongo = require('mongodb');
const Order = require('../controller/order');
const Artwork = require('../../Artwork/controller/artwork');
const Status = require('../../Settings/controller/status');
const ResMessage = require("../../Settings/service/message");
const { sendMail } = require("../../../../helpers/google/Mail");
const { confirmationOrderMail } = require("../../Mail");
const pdfService = require("../../../../helpers/pdf.service");
const { generateCertificate } = require("../../../../helpers/document/composite");
const { PDFDocument } = require('pdf-lib');

exports.onQuery = async function (request, response) {
    try {
        let query = {};
        const doc = await Order.onQuery(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onQuerys = async function (request, response) {
    try {
        let query = {};
        const doc = await Order.onQuerys(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onCreate = async function (request, response) {
    try {
        // --- 🔢 Generate Custom Order Number (ORD-YYYY-XXXX) ---
        const now = new Date();
        const year = now.getFullYear();
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31, 23, 59, 59);

        // Count orders created this year
        const orderCount = await Order.onQuerys({
            createdAt: { $gte: yearStart, $lte: yearEnd }
        });
        
        const sequence = (orderCount.length + 1).toString().padStart(4, '0');
        const customOrderNumber = `ORD-${year}-${sequence}`;
        request.body.orderNumber = customOrderNumber;

        const doc = await Order.onCreate(request.body);

        // After order is created, update artwork statuses to Sold Out
        if (doc && doc.artwork && doc.artwork.length > 0) {
            // Find the "Sold Out" status
            const soldOutStatus = await Status.onQuery({
                "title.value": "Sold Out",
                "title.key": "en"
            });

            if (soldOutStatus) {
                // Update each artwork status.sale
                for (let artworkId of doc.artwork) {
                    await Artwork.onUpdate(
                        { _id: new mongo.ObjectId(artworkId) },
                        { "status.sale": soldOutStatus._id }
                    );
                }
            }
        }

        let invoiceData = {
            orderId: doc.orderNumber || doc._id.toString(),
            customerName: doc.contact?.name || "Customer",
            customerAddress: doc.address?.shipping || doc.address?.bill || "N/A",
            items: [],
            total: 0,
            accountName: "กองทุนพุทธศิลป์",
            bankName: "ธนาคารกรุงไทย",
            accountNo: "XXX-X-XXXXX-X"
        };

        if (doc.artwork && doc.artwork.length > 0) {
            invoiceData.items = doc.artwork.map(art => {
                let title = "";
                if (art.title && Array.isArray(art.title)) {
                    title = art.title.find(t => t.key === 'th')?.value || art.title[0]?.value;
                } else {
                    title = art.title;
                }

                let artistName = "Unknown Artist";
                if (art.artist) {
                    if (art.artist.name && Array.isArray(art.artist.name)) {
                        artistName = art.artist.name.find(n => n.key === 'th')?.value || art.artist.name[0]?.value;
                    } else if (art.artist.name) {
                        artistName = art.artist.name;
                    }
                }

                invoiceData.total += art.price || 0;

                return {
                    title: title,
                    artist: artistName,
                    price: art.price || 0,
                    image: art.image
                };
            });
        }

        const pdfBuffer = await pdfService.generateInvoice(invoiceData);

        const sanitize = (text) => {
            if (!text) return "";
            if (Array.isArray(text)) {
                const enVal = text.find(t => t.key === 'en')?.value;
                const thVal = text.find(t => t.key === 'th')?.value;
                return String(enVal || thVal || text[0]?.value || "").trim().replace(/\s+/g, "_").replace(/[/\\?%*:|"<>]/g, "");
            }
            return String(text).trim().replace(/\s+/g, "_").replace(/[/\\?%*:|"<>]/g, "");
        };

        const folderBuyerName = sanitize(doc.contact?.name || (doc.user && doc.user.name) || "Customer");
        const buyerId = doc.user ? (doc.user._id || doc.user) : "Guest";
        
        const orderIdentifier = doc.orderNumber ? doc.orderNumber.replace(/-/g, '_') : doc._id;
        const fileName = `${orderIdentifier}.pdf`;
        const uploadDir = path.join(__dirname, `../../../../public/account/User/${buyerId}_${folderBuyerName}/Invoice`);
        const filePath = path.join(uploadDir, fileName);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.writeFileSync(filePath, pdfBuffer);

        await Order.onUpdate({ _id: doc._id }, { invoiceFile: fileName });

        const buyerName = doc.contact?.name || "Customer";
        const to = doc.contact?.email;
        const orderId = doc._id;
        const artworkTitle = invoiceData.items.length > 0 ? invoiceData.items[0].title : "Artwork";
        const price = invoiceData.total;
        let orderDate = doc.createdAt ? new Date(doc.createdAt).toLocaleString('th-TH') : new Date().toLocaleString('th-TH');

        if (to) {
            const html = confirmationOrderMail({
                buyerName,
                orderId: doc.orderNumber || doc._id,
                artworkTitle,
                price,
                orderDate
            });

            const attachments = [
                {
                    filename: fileName,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ];

            sendMail(to, 'Order Confirmation - Buddhist Art MFU', '', html, attachments);
        }

        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error(err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onUpload = async function (request, response) {
    try {
        let query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const imagePath = Order.getImageUrl(request, request.file.destination, request.file.filename);

        const doc = await Order.onUpdate(query, { image: imagePath }, [], "image");
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.log(err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onUpdate = async function (request, response) {
    try {
        let query = {}
        query._id = new mongo.ObjectId(request.body._id);

        const doc = await Order.onUpdate(query, request.body);

        // If order status is "Rejected", set artwork status back to "Available"
        if (doc && doc.status && doc.status.title) {
            const isRejected = doc.status.title.some(t => t.value === 'Rejected' || t.value === 'ไม่นุมัติ');

            if (isRejected && doc.artwork && doc.artwork.length > 0) {
                // Find "Available" status
                const availableStatus = await Status.onQuery({
                    "title.value": "Available",
                    "title.key": "en"
                });

                if (availableStatus) {
                    for (let art of doc.artwork) {
                        // In onUpdate, doc.artwork is already populated because of defaultPopulate
                        // So art is an object, we need art._id
                        await Artwork.onUpdate(
                            { _id: new mongo.ObjectId(art._id) },
                            { "status.sale": availableStatus._id }
                        );
                    }
                }
            }
        }

        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error(err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onDelete = async function (request, response) {
    try {
        let query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const doc = await Order.onDelete(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onDownloadInvoice = async function (request, response) {
    try {
        const orderId = request.params.id;
        const query = { _id: new mongo.ObjectId(orderId) };

        // Fetch order with populated artwork/artist
        const doc = await Order.onQuery(query);

        if (!doc) {
            return ResMessage.sendResponse(response, 0, 40400);
        }

        // Check if file already exists on server
        if (doc.invoiceFile) {
            const sanitize = (text) => {
                if (!text) return "";
                if (Array.isArray(text)) {
                    const enVal = text.find(t => t.key === 'en')?.value;
                    const thVal = text.find(t => t.key === 'th')?.value;
                    return String(enVal || thVal || text[0]?.value || "").trim().replace(/\s+/g, "_").replace(/[/\\?%*:|"<>]/g, "");
                }
                return String(text).trim().replace(/\s+/g, "_").replace(/[/\\?%*:|"<>]/g, "");
            };

            const buyerName = sanitize(doc.contact?.name || (doc.user && doc.user.name) || "Customer");
            const buyerId = doc.user ? (doc.user._id || doc.user) : "Guest";
            
            const uploadDir = path.join(__dirname, `../../../../public/account/User/${buyerId}_${buyerName}/Invoice`);
            const filePath = path.join(uploadDir, doc.invoiceFile);

            if (fs.existsSync(filePath)) {
                const existingPdf = fs.readFileSync(filePath);
                response.setHeader('Content-Type', 'application/pdf');
                const downloadName = doc.orderNumber || doc._id.toString().substring(doc._id.toString().length - 8).toUpperCase();
                response.setHeader('Content-Disposition', `attachment; filename=Invoice_${downloadName}.pdf`);
                return response.send(existingPdf);
            }
        }

        // --- 📄 Prepare Invoice Data (Fallback if file missing) ---
        let invoiceData = {
            orderId: doc.orderNumber || doc._id.toString(),
            customerName: doc.contact?.name || "Customer",
            customerAddress: doc.address?.shipping || doc.address?.bill || "N/A",
            items: [],
            total: 0,
            accountName: "กองทุนพุทธศิลป์",
            bankName: "ธนาคารกรุงไทย",
            accountNo: "XXX-X-XXXXX-X"
        };

        if (doc.artwork && doc.artwork.length > 0) {
            invoiceData.items = doc.artwork.map(art => {
                let title = "";
                if (art.title && Array.isArray(art.title)) {
                    title = art.title.find(t => t.key === 'th')?.value || art.title[0]?.value;
                } else {
                    title = art.title;
                }

                let artistName = "Unknown Artist";
                if (art.artist) {
                    if (art.artist.name && Array.isArray(art.artist.name)) {
                        artistName = art.artist.name.find(n => n.key === 'th')?.value || art.artist.name[0]?.value;
                    } else if (art.artist.name) {
                        artistName = art.artist.name;
                    }
                }

                invoiceData.total += art.price || 0;

                return {
                    title: title,
                    artist: artistName,
                    price: art.price || 0,
                    image: art.image
                };
            });
        }

        const pdfBuffer = await pdfService.generateInvoice(invoiceData);

        // Send PDF back to client
        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `attachment; filename=Invoice_${orderId}.pdf`);
        return response.send(pdfBuffer);

    } catch (err) {
        console.error('Download Invoice Error:', err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onDownloadCertificate = async function (request, response) {
    try {
        const orderId = request.params.id;
        const query = { _id: new mongo.ObjectId(orderId) };
        const doc = await Order.onQuery(query);

        if (!doc || !doc.artwork || doc.artwork.length === 0) {
            return ResMessage.sendResponse(response, 0, 40400, "Order or Artworks not found");
        }

        const mergedPdf = await PDFDocument.create();
        const root = path.join(__dirname, '../../../../public');
        const signaturePath = path.join(root, 'system/Signature/sign.png');

        for (const art of doc.artwork) {
            // 1. Resolve Artwork Image Path
            let artworkLocalPath = "";
            if (art.image) {
                // Support both old (/data/uploads/) and new (/uploads/) patterns
                const splitPattern = art.image.includes('/data/uploads/') ? '/data/uploads/' : '/uploads/';
                const urlParts = art.image.split(splitPattern);
                if (urlParts.length > 1) {
                    artworkLocalPath = path.join(root, urlParts[1]);
                }
            }

            if (!artworkLocalPath || !fs.existsSync(artworkLocalPath)) {
                console.warn(`Artwork image not found at ${artworkLocalPath}, skipping certificate for ${art._id}`);
                continue;
            }

            // 2. Prepare Info
            const getVal = (arr, key = 'en') => {
                if (!arr || !Array.isArray(arr)) return arr || "";
                const obj = arr.find(item => item.key === key);
                return obj ? obj.value : (arr[0] ? arr[0].value : "");
            };

            const info = {
                artistName: getVal(art.artist?.name, 'th') || getVal(art.artist?.name, 'en') || "Buddhist Art MFU",
                year: new Date(art.createdAt || Date.now()).getFullYear().toString(),
                artworkNameTH: getVal(art.title, 'th'),
                artworkNameEN: getVal(art.title, 'en'),
                size: getVal(art.size, 'en') || getVal(art.size, 'th') || "N/A",
                technique: getVal(art.technique, 'th') || getVal(art.technique, 'en') || "N/A",
                price: `${(art.price || 0).toLocaleString()} THB`,
                description: getVal(art.description, 'th') || getVal(art.description, 'en') || ""
            };

            // 3. Generate Single Certificate
            const certBytes = await generateCertificate({
                artworkPath: artworkLocalPath,
                signature1Path: signaturePath,
                signature2Path: signaturePath,
                info
            });

            // 4. Add to Merged PDF
            const certDoc = await PDFDocument.load(certBytes);
            const copiedPages = await mergedPdf.copyPages(certDoc, certDoc.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        if (mergedPdf.getPageCount() === 0) {
            return ResMessage.sendResponse(response, 0, 40400, "Could not generate any certificates");
        }

        const finalPdfBytes = await mergedPdf.save();
        
        response.setHeader('Content-Type', 'application/pdf');
        const downloadName = doc.orderNumber || doc._id.toString();
        response.setHeader('Content-Disposition', `attachment; filename=Certificate_${downloadName}.pdf`);
        return response.send(Buffer.from(finalPdfBytes));

    } catch (err) {
        console.error('Download Certificate Error:', err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};
