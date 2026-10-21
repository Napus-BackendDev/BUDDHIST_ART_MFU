'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    image: { type: String, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    contact: {
        name: { type: String, default: null },
        telephone: { type: String, default: null },
        email: { type: String, default: null },
    },
    address: {
        bill: { type: String, default: null },
        shipping: { type: String, default: null },
    },
    carrier: { type: String, default: "Thailand Post" },
    trackingId: { type: String, default: "" },
    deliveryDate: { type: Date, default: null },
    artwork: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork', default: null }],
    amounts: { type: new Schema({
        subtotal: { type: Number, required: true, min: 0 },
        shipping: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 },
        items: [{ artwork: { type: Schema.Types.ObjectId, ref: 'Artwork' }, price: { type: Number, min: 0 } }]
    }, { _id: false }), default: null },
    artworkReferences: [{
        artwork: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork', required: true },
        artworkCode: { type: String, required: true, index: true }
    }],
    status: { type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status', default: "689c04cb255db4e56aea88ef" },
    invoiceFile: { type: String, default: "" },
    invoiceStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    invoiceError: { type: String, default: "" },
    mailStatus: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Skipped'], default: 'Pending' },
    mailError: { type: String, default: "" },
    certificateStatus: { type: String, enum: ['NotRequired', 'Pending', 'Completed', 'Failed'], default: 'NotRequired' },
    certificateError: { type: String, default: "" },
    orderNumber: { type: String, default: null },
    remark: { type: String, default: "" },
}, { timestamps: true });

objsSchema.index(
    { orderNumber: 1 },
    { unique: true, partialFilterExpression: { orderNumber: { $gt: '' } } }
);

module.exports = mongoose.model('Order', objsSchema, 'Order');
