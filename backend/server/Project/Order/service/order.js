const fs = require('fs');
const path = require('path');
const mongo = require('mongodb');
const Order = require('../controller/order');
const Artwork = require('../../Artwork/controller/artwork');
const Status = require('../../Settings/controller/status');
const ResMessage = require("../../Settings/service/message");
const { sendMail } = require("../../../../helpers/google/Mail");
const { confirmationOrderMail, approvedOrderMail, rejectedOrderMail } = require("../../Mail");
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
    const mongoose = require('mongoose');

    try {
        console.log(`[Backend Checkout Flow 5.1] Starting Order Creation Transaction...`);
        // --- 🔢 Generate Custom Order Number (ORD-YYYY-XXXX) ---
        const now = new Date();
        const year = now.getFullYear();
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31, 23, 59, 59);

        // Count orders created this year (within transaction)
        const orderCount = await Order.onQuerys({
            createdAt: { $gte: yearStart, $lte: yearEnd }
        });
        
        const sequence = (orderCount.length + 1).toString().padStart(4, '0');
        const customOrderNumber = `ORD-${year}-${sequence}`;
        request.body.orderNumber = customOrderNumber;

        // --- 1. Find "Reserved" Status ID first (Very Robust Search) ---
        const reservedStatus = await Status.onQuery({
            $or: [
                { "title.value": { $regex: /Reserved/i } },
                { "title.value": { $regex: /รอชำระเงิน/i } }
            ]
        });

        if (!reservedStatus) {
            console.error("CRITICAL: Reserved status not found in database settings.");
            throw new Error("System error: Reservation status not configured.");
        }

        // --- 2. LOCK & RESERVE ARTWORKS IMMEDIATELY ---
        const artworkIds = request.body.artwork || [];
        console.log(`[Backend Checkout Flow 5.2] Attempting to lock artworks:`, artworkIds);
        for (let id of artworkIds) {
            const artworkId = id._id || id;
            
            // Atomic update: only update if not already reserved
            const updateResult = await Artwork.onUpdate(
                { 
                    _id: new mongo.ObjectId(artworkId),
                    "status.approval": { $ne: reservedStatus._id }
                },
                { "status.approval": reservedStatus._id },
                undefined,
                '',
                { new: true }
            );

            if (!updateResult) {
                console.log(`[Backend Checkout Flow 5.2 - Failed] Artwork ${artworkId} is already reserved! Aborting transaction.`);
                throw new Error("RESERVED_ALREADY");
            }
            console.log(`[Backend Checkout Flow 5.2 - Success] Artwork ${artworkId} successfully locked.`);
        }

        // --- 3. CREATE ORDER RECORD ---
        console.log(`[Backend Checkout Flow 5.3] Creating order record for order number: ${customOrderNumber}`);
        const doc = await Order.onCreate(request.body);
        console.log(`[Backend Checkout Flow 5.3 - Success] Order created with _id: ${doc._id}`);

        // --- 4. CONTINUING WITH OTHER PROCESSES (PDF, EMAIL, ETC.) ---

        console.log(`[Backend Checkout Flow 5.4] Processing completed successfully.`);

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

            const attachments = [];

            // --- 🎫 เงื่อนไขการส่ง Invoice และ Slip ---
            // ส่ง Invoice และ Slip เฉพาะเมื่อมีการอัปโหลดรูป Bil มาแล้วเท่านั้น
            if (doc.image) {
                // 1. แนบ Invoice
                attachments.push({
                    filename: fileName,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                });

                // 2. แนบ Slip (Bil)
                const root = path.join(__dirname, '../../../../public');
                const splitPattern = doc.image.includes('/data/uploads/') ? '/data/uploads/' : '/uploads/';
                const slipRelPath = doc.image.split(splitPattern)[1];
                const slipPath = path.join(root, slipRelPath);
                
                if (fs.existsSync(slipPath)) {
                    attachments.push({ 
                        filename: `Payment_Slip_${doc.orderNumber || doc._id}${path.extname(slipPath)}`, 
                        path: slipPath 
                    });
                }
            }

            await sendMail(to, 'Order Confirmation - Buddhist Art MFU', '', html, attachments);
        }

        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error(err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onUpload = async function (request, response) {
    try {
        console.log(`[Backend Checkout Flow 6.1] Received upload request for payment slip...`);
        let query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const imagePath = Order.getImageUrl(request, request.file.destination, request.file.filename);

        console.log(`[Backend Checkout Flow 6.2] Saving payment slip image path: ${imagePath} for order ID: ${request.body._id}`);
        const doc = await Order.onUpdate(query, { image: imagePath }, [], "image");
        
        // --- 📧 ส่งเมลแจ้งเมื่อได้รับสลิป (Bil) ---
        try {
            const fullDoc = await Order.onQuery(query); // ดึงข้อมูลแบบเต็มเพื่อส่งเมล
            if (fullDoc && fullDoc.contact?.email) {
                const buyerName = fullDoc.contact?.name || "Customer";
                const orderId = fullDoc.orderNumber || fullDoc._id;
                const artworkTitle = fullDoc.artwork && fullDoc.artwork[0] 
                    ? (fullDoc.artwork[0].title.find(t => t.key === 'en')?.value || fullDoc.artwork[0].title[0]?.value || "Artwork")
                    : "Artwork";
                const price = fullDoc.artwork ? fullDoc.artwork.reduce((sum, art) => sum + (art.price || 0), 0) : 0;
                const orderDate = fullDoc.createdAt ? new Date(fullDoc.createdAt).toLocaleString('th-TH') : new Date().toLocaleString('th-TH');

                const html = confirmationOrderMail({
                    buyerName,
                    orderId,
                    artworkTitle,
                    price,
                    orderDate
                });

                const root = path.join(__dirname, '../../../../public');
                const attachments = [];

                // 1. แนบ Invoice (ถ้ามีไฟล์อยู่แล้วในเครื่อง)
                if (fullDoc.invoiceFile) {
                    const buyerFolderName = sanitize(fullDoc.contact?.name || (fullDoc.user && fullDoc.user.name) || "Customer");
                    const buyerId = fullDoc.user ? (fullDoc.user._id || fullDoc.user) : "Guest";
                    const invoicePath = path.join(root, `account/User/${buyerId}_${buyerFolderName}/Invoice/${fullDoc.invoiceFile}`);
                    
                    if (fs.existsSync(invoicePath)) {
                        attachments.push({ filename: fullDoc.invoiceFile, path: invoicePath });
                    }
                }

                // 2. แนบ Slip (Bil) ที่เพิ่งอัปโหลด
                const splitPattern = imagePath.includes('/data/uploads/') ? '/data/uploads/' : '/uploads/';
                const slipRelPath = imagePath.split(splitPattern)[1];
                const slipPath = path.join(root, slipRelPath);
                
                if (fs.existsSync(slipPath)) {
                    attachments.push({ 
                        filename: `Payment_Slip_${orderId}${path.extname(slipPath)}`, 
                        path: slipPath 
                    });
                }

                await sendMail(fullDoc.contact.email, 'Payment Received & Invoice - Buddhist Art MFU', '', html, attachments);
                console.log(`[Backend Checkout Flow 6.4] Confirmation email with invoice sent to ${fullDoc.contact.email}`);
            }
        } catch (emailErr) {
            console.error(`[Backend Checkout Flow 6 - Email Error]`, emailErr);
        }

        console.log(`[Backend Checkout Flow 6.3 - Success] Payment slip uploaded successfully.`);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error(`[Backend Checkout Flow 6 - Error] Error uploading payment slip:`, err);
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
            const isApproved = doc.status.title.some(t => t.value === 'Approved' || t.value === 'อนุมัติ');

            if (isApproved) {
                // Update artwork status to Sold Out and Approved
                if (doc.artwork && doc.artwork.length > 0) {
                    const soldOutStatus = await Status.onQuery({ "title.value": "Sold Out", "title.key": "en" });
                    const approvedStatus = await Status.onQuery({ "title.value": "Approved", "title.key": "en" });
                    if (soldOutStatus && approvedStatus) {
                        for (let art of doc.artwork) {
                             await Artwork.onUpdate(
                                { _id: new mongo.ObjectId(art._id) },
                                { "status.sale": soldOutStatus._id, "status.approval": approvedStatus._id }
                             );
                        }
                    }
                }

                // Automatically generate and save certificate when approved
                console.log(`Order ${doc.orderNumber} approved. Generating certificate...`);
                try {
                    // Re-fetch with full population to ensure art.image exists
                    const fullDoc = await Order.onQuery({ _id: doc._id });
                    const pdfBuffer = await generateAndSaveCertificateFile(fullDoc);

                    // --- 📧 Send Approved Email ---
                    const buyerEmail = fullDoc.contact?.email;
                    if (buyerEmail) {
                        const artworkTitle = fullDoc.artwork && fullDoc.artwork[0] 
                            ? (fullDoc.artwork[0].title.find(t => t.key === 'en')?.value || fullDoc.artwork[0].title[0]?.value || "Artwork")
                            : "Artwork";

                        const html = approvedOrderMail({
                            buyerName: fullDoc.contact?.name || "Customer",
                            orderId: fullDoc.orderNumber || fullDoc._id,
                            artworkTitle,
                            price: fullDoc.artwork && fullDoc.artwork[0] ? fullDoc.artwork[0].price : 0
                        });

                        const orderIdentifier = fullDoc.orderNumber ? fullDoc.orderNumber.replace(/-/g, '_') : fullDoc._id;
                        const root = path.join(__dirname, '../../../../public');
                        const buyerName = sanitize(fullDoc.contact?.name || (fullDoc.user && fullDoc.user.name) || "Customer");
                        const buyerId = fullDoc.user ? (fullDoc.user._id || fullDoc.user) : "Guest";

                        const attachments = [];
                        
                        // 1. Certificate (from memory buffer)
                        attachments.push({
                            filename: `Certificate_${orderIdentifier}.pdf`,
                            content: pdfBuffer,
                            contentType: 'application/pdf'
                        });

                        // 2. Invoice (from disk)
                        if (fullDoc.invoiceFile) {
                            const invoicePath = path.join(root, `account/User/${buyerId}_${buyerName}/Invoice/${fullDoc.invoiceFile}`);
                            if (fs.existsSync(invoicePath)) {
                                attachments.push({ filename: fullDoc.invoiceFile, path: invoicePath });
                            }
                        }

                        // 3. Slip/Bil (from disk)
                        if (fullDoc.image) {
                            const splitPattern = fullDoc.image.includes('/data/uploads/') ? '/data/uploads/' : '/uploads/';
                            const slipRelPath = fullDoc.image.split(splitPattern)[1];
                            const slipPath = path.join(root, slipRelPath);
                            if (fs.existsSync(slipPath)) {
                                attachments.push({ 
                                    filename: `Payment_Slip_${orderIdentifier}${path.extname(slipPath)}`, 
                                    path: slipPath 
                                });
                            }
                        }

                        await sendMail(buyerEmail, 'Payment Approved & Documents - Buddhist Art MFU', '', html, attachments);
                    }
                } catch (certErr) {
                    console.error("Auto Certificate Generation or Email Failed:", certErr.message);
                }
            }

            if (isRejected) {
                // --- 📧 Send Rejected Email ---
                const buyerEmail = doc.contact?.email;
                if (buyerEmail) {
                    const artworkTitle = doc.artwork && doc.artwork[0] 
                        ? (doc.artwork[0].title.find(t => t.key === 'en')?.value || doc.artwork[0].title[0]?.value || "Artwork")
                        : "Artwork";

                    const html = rejectedOrderMail({
                        buyerName: doc.contact?.name || "Customer",
                        orderId: doc.orderNumber || doc._id,
                        artworkTitle,
                        reason: request.body.remark || "The provided payment evidence could not be verified."
                    });

                    await sendMail(buyerEmail, 'Action Required: Order Update - Buddhist Art MFU', '', html);
                }

                if (doc.artwork && doc.artwork.length > 0) {
                    const availableStatus = await Status.onQuery({
                        "title.value": "Available",
                        "title.key": "en"
                    });
                    const approvedStatus = await Status.onQuery({
                        "title.value": "Approved",
                        "title.key": "en"
                    });

                    if (availableStatus && approvedStatus) {
                        for (let art of doc.artwork) {
                            await Artwork.onUpdate(
                                { _id: new mongo.ObjectId(art._id) },
                                { 
                                    "status.sale": availableStatus._id,
                                    "status.approval": approvedStatus._id 
                                }
                            );
                        }
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
        
        if (!doc) {
            return ResMessage.sendResponse(response, 0, 40400, "Order not found");
        }

        // --- 🛡️ Status Check: Only allow if 'Approved' ---
        const isApproved = doc.status?.title?.some(t => t.value === 'Approved' || t.value === 'อนุมัติ');
        if (!isApproved) {
            return ResMessage.sendResponse(response, 0, 40300, "Certificate is only available for Approved orders");
        }

        // --- 🔍 Check if file already exists ---
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
        const orderIdentifier = doc.orderNumber ? doc.orderNumber.replace(/-/g, '_') : doc._id;
        const fileName = `Certificate_${orderIdentifier}.pdf`;
        const root = path.join(__dirname, '../../../../public');
        const uploadDir = path.join(root, `account/User/${buyerId}_${buyerName}/Certificate`);
        const filePath = path.join(uploadDir, fileName);

        /* 
        if (fs.existsSync(filePath)) {
            const existingPdf = fs.readFileSync(filePath);
            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            return response.send(existingPdf);
        }
        */

        if (!doc.artwork || doc.artwork.length === 0) {
            return ResMessage.sendResponse(response, 0, 40400, "Artworks not found for this order");
        }

        try {
            const pdfBuffer = await generateAndSaveCertificateFile(doc);
            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            return response.send(pdfBuffer);
        } catch (genErr) {
            console.error('Certificate Generation Error:', genErr);
            return ResMessage.sendResponse(response, 0, 40400, "Failed to generate certificate");
        }

    } catch (err) {
        console.error('Download Certificate Error:', err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

/**
 * Internal Helper: Generates and Saves Certificate PDF to disk
 * @param {Object} doc - Populated Order document
 * @returns {Promise<Buffer>} - The generated PDF buffer
 */
async function generateAndSaveCertificateFile(doc) {
    if (!doc || !doc.artwork || doc.artwork.length === 0) {
        throw new Error("No artworks found for certificate generation");
    }

    const { PDFDocument } = require('pdf-lib');
    const PdfService = require('../../../../helpers/pdf.service');
    const mergedPdf = await PDFDocument.create();
    
    let root = process.cwd();
    if (!root.toLowerCase().endsWith('backend') && !root.toLowerCase().endsWith('backend\\')) {
        root = path.join(root, 'backend');
    }
    root = path.join(root, 'public');

    for (const art of doc.artwork) {
        // 1. Resolve Artwork Image Path
        let artworkLocalPath = "";
        if (art.image) {
            let cleanUrl = decodeURIComponent(art.image.replace(/^https?:\/\/[^/]+/, ""));
            if (cleanUrl.includes('/data/uploads/')) {
                const parts = cleanUrl.split('/data/uploads/');
                artworkLocalPath = path.join(root, 'data/uploads', parts[1]);
            } else if (cleanUrl.includes('/uploads/')) {
                const parts = cleanUrl.split('/uploads/');
                artworkLocalPath = path.join(root, parts[1]);
            } else {
                artworkLocalPath = path.join(root, cleanUrl.replace(/^\//, ""));
            }
        }

        if (!artworkLocalPath || !fs.existsSync(artworkLocalPath)) {
            console.warn(`[SKIP] Artwork image NOT FOUND at: ${artworkLocalPath}`);
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

        // 3. Generate Single Certificate using Puppeteer
        const certBytes = await PdfService.generateCertificate({
            artworkPath: artworkLocalPath,
            info
        });

        // 4. Add to Merged PDF
        const certDoc = await PDFDocument.load(certBytes);
        const copiedPages = await mergedPdf.copyPages(certDoc, certDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    if (mergedPdf.getPageCount() === 0) {
        throw new Error("Could not generate any certificates");
    }

    const finalPdfBytes = await mergedPdf.save();
    const pdfBuffer = Buffer.from(finalPdfBytes);

    // --- 💾 Save to Disk ---
    const buyerName = sanitize(doc.contact?.name || (doc.user && doc.user.name) || "Customer");
    const buyerId = doc.user ? (doc.user._id || doc.user) : "Guest";
    const orderIdentifier = doc.orderNumber ? doc.orderNumber.replace(/-/g, '_') : doc._id;
    const fileName = `Certificate_${orderIdentifier}.pdf`;
    const uploadDir = path.join(root, `account/User/${buyerId}_${buyerName}/Certificate`);
    
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadDir, fileName), pdfBuffer);

    return pdfBuffer;
}

function sanitize(text) {
    if (!text) return "";
    if (Array.isArray(text)) {
        const enVal = text.find(t => t.key === 'en')?.value;
        const thVal = text.find(t => t.key === 'th')?.value;
        return String(enVal || thVal || text[0]?.value || "").trim().replace(/\s+/g, "_").replace(/[/\\?%*:|"<>]/g, "");
    }
    return String(text).trim().replace(/\s+/g, "_").replace(/[/\\?%*:|"<>]/g, "");
}
