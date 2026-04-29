const mongo = require('mongodb');
const Order = require('../controller/order');
const Artwork = require('../../Artwork/controller/artwork');
const Status = require('../../Settings/controller/status');
const ResMessage = require("../../Settings/service/message");
const { sendMail } = require("../../../../helpers/google/Mail");
const { confirmationOrderMail } = require("../../Mail");

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
                artworkTitle = artworkObj.title[0]?.value || "Artwork";
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
