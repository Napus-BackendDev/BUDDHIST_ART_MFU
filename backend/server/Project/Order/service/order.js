const fs = require('fs');
const path = require('path');
const mongo = require('mongodb');
const Order = require('../controller/order');
const Artwork = require('../../Artwork/controller/artwork');
const Status = require('../../Settings/controller/status');
const StatusModel = require('../../Settings/models/status.model');
const ResMessage = require("../../Settings/service/message");
const { sendMail } = require("../../../../helpers/google/Mail");
const { confirmationOrderMail, approvedOrderMail, rejectedOrderMail, adminNewOrderMail } = require("../../Mail");
const pdfService = require("../../../../helpers/pdf.service");
const { PDFDocument } = require('pdf-lib');
const ArtworkModel = require('../../Artwork/models/artwork.model');
const UserModel = require('../../User/models/user.model');
const { generateOrderCode } = require('../../Artwork/service/artworkCode');
const { isPostTermPurchasable, getEffectiveMode, constants } = require('../../Artwork/service/postTermSale');
const { STATUS_CODES, LEGACY_NAMES, hasCode, queryForCode } = require('../../Settings/statusCodes');
const mfuDrive = require('../../../../helpers/mfuDrive');

// Keep fire-and-forget invoice/mail work observable so shutdown and tests can
// drain it before closing MongoDB. The customer response remains non-blocking.
const postCreateTasks = new Set();
const schedulePostCreate = (task) => {
    let resolveTask;
    const taskPromise = new Promise(resolve => { resolveTask = resolve; });
    postCreateTasks.add(taskPromise);
    setImmediate(async () => {
        try {
            await task();
        } finally {
            postCreateTasks.delete(taskPromise);
            resolveTask();
        }
    });
    return taskPromise;
};

exports.waitForPostCreateTasks = async function () {
    await Promise.all(Array.from(postCreateTasks));
};

