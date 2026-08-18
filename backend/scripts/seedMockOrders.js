'use strict';

const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.join(__dirname, '../.env.dev') });

const User = require('../server/Project/User/models/user.model');
const Order = require('../server/Project/Order/models/order.model');
const Artwork = require('../server/Project/Artwork/models/artwork.model');
const Status = require('../server/Project/Settings/models/status.model');

const CUSTOMER_EMAIL = 'napus.sam@gmail.com';
const MOCK_ORDER_NUMBERS = ['MOCK-UI-01', 'MOCK-UI-02', 'MOCK-UI-03'];
const MOCK_REMARK_PREFIX = 'MOCK_UI_ORDER';

function getLocalizedValue(values, preferredKey) {
    if (!Array.isArray(values)) return '';
    return values.find(item => item.key === preferredKey)?.value
        || values.find(item => item.key === 'en')?.value
        || values[0]?.value
        || '';
}

async function findStatus(title) {
    const status = await Status.findOne({
        title: { $elemMatch: { key: 'en', value: title } }
    });

    if (!status) {
        throw new Error(`Required status not found: ${title}`);
    }

    return status;
}

async function upsertMockOrder(orderData) {
    let order = await Order.findOne({ orderNumber: orderData.orderNumber });
    const wasCreated = !order;

    if (order) {
        Object.assign(order, orderData);
        order.createdAt = orderData.createdAt;
        await order.save();
    } else {
        order = await Order.create(orderData);
    }

    return { order, wasCreated };
}

async function seedMockOrders() {
    const mongoURI = process.env.MONGODB;
    if (!mongoURI) {
        throw new Error('MONGODB URI not found in backend/.env.dev');
    }

    await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    });

    const customer = await User.findOne({
        $or: [
            { 'contact.studentEmail': CUSTOMER_EMAIL },
            { 'contact.personalEmail': CUSTOMER_EMAIL }
        ]
    }).lean();

    if (!customer) {
        throw new Error(`Customer not found for email: ${CUSTOMER_EMAIL}`);
    }

    const [reservedStatus, pendingStatus, approvedStatus] = await Promise.all([
        findStatus('Reserved'),
        findStatus('Pending'),
        findStatus('Approved')
    ]);

    const artworks = await Artwork.find({ image: { $nin: [null, ''] } })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

    const contactName = getLocalizedValue(customer.name, 'th')
        || getLocalizedValue(customer.name, 'en')
        || CUSTOMER_EMAIL;
    const contact = {
        name: contactName,
        telephone: customer.contact?.telephone || '',
        email: CUSTOMER_EMAIL
    };
    const address = {
        bill: customer.address?.bill || 'Mock billing address',
        shipping: customer.address?.shipping || 'Mock shipping address'
    };
    const now = Date.now();

    const definitions = [
        {
            orderNumber: MOCK_ORDER_NUMBERS[0],
            status: reservedStatus._id,
            image: '',
            createdAt: new Date(now - (2 * 60 * 60 * 1000)),
            remark: `${MOCK_REMARK_PREFIX}: pending-payment`
        },
        {
            orderNumber: MOCK_ORDER_NUMBERS[1],
            status: pendingStatus._id,
            image: '/uploads/mock/payment-slip-pending.png',
            createdAt: new Date(now - (90 * 60 * 1000)),
            remark: `${MOCK_REMARK_PREFIX}: pending-verification`
        },
        {
            orderNumber: MOCK_ORDER_NUMBERS[2],
            status: approvedStatus._id,
            image: '/uploads/mock/payment-slip-approved.png',
            trackingId: 'TH-MOCK-UI-003',
            deliveryDate: new Date(now + (7 * 24 * 60 * 60 * 1000)),
            createdAt: new Date(now - (45 * 60 * 1000)),
            remark: `${MOCK_REMARK_PREFIX}: approved`
        }
    ];

    const seeded = [];

    for (let index = 0; index < definitions.length; index += 1) {
        const definition = definitions[index];
        const artwork = artworks.length > 0 ? artworks[index % artworks.length] : null;
        const artworkIds = artwork ? [artwork._id] : [];
        const artworkReferences = artwork ? [{
            artwork: artwork._id,
            artworkCode: artwork.artworkCode || `MOCK-ART-${String(index + 1).padStart(3, '0')}`
        }] : [];

        const result = await upsertMockOrder({
            ...definition,
            user: customer._id,
            contact,
            address,
            carrier: 'Thailand Post',
            trackingId: definition.trackingId || '',
            deliveryDate: definition.deliveryDate || null,
            artwork: artworkIds,
            artworkReferences,
            invoiceFile: ''
        });

        seeded.push({
            orderNumber: result.order.orderNumber,
            status: getLocalizedValue(
                index === 0 ? reservedStatus.title : index === 1 ? pendingStatus.title : approvedStatus.title,
                'en'
            ),
            artwork: artwork ? getLocalizedValue(artwork.title, 'en') : 'none',
            action: result.wasCreated ? 'created' : 'updated'
        });
    }

    console.log(`Mock orders ready for ${CUSTOMER_EMAIL} (${customer._id})`);
    seeded.forEach(item => {
        console.log(`${item.action}: ${item.orderNumber} | ${item.status} | artwork: ${item.artwork}`);
    });
}

seedMockOrders()
    .catch(error => {
        console.error('Mock order seed failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
