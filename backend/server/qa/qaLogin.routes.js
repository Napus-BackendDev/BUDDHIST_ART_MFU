// Local QA login: signs in seeded *@local.test accounts without Google so UI workflows can be tested per role.
// Mounted only when every guard passes; production and shared databases never expose it.
const express = require('express');
const User = require('../Project/User/models/user.model');
const { issueSession } = require('../../helpers/google/oAuth2');

const QA_EMAIL = /^qa-[a-z0-9-]+@local\.test$/;
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

exports.isEnabled = (env = process.env) =>
    env.NODE_ENV === 'development' &&
    env.QA_LOCAL_LOGIN === 'true' &&
    /^mongodb:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(env.MONGODB || '');

exports.router = express.Router().post('/login', async (request, response) => {
    if (!LOOPBACK.has(request.socket.remoteAddress)) return response.status(404).end();
    const email = String((request.body && request.body.email) || '').toLowerCase();
    if (!QA_EMAIL.test(email)) return response.status(400).json({ message: 'QA account email required' });
    const user = await User.findOne({ 'contact.personalEmail': email }).populate('role');
    if (!user) return response.status(404).json({ message: 'QA account not seeded' });
    return issueSession(user, email, response);
});