const STATUS_NAMES = ['Reserved', 'Pending', 'Approved', 'Rejected', 'Cancelled', 'Available', 'Exhibition', 'Sold Out'];
const CODE_TO_STATUS_NAME = { RESERVED: 'Reserved', PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected', CANCELLED: 'Cancelled', AVAILABLE: 'Available', EXHIBITION: 'Exhibition', SOLD_OUT: 'Sold Out' };

const titleValue = (value) => {
    if (!value) return '';
    if (Array.isArray(value)) {
        return value.find(item => item && item.key === 'en')?.value
            || value.find(item => item && item.value)?.value
            || '';
    }
    return value.title ? titleValue(value.title) : String(value);
};

const idString = (value) => value && (value._id || value).toString();

const isValidObjectId = (value) => mongo.ObjectId.isValid(value);

const loadStatuses = async () => {
    const docs = await StatusModel.find({ $or: [{ code: { $in: Object.values(STATUS_CODES) } }, { 'title.value': { $in: STATUS_NAMES } }] }).lean();
    return docs.reduce((result, doc) => {
        const name = titleValue(doc.title);
        const code = doc.code || Object.keys(LEGACY_NAMES).find(key => (LEGACY_NAMES[key] || []).includes(name));
        if (name) result[name] = doc;
        if (code) result[code] = doc;
        return result;
    }, {});
};

const sendBusinessError = (response, code, error) =>
    ResMessage.sendResponse(response, 0, code, { error });

const normalizeArtworkIds = (artwork) => {
    if (!Array.isArray(artwork)) return null;
    const ids = artwork.map(item => idString(item)).filter(Boolean);
    if (ids.length === 0 || ids.length !== artwork.length) return null;
    if (ids.some(id => !isValidObjectId(id))) return null;
    const unique = new Set(ids);
    return unique.size === ids.length ? ids : null;
};

const allowedTransitions = {
    Reserved: new Set(['Reserved', 'Pending', 'Approved', 'Rejected', 'Cancelled']),
    Pending: new Set(['Pending', 'Approved', 'Rejected', 'Cancelled']),
    Approved: new Set(['Approved']),
    Rejected: new Set(['Rejected']),
    Cancelled: new Set(['Cancelled'])
};

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
    const lockedArtworks = [];
    let createdOrder = null;
    let reservedStatusId = null;

    try {
        console.log(`[Backend Checkout Flow 5.1] Starting Order Creation Transaction...`);
        // --- 1. Find "Reserved" Status ID first (Very Robust Search) ---
        const statuses = await loadStatuses();
        const reservedStatus = statuses.Reserved;
        const availableStatus = statuses.Available;
        const approvedStatus = statuses.Approved;
        const soldOutStatus = statuses['Sold Out'];
        const rejectedStatus = statuses.Rejected;
        /* const reservedStatus = await Status.onQuery({
            $or: [
                { "title.value": { $regex: /Reserved/i } },
                { "title.value": { $regex: /รอชำระเงิน/i } }
            ]
        });

        if (!reservedStatus) {
            console.error("CRITICAL: Reserved status not found in database settings.");
            throw new Error("System error: Reservation status not configured.");
        }
        reservedStatusId = reservedStatus._id;
        const normalizedArtworkIds = normalizeArtworkIds(request.body.artwork);
        if (!normalizedArtworkIds) {
            return sendBusinessError(response, 40000, 'ORDER_ARTWORKS_REQUIRED_AND_UNIQUE');
        }

        // --- Assign database status ID instead of relying on hardcoded schema default ---
        request.body.status = reservedStatus._id;

        // --- 2. LOCK & RESERVE ARTWORKS IMMEDIATELY ---
        const artworkIds = normalizedArtworkIds;
        const orderArtworks = await ArtworkModel.find({ _id: { $in: normalizedArtworkIds } })
            .select('_id artworkCode artist courseLevel status.approval status.sale postTermSale').lean();
        if (orderArtworks.length !== normalizedArtworkIds.length || orderArtworks.some(art => !art.artworkCode)) {
            return sendBusinessError(response, 40000, 'ORDER_ARTWORK_NOT_FOUND_OR_UNCODED');
        }
        request.body.artworkReferences = orderArtworks.map(art => ({
            artwork: art._id,
            artworkCode: art.artworkCode
        }));

        // Order code follows first artwork's student and submission cohort.
        // Multi-artwork orders use first artwork as the stable order identity.
        const firstArtwork = orderArtworks[0];
        const orderArtistId = firstArtwork?.artist || request.body.user;
        const orderArtist = orderArtistId
            ? await UserModel.findById(orderArtistId).lean()
            : null;
        let customOrderNumber = await generateOrderCode({
            artist: orderArtist,
            courseLevel: firstArtwork?.courseLevel || '00'
        }); */

        if (!reservedStatus) {
            console.error("CRITICAL: Reserved status not found in database settings.");
            throw new Error("System error: Reservation status not configured.");
        }
        reservedStatusId = reservedStatus._id;
        const normalizedArtworkIds = normalizeArtworkIds(request.body.artwork);
        if (!normalizedArtworkIds) {
            return sendBusinessError(response, 40000, 'ORDER_ARTWORKS_REQUIRED_AND_UNIQUE');
        }
        request.body.status = reservedStatus._id;
        const artworkIds = normalizedArtworkIds;
        const orderArtworks = await ArtworkModel.find({ _id: { $in: normalizedArtworkIds } })
            .select('_id artworkCode artist courseLevel status.approval status.sale').lean();
        if (orderArtworks.length !== normalizedArtworkIds.length || orderArtworks.some(art => !art.artworkCode)) {
            return sendBusinessError(response, 40000, 'ORDER_ARTWORK_NOT_FOUND_OR_UNCODED');
        }
        request.body.artworkReferences = orderArtworks.map(art => ({
            artwork: art._id,
            artworkCode: art.artworkCode
        }));
        const firstArtwork = orderArtworks[0];
        const orderArtistId = firstArtwork?.artist || request.body.user;
        const orderArtist = orderArtistId
            ? await UserModel.findById(orderArtistId).lean()
            : null;
        let customOrderNumber = await generateOrderCode({
            artist: orderArtist,
            courseLevel: firstArtwork?.courseLevel || '00'
        });
        request.body.orderNumber = customOrderNumber;
        console.log(`[Backend Checkout Flow 5.2] Attempting to lock artworks:`, artworkIds);
        for (let artworkId of artworkIds) {
            const currentArtwork = orderArtworks.find(art => String(art._id) === String(artworkId));
            const approvalId = idString(currentArtwork?.status?.approval);
            const saleId = idString(currentArtwork?.status?.sale);
            if (approvalId === idString(reservedStatus)
                || approvalId === idString(soldOutStatus)
                || approvalId === idString(rejectedStatus)
                || saleId === idString(soldOutStatus)) {
                throw new Error('ARTWORK_NOT_AVAILABLE');
            }
            if (!isPostTermPurchasable(currentArtwork, new Date())) {
                throw new Error('ARTWORK_NOT_AVAILABLE');
            }
            if (!approvedStatus || !availableStatus
                || approvalId !== idString(approvedStatus)
                || saleId !== idString(availableStatus)) {
                throw new Error('ARTWORK_NOT_AVAILABLE');
            }
            const lockFilter = {
                _id: new mongo.ObjectId(artworkId),
                'status.approval': approvedStatus._id,
                'status.sale': availableStatus._id,
                $or: [
                    { 'postTermSale.applicable': { $ne: true } },
                    { 'postTermSale.initialSaleEndsAt': { $gt: new Date() } },
                    { 'postTermSale.mode': constants.MODES.STANDARD },
                    { 'postTermSale.decision': constants.DECISIONS.CONTINUE }
                ]
            };
            
            // Atomic update: only update if not already reserved
            const updateResult = await Artwork.onUpdate(
                lockFilter,
                { "status.approval": reservedStatus._id },
                undefined,
                '',
                { new: true }
            );

            if (!updateResult) {
                console.log(`[Backend Checkout Flow 5.2 - Failed] Artwork ${artworkId} is already reserved! Aborting transaction.`);
                throw new Error('ARTWORK_NOT_AVAILABLE');
            }
            const originalArtwork = currentArtwork;
            lockedArtworks.push({
                _id: artworkId,
                approvalStatus: originalArtwork && originalArtwork.status
                    ? originalArtwork.status.approval
                    : null
            });
            console.log(`[Backend Checkout Flow 5.2 - Success] Artwork ${artworkId} successfully locked.`);
        }

        // --- 3. CREATE ORDER RECORD ---
        console.log(`[Backend Checkout Flow 5.3] Creating order record for order number: ${customOrderNumber}`);
        let doc;
        for (let attempt = 0; attempt < 3; attempt += 1) {
            try {
                request.body.orderNumber = customOrderNumber;
                doc = await Order.onCreate(request.body);
                break;
            } catch (createError) {
                const duplicateOrderNumber = createError?.code === 11000
                    && (createError.keyPattern?.orderNumber || /orderNumber/i.test(createError.message || ''));
                if (!duplicateOrderNumber || attempt === 2) throw createError;
                customOrderNumber = await generateOrderCode({
                    artist: orderArtist,
                    courseLevel: firstArtwork?.courseLevel || '00'
                });
            }
        }
        createdOrder = doc;
        console.log(`[Backend Checkout Flow 5.3 - Success] Order created with _id: ${doc._id}`);

        // --- 4. QUEUE FOLLOW-UP PROCESSES (PDF, EMAIL, ETC.) ---
        // The order is already reserved and persisted. Do not make the customer wait
        // for Puppeteer or an external SMTP server before moving to payment.
        console.log(`[Backend Checkout Flow 5.4] Order created; queued invoice/email follow-up.`);
        schedulePostCreate(async () => {
        let mailFailed = false;
        let invoiceCompleted = false;
        try {
        let invoiceData = {
            orderId: doc.orderNumber || doc._id.toString(),
            customerName: doc.contact?.name || "Customer",
            customerAddress: doc.address?.bill || doc.address?.shipping || "N/A",
            items: [],
            total: 0,
            accountName: "มหาวิทยาลัยแม่ฟ้าหลวง (กองทุนพุทธศิลปกรรมแห่งมหาวิทยาลัยแม่ฟ้าหลวง)",
            bankName: "ธนาคารกรุงเทพฯ สาขาแม่ฟ้าหลวงฯ",
            accountNo: "672-0-50576-4"
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

        await Order.onUpdate({ _id: doc._id }, {
            invoiceFile: fileName,
            invoiceStatus: 'Completed',
            invoiceError: ''
        });
        invoiceCompleted = true;

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

            await sendMail(to, 'ยืนยันการจองผลงานสร้างสรรค์ - พุทธศิลปกรรม มฟล.', '', html, attachments);
        }

        // --- 📧 ส่งอีเมลแจ้งเตือนแอดมินเกี่ยวกับการจองใหม่ ---
        try {
            const adminEmail = process.env.SMTP_USER;
            if (adminEmail) {
                const adminHtml = adminNewOrderMail({
                    buyerName,
                    orderId: doc.orderNumber || doc._id,
                    artworkTitle,
                    price,
                    orderDate
                });
                await sendMail(adminEmail, `[มีรายการจองใหม่] คำสั่งซื้อหมายเลข ${doc.orderNumber || doc._id} - พุทธศิลปกรรม มฟล.`, '', adminHtml);
                console.log(`[Admin Notification] New order email sent to admin: ${adminEmail}`);
            }
        } catch (adminEmailErr) {
            console.error("Failed to send new order notification to admin:", adminEmailErr.message);
            mailFailed = true;
        }
        await Order.onUpdate(
            { _id: doc._id },
            {
                mailStatus: mailFailed ? 'Failed' : 'Completed',
                mailError: mailFailed ? 'Admin notification failed' : ''
            }
        );
        } catch (postCreateErr) {
            console.error(`[Backend Checkout Flow 5.4] Order ${doc._id} created, but invoice/email processing failed:`, postCreateErr);
            await Order.onUpdate(
                { _id: doc._id },
                {
                    invoiceStatus: invoiceCompleted ? 'Completed' : 'Failed',
                    invoiceError: invoiceCompleted ? '' : String(postCreateErr.message || postCreateErr),
                    mailStatus: 'Failed',
                    mailError: String(postCreateErr.message || postCreateErr)
                }
            ).catch(statusErr => console.error('[Backend Checkout] Could not record mail failure:', statusErr));
        }
        });

        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error(err);
        if (!createdOrder && reservedStatusId && lockedArtworks.length > 0) {
            await Promise.all(lockedArtworks.map(art => ArtworkModel.updateOne(
                { _id: art._id, 'status.approval': reservedStatusId },
                { $set: { 'status.approval': art.approvalStatus } }
            ))).catch(rollbackErr => {
                console.error('[Backend Checkout Rollback] Failed to restore artwork status:', rollbackErr);
            });
        }
        if (err?.message === 'ARTWORK_NOT_AVAILABLE') {
            return sendBusinessError(response, 40900, err.message);
        }
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onUpload = async function (request, response) {
    try {
        console.log(`[Backend Checkout Flow 6.1] Received upload request for payment slip...`);
        if (!isValidObjectId(request.body?._id) || !request.file) {
            return sendBusinessError(response, 40000, 'PAYMENT_SLIP_AND_ORDER_REQUIRED');
        }
        let query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const currentOrder = await Order.onQuery(query);
        if (!currentOrder) return ResMessage.sendResponse(response, 0, 40400);
        const currentStatus = currentOrder.status;
        if (!hasCode(currentStatus, STATUS_CODES.RESERVED)) {
            return sendBusinessError(response, 40900, 'ORDER_NOT_AWAITING_PAYMENT');
        }
        // Compare-and-set the payment upload against the Reserved/no-slip state.
        // This prevents a timeout cron claim from being overwritten by a late upload.
        query.status = idString(currentOrder.status);
        query.$or = [{ image: { $exists: false } }, { image: null }, { image: '' }];
        const imagePath = Order.getImageUrl(request, request.file.destination, request.file.filename);

        // Find "Pending" status in settings to update order status
        const pendingStatusByCode = await StatusModel.findOne(queryForCode(STATUS_CODES.PENDING)).lean();
        const pendingStatus = pendingStatusByCode || await Status.onQuery({
            $or: [
                { "title.value": { $regex: /^Pending$/i } },
                { "title.value": { $regex: /^รอตรวจสอบ$/i } }
            ]
        });

        const updateData = { image: imagePath };
        if (pendingStatus) {
            updateData.status = pendingStatus._id;
            console.log(`[Backend Checkout Flow 6.2.1] Found Pending status ID: ${pendingStatus._id}, updating order status.`);
        } else {
            console.warn(`[Backend Checkout Flow 6.2.2] Warning: Pending status not found in settings.`);
            return sendBusinessError(response, 40000, 'PENDING_STATUS_NOT_CONFIGURED');
        }

        console.log(`[Backend Checkout Flow 6.2] Saving payment slip image path: ${imagePath} for order ID: ${request.body._id}`);
        const doc = await Order.onUpdate(query, updateData, [], "image status");
        if (!doc) return sendBusinessError(response, 40900, 'ORDER_NOT_AWAITING_PAYMENT');
        
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
                let slipPath = "";
                if (imagePath) {
                    let cleanUrl = decodeURIComponent(imagePath.replace(/^https?:\/\/[^/]+/, ""));
                    let slipRelPath = "";
                    if (cleanUrl.includes('/data/uploads/')) {
                        slipRelPath = path.join('data/uploads', cleanUrl.split('/data/uploads/')[1]);
                    } else if (cleanUrl.includes('/uploads/')) {
                        slipRelPath = cleanUrl.split('/uploads/')[1];
                    } else {
                        slipRelPath = cleanUrl.replace(/^\//, "");
                    }
                    slipPath = path.join(root, slipRelPath);
                }
                
                if (slipPath && fs.existsSync(slipPath) && fs.statSync(slipPath).isFile()) {
                    attachments.push({ 
                        filename: `Payment_Slip_${orderId}${path.extname(slipPath)}`, 
                        path: slipPath 
                    });
                }

                await sendMail(fullDoc.contact.email, 'ได้รับหลักฐานการชำระเงินและใบแจ้งหนี้ - พุทธศิลปกรรม มฟล.', '', html, attachments);
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
        if (!isValidObjectId(request.body?._id)) {
            return sendBusinessError(response, 40000, 'ORDER_ID_REQUIRED');
        }
        const query = { _id: new mongo.ObjectId(request.body._id) };
        const beforeDoc = await Order.onQuery(query);
        if (!beforeDoc) return ResMessage.sendResponse(response, 0, 40400);

        const updateData = { ...request.body };
        delete updateData._id;
        const allowedFields = new Set([
            'status', 'remark', 'contact', 'address', 'carrier',
            'trackingId', 'deliveryDate', 'invoiceFile', 'image',
            'invoiceStatus', 'invoiceError', 'mailStatus', 'mailError',
            'certificateStatus', 'certificateError'
        ]);
        Object.keys(updateData).forEach(key => {
            if (!allowedFields.has(key)) delete updateData[key];
        });

        const currentStatusName = CODE_TO_STATUS_NAME[beforeDoc.status?.code] || titleValue(beforeDoc.status?.title || beforeDoc.status);
        let nextStatusName = currentStatusName;
        if (Object.prototype.hasOwnProperty.call(updateData, 'status')) {
            const nextStatusId = idString(updateData.status);
            if (!isValidObjectId(nextStatusId)) {
                return sendBusinessError(response, 40000, 'ORDER_STATUS_REQUIRED');
            }
            const nextStatus = await StatusModel.findById(nextStatusId).lean();
            nextStatusName = CODE_TO_STATUS_NAME[nextStatus?.code] || titleValue(nextStatus?.title);
            if (!nextStatusName || !allowedTransitions[currentStatusName]?.has(nextStatusName)) {
                return sendBusinessError(response, 40900, 'ORDER_STATE_TRANSITION_NOT_ALLOWED');
            }
            updateData.status = nextStatus._id;
        }

        const statusChanged = nextStatusName !== currentStatusName;
        const doc = await Order.onUpdate(query, updateData);
        const workflowStatuses = await loadStatuses();

        // If order status is "Rejected", set artwork status back to "Available"
        if (doc && statusChanged && doc.status && doc.status.title) {
            const isRejected = hasCode(doc.status, STATUS_CODES.REJECTED) || doc.status.title.some(t => t.value === 'Rejected' || t.value === 'ไม่นุมัติ');
            const isApproved = hasCode(doc.status, STATUS_CODES.APPROVED) || doc.status.title.some(t => t.value === 'Approved' || t.value === 'อนุมัติ');

            if (isApproved) {
                // Update artwork status to Sold Out and Approved
                if (doc.artwork && doc.artwork.length > 0) {
                    const soldOutStatus = await StatusModel.findOne(queryForCode(STATUS_CODES.SOLD_OUT)).lean();
                    const approvedStatus = await StatusModel.findOne(queryForCode(STATUS_CODES.APPROVED)).lean();
                    if (soldOutStatus && approvedStatus) {
                        for (let art of doc.artwork) {
                             await Artwork.onUpdate(
                                { _id: new mongo.ObjectId(art._id), 'status.approval': workflowStatuses.Reserved?._id },
                                { "status.sale": soldOutStatus._id, "status.approval": approvedStatus._id }
                             );
                        }
                    }
                }

                // Automatically generate and save certificate when approved
                console.log(`Order ${doc.orderNumber} approved. Generating certificate...`);
                await Order.onUpdate(
                    { _id: doc._id },
                    { certificateStatus: 'Pending', certificateError: '' }
                );
                try {
                    // Re-fetch with full population to ensure art.image exists
                    const fullDoc = await Order.onQuery({ _id: doc._id });
                    const pdfBuffer = await generateAndSaveCertificateFile(fullDoc);

                    // --- 📧 Send Approved Email ---
                    const buyerEmail = fullDoc.contact?.email;
                    if (buyerEmail) {
                        const artwork = fullDoc.artwork && fullDoc.artwork[0] ? fullDoc.artwork[0] : {};
                        const artworkTitle = artwork.title?.find(t => t.key === 'en')?.value
                            || artwork.title?.[0]?.value
                            || "Artwork";
                        const orderIdentifier = fullDoc.orderNumber ? fullDoc.orderNumber.replace(/-/g, '_') : fullDoc._id;
                        const root = path.join(__dirname, '../../../../public');
                        const buyerName = sanitize(fullDoc.contact?.name || (fullDoc.user && fullDoc.user.name) || "Customer");
                        const buyerId = fullDoc.user ? (fullDoc.user._id || fullDoc.user) : "Guest";

                        const attachments = [];
                        const artworkImage = await resolveStoredPublicFileAsync(artwork.image, root);
                        const artworkImagePath = artworkImage?.filePath || '';
                        const artworkImageCid = artworkImagePath
                            ? `artwork-${String(orderIdentifier).replace(/[^a-zA-Z0-9_-]/g, '_')}@buddhist-art-mfu`
                            : '';

                        const html = approvedOrderMail({
                            buyerName: fullDoc.contact?.name || "Customer",
                            orderId: fullDoc.orderNumber || fullDoc._id,
                            artworkTitle,
                            price: artwork.price || 0,
                            artwork,
                            imageCid: artworkImageCid
                        });
                        
                        // 1. Certificate (from memory buffer)
                        attachments.push({
                            filename: `Certificate_${orderIdentifier}.pdf`,
                            content: pdfBuffer,
                            contentType: 'application/pdf'
                        });

                        // 2. Artwork image shown inside the certificate email body.
                        if (artworkImagePath) {
                            attachments.push({
                                filename: path.basename(artworkImagePath),
                                path: artworkImagePath,
                                cid: artworkImageCid,
                                contentDisposition: 'inline',
                                contentType: path.extname(artworkImagePath).toLowerCase() === '.png'
                                    ? 'image/png'
                                    : 'image/jpeg'
                            });
                        }

                        // 3. Invoice (from disk)
                        if (fullDoc.invoiceFile) {
                            const invoicePath = path.join(root, `account/User/${buyerId}_${buyerName}/Invoice/${fullDoc.invoiceFile}`);
                            if (fs.existsSync(invoicePath)) {
                                attachments.push({ filename: fullDoc.invoiceFile, path: invoicePath });
                            }
                        }

                        // 4. Slip/Bil (from disk)
                        let slipPath = "";
                        if (fullDoc.image) {
                            let cleanUrl = decodeURIComponent(fullDoc.image.replace(/^https?:\/\/[^/]+/, ""));
                            let slipRelPath = "";
                            if (cleanUrl.includes('/data/uploads/')) {
                                slipRelPath = path.join('data/uploads', cleanUrl.split('/data/uploads/')[1]);
                            } else if (cleanUrl.includes('/uploads/')) {
                                slipRelPath = cleanUrl.split('/uploads/')[1];
                            } else {
                                slipRelPath = cleanUrl.replace(/^\//, "");
                            }
                            slipPath = path.join(root, slipRelPath);
                        }
                        if (slipPath && fs.existsSync(slipPath) && fs.statSync(slipPath).isFile()) {
                            attachments.push({ 
                                filename: `Payment_Slip_${orderIdentifier}${path.extname(slipPath)}`, 
                                path: slipPath 
                            });
                        }

                        try {
                            await sendMail(buyerEmail, 'การชำระเงินได้รับการอนุมัติและเอกสารผลงาน - พุทธศิลปกรรม มฟล.', '', html, attachments);
                        } finally {
                            await artworkImage?.cleanup?.();
                        }
                    }
                    await Order.onUpdate(
                        { _id: doc._id },
                        { certificateStatus: 'Completed', certificateError: '' }
                    );
                } catch (certErr) {
                    console.error("Auto Certificate Generation or Email Failed:", certErr.message);
                    await Order.onUpdate(
                        { _id: doc._id },
                        { certificateStatus: 'Failed', certificateError: String(certErr.message || certErr) }
                    ).catch(statusErr => console.error('[Order] Could not record certificate failure:', statusErr));
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

                    await sendMail(buyerEmail, 'ข้อมูลอัปเดตคำสั่งซื้อ: โปรดอัปโหลดหลักฐานการชำระเงินใหม่ - พุทธศิลปกรรม มฟล.', '', html);
                }

                if (doc.artwork && doc.artwork.length > 0) {
                    const availableStatus = await StatusModel.findOne(queryForCode(STATUS_CODES.AVAILABLE)).lean();
                    const approvedStatus = await StatusModel.findOne(queryForCode(STATUS_CODES.APPROVED)).lean();

                    if (availableStatus && approvedStatus) {
                        for (let art of doc.artwork) {
                            const artworkState = await ArtworkModel.findById(art._id)
                                .select('postTermSale status.approval status.sale')
                                .lean();
                            const restoreSaleStatus = getEffectiveMode(artworkState?.postTermSale) === constants.MODES.DISPLAY
                                ? (workflowStatuses.Exhibition || availableStatus)
                                : availableStatus;
                            await Artwork.onUpdate(
                                { _id: new mongo.ObjectId(art._id), 'status.approval': workflowStatuses.Reserved?._id },
                                { 
                                    "status.sale": restoreSaleStatus._id,
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
            customerAddress: doc.address?.bill || doc.address?.shipping || "N/A",
            items: [],
            total: 0,
            accountName: "มหาวิทยาลัยแม่ฟ้าหลวง (กองทุนพุทธศิลปกรรมแห่งมหาวิทยาลัยแม่ฟ้าหลวง)",
            bankName: "ธนาคารกรุงเทพฯ สาขาแม่ฟ้าหลวงฯ",
            accountNo: "672-0-50576-4"
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
        response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.setHeader('Pragma', 'no-cache');
        response.setHeader('Expires', '0');
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
            await Order.onUpdate(
                { _id: doc._id },
                { certificateStatus: 'Completed', certificateError: '' }
            );
            response.setHeader('Content-Type', 'application/pdf');
            response.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            return response.send(pdfBuffer);
        } catch (genErr) {
            console.error('Certificate Generation Error:', genErr);
            await Order.onUpdate(
                { _id: doc._id },
                { certificateStatus: 'Failed', certificateError: String(genErr.message || genErr) }
            ).catch(statusErr => console.error('[Order] Could not record certificate failure:', statusErr));
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
        const artworkImage = await resolveStoredPublicFileAsync(art.image, root);
        const artworkLocalPath = artworkImage?.filePath || '';

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
            artistNameEN: getVal(art.artist?.name, 'en'),
            year: new Date(art.createdAt || Date.now()).getFullYear().toString(),
            artworkNameTH: getVal(art.title, 'th'),
            artworkNameEN: getVal(art.title, 'en'),
            size: getVal(art.size, 'en') || getVal(art.size, 'th') || "N/A",
            technique: getVal(art.technique, 'th') || getVal(art.technique, 'en') || "N/A",
            techniqueEN: getVal(art.technique, 'en'),
            techniqueTH: getVal(art.technique, 'th'),
            price: `${(art.price || 0).toLocaleString()} THB`,
            description: getVal(art.description, 'th') || getVal(art.description, 'en') || "",
            artworkCode: art.artworkCode
        };

        try {
            // 3. Generate the same Certificate of Authenticity layout used in the email.
            const certBytes = await PdfService.generateCertificateOfAuthenticity({
                artworkPath: artworkLocalPath,
                info
            });

            // 4. Add to Merged PDF
            const certDoc = await PDFDocument.load(certBytes);
            const copiedPages = await mergedPdf.copyPages(certDoc, certDoc.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        } finally {
            await artworkImage?.cleanup?.();
        }
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

function resolveStoredPublicFile(image, root) {
    if (!image) return "";

    const driveRelativePath = mfuDrive.relativePathFromStoredUrl(image);
    if (driveRelativePath) {
        const driveLocalPath = path.resolve(root, driveRelativePath);
        const driveRoot = path.resolve(root);
        const driveRootPrefix = `${driveRoot}${path.sep}`;
        if (driveLocalPath.startsWith(driveRootPrefix)
            && fs.existsSync(driveLocalPath)
            && fs.statSync(driveLocalPath).isFile()) {
            return driveLocalPath;
        }
    }

    let cleanUrl;
    try {
        cleanUrl = decodeURIComponent(String(image).replace(/^https?:\/\/[^/]+/, ""));
    } catch (error) {
        return "";
    }

    let relativePath;
    if (cleanUrl.includes('/data/uploads/')) {
        relativePath = path.join('data/uploads', cleanUrl.split('/data/uploads/')[1]);
    } else if (cleanUrl.includes('/uploads/')) {
        relativePath = cleanUrl.split('/uploads/')[1];
    } else {
        relativePath = cleanUrl.replace(/^[/\\]+/, "");
    }

    const resolvedRoot = path.resolve(root);
    const resolvedPath = path.resolve(resolvedRoot, relativePath);
    const rootPrefix = `${resolvedRoot}${path.sep}`;

    // Keep email attachments inside backend/public even if a stored URL is malformed.
    if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(rootPrefix)) return "";

    try {
        return fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile() ? resolvedPath : "";
    } catch (error) {
        return "";
    }
}

async function resolveStoredPublicFileAsync(image, root) {
    const localPath = resolveStoredPublicFile(image, root);
    if (localPath) return { filePath: localPath, cleanup: async () => undefined };

    if (!mfuDrive.isEnabled()) return null;
    const relativePath = mfuDrive.relativePathFromStoredUrl(image);
    if (!relativePath) return null;

    try {
        const materialized = await mfuDrive.materializeToTemp(relativePath);
        return { filePath: materialized.filePath, cleanup: materialized.cleanup };
    } catch (error) {
        console.warn(`[MFU Drive] Could not materialize ${relativePath}: ${error.message}`);
        return null;
    }
}
