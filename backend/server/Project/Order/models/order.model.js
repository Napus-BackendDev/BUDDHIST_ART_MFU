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
    status: { type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status', default: "689c04cb255db4e56aea88ef" },
}, { timestamps: true });

module.exports = mongoose.model('Order', objsSchema, 'Order');