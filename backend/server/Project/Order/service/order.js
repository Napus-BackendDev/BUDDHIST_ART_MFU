const mongo = require('mongodb');
const Order = require('../controller/order');
const Artwork = require('../../Artwork/controller/artwork');
const Status = require('../../Settings/controller/status');
const ResMessage = require("../../Settings/service/message");
const { sendMail } = require("../../../../helpers/google/Mail");
const { confirmationOrderMail } = require("../../Mail/template");
const { generateCertificate } = require('../../../../helpers/document/composite');
const { getLangValue } = require('../../../../helpers/language');
const fs = require('fs');

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

        // Prepare email data
        const buyerName = doc.contact?.name || "Customer";
        const to = doc.contact?.email;
        const orderId = doc._id;
        let artworkTitle = "";
        let price = 0;
        let orderDate = doc.createdAt ? new Date(doc.createdAt).toLocaleString() : new Date().toLocaleString();

        // If artwork is populated and available
        if (doc.artwork && doc.artwork.length > 0) {
            let artworkObj = doc.artwork[0];
            if (artworkObj.title && Array.isArray(artworkObj.title)) {
                artworkTitle = getLangValue(artworkObj.title, 'en') || "Artwork";
            } else if (artworkObj.title) {
                artworkTitle = artworkObj.title;
            }
            price = artworkObj.price || 0;
        }

        // Send confirmation email if email exists
        if (to) {
            const html = confirmationOrderMail({
                buyerName,
                orderId,
                artworkTitle,
                price,
                orderDate
            });
            sendMail(to, 'Order Confirmation - Buddhist Art MFU', '', html);
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
        const imagePath = `${request.protocol}://${request.get('host')}/uploads/order/${request.file.filename}`;

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

exports.onGeneratePDF = async function (request, response) {
    const { artworkPath, artwork_id, order_id } = request.body;
    try {
        // Query artwork by ID
        const artwork = await Artwork.onQuery({ _id: new mongo.ObjectId(artwork_id) });
        
        if (!artwork) {
            return ResMessage.sendResponse(response, 0, 40404, "Artwork not found");
        }

        // Build info from artwork
        const info = {
            artistName: (artwork.artist && (Array.isArray(artwork.artist.name) ? (artwork.artist.name.find(n => n.key === 'en')?.value || artwork.artist.name[0]?.value) : artwork.artist.name)) || 'Unknown Artist',
            year: artwork.createdAt ? new Date(artwork.createdAt).getFullYear().toString() : '',
            artworkNameTH: getLangValue(artwork.title, 'th') || '',
            artworkNameEN: getLangValue(artwork.title, 'en') || '',
            size: getLangValue(artwork.size, 'en') || '',
            technique: getLangValue(artwork.technique, 'en') || '',
            price: artwork.price || '',
            description: getLangValue(artwork.description, 'en') || ''
        };  

        console.log("Info for PDF generation:", info);
        console.log("Artwork path for PDF generation:", artworkPath);

        const path = require('path');
        let localArtworkPath = artworkPath;
        // Convert HTTP URL from frontend to local absolute path
        try {
            let p = artworkPath;
            if (artworkPath.startsWith('http')) {
                p = new URL(artworkPath).pathname;
            }
            // If the path uses the /uploads alias, map it to the actual /data/uploads directory
            if (p.startsWith('/uploads/')) {
                p = '/data' + p;
            }
            if (p.startsWith('/')) {
                localArtworkPath = path.join(__dirname, '../../../../public', p);
            }
        } catch (e) {
            console.error("Path parsing error:", e);
        }
        const outputDir = path.join(__dirname, '../../../../public/certificates');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const filename = `certificate-${order_id}-${artwork_id}-${Date.now()}.pdf`;
        const outputPath = path.join(outputDir, filename);

        // Signatures and outputPath left null/empty per user request
        const docBuffer = await generateCertificate({
            artworkPath: localArtworkPath,
            signature1Path: null,
            signature2Path: null,
            info,
            outputPath: null
        });
        fs.writeFileSync(outputPath, docBuffer);
        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return response.send(docBuffer);
    } catch (err) {
        console.error('Certificate Generation Error:', err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};
