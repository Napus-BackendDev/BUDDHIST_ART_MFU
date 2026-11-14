const instance = require('axios');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../../server/Project/User/models/user.model');
const Role = require('../../server/Project/Settings/models/role.model');
const Status = require('../../server/Project/Settings/models/status.model');
const ResMessage = require('../../server/Project/Settings/service/message');

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_SECRET,
    process.env.REDIRECT_URL || undefined
);

if (!process.env.GOOGLE_CLIENT_ID) {
    console.error("FATAL ERROR: GOOGLE_CLIENT_ID is not defined in environment variables!");
}

const googleMapsAPI = instance.create({
    baseURL: 'https://maps.googleapis.com',
    headers: { 'Content-Type': 'application/json' }
});

const DEFAULT_ADMIN_EMAILS = [
    'sattawat.nor@mfu.ac.th',
    'buddhistart@mfu.ac.th',
    'napus.sam@gmail.com'
];

function getAdminEmails() {
    const envEmails = process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
        : [];
    return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...envEmails]));
}

exports.DEFAULT_ADMIN_EMAILS = DEFAULT_ADMIN_EMAILS;
exports.getAdminEmails = getAdminEmails;


/**
 * Handles Google Authentication & Automatic Registration (Production Ready)
 * 1. Verifies ID Token with Google's library
 * 2. Finds user in local database by email (Student or Personal)
 * 3. If not found, creates a new user with 'Customer' role
 * 4. Generates a secure JWT for the session
 */
exports.onQuery = async function (request, response, next) {
    try {
        const { token } = request.body; // This is now the ID Token
        
        if (!token) {
            return response.status(400).json({ message: "ID Token is required" });
        }

        // 1. Verify ID Token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, given_name } = payload;

        if (!email) {
            return response.status(400).json({ message: "Google account does not have an email" });
        }


        const trimmedEmail = email.trim();
        const escapedEmail = trimmedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const emailRegex = new RegExp(`^${escapedEmail}$`, 'i');
        const isMfuEmail = trimmedEmail.toLowerCase().endsWith('@lamduan.mfu.ac.th');
        const mfuStudentId = isMfuEmail ? trimmedEmail.split('@')[0] : null;

        const adminEmails = getAdminEmails();
        const isAdminEmail = adminEmails.includes(trimmedEmail.toLowerCase());

        // 2. Find user in database by studentEmail, personalEmail, or studentId
        const queryConditions = [
            { "contact.studentEmail": { $regex: emailRegex } },
            { "contact.personalEmail": { $regex: emailRegex } }
        ];
        if (mfuStudentId) {
            queryConditions.push({ studentId: mfuStudentId });
        }

        let user = await User.findOne({ $or: queryConditions }).populate('role');

        if (user) {
            let needsSave = false;
            if (isMfuEmail && !user.contact?.studentEmail) {
                user.contact = user.contact || {};
                user.contact.studentEmail = trimmedEmail;
                needsSave = true;
            }
            if (picture && !user.image) {
                user.image = picture;
                needsSave = true;
            }
            // Elevate to Admin if email is in designated admin list
            if (isAdminEmail) {
                const adminRole = await Role.findOne({ "title.value": "Admin" });
                if (adminRole && String(user.role?._id || user.role) !== String(adminRole._id)) {
                    console.log(`Elevating user ${trimmedEmail} to Admin role`);
                    user.role = adminRole._id;
                    needsSave = true;
                }
            }
            if (needsSave) {
                await user.save();
                user = await User.findById(user._id).populate('role');
            }
        }

        // 3. If user NOT found, Register them as a new Customer or Admin
        if (!user) {
            console.log(`Registering new user: ${trimmedEmail}`);
            
            // Determine role: Admin if in adminEmails, else Customer
            let targetRole;
            if (isAdminEmail) {
                targetRole = await Role.findOne({ "title.value": "Admin" });
                console.log("Assigning Admin role to designated email:", trimmedEmail);
            }
            if (!targetRole) {
                targetRole = await Role.findOne({ "title.value": "Customer" });
            }
            if (!targetRole) {
                throw new Error("Default role not found in database. Please run seed:role.");
            }

            // Find "NewStudent" Status (Optional default)
            const newStatus = await Status.findOne({ "title.value": "NewStudent" });

            const studentId = mfuStudentId || `G-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;

            // Create new user
            console.log("Creating user with data:", JSON.stringify({ studentId, role: targetRole._id }, null, 2));
            user = await User.create({
                studentId: studentId,
                image: picture || null,
                name: [
                    { key: 'en', value: name || given_name || 'User' },
                    { key: 'th', value: name || given_name || 'User' }
                ],
                role: targetRole._id,
                status: newStatus ? newStatus._id : null,
                contact: {
                    ...(isMfuEmail ? { studentEmail: trimmedEmail } : { personalEmail: trimmedEmail })
                }
            });
            console.log("User created successfully:", user._id);

            // Populate role for the response
            user = await User.findById(user._id).populate('role');
        }

        return await exports.issueSession(user, trimmedEmail, response);

    } catch (err) {
        console.error("Google Auth Error:", err);
        if (err.response) console.error("Response Data:", err.response.data);

        return response.status(401).json({
            message: "Google Authentication failed",
            error: err.message
        });
    }
};

// Shared by Google sign-in and the guarded local QA login (server/qa/qaLogin.routes.js).
exports.issueSession = async function (user, email, response) {
        const trimmedEmail = String(email || '').trim();
        const { normalizePermissions, extractEnglishRoleTitle } = require('../rolePermissions');

        // 4. Prepare Role Name & Permissions for JWT and Frontend
        let roleName = 'Customer';
        let roleDoc = null;
        if (user.role && Array.isArray(user.role.title)) {
            roleDoc = user.role;
            roleName = extractEnglishRoleTitle(roleDoc) || 'Customer';
        } else if (user.role) {
            roleDoc = await Role.findById(user.role).lean();
            roleName = extractEnglishRoleTitle(roleDoc) || 'Customer';
        }

        const permissions = normalizePermissions(roleDoc && roleDoc.permissions, roleName);

        // 5. Generate a SECURE JWT
        const systemToken = jwt.sign(
            { 
                userId: user._id, 
                role: roleName,
                email: trimmedEmail 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const userData = JSON.parse(JSON.stringify(user));
        userData.role = roleName;
        userData.permissions = permissions;
        userData.token = systemToken; // Real JWT!
        delete userData.password;
        
        return ResMessage.sendResponse(response, 0, 20000, userData);
};

exports.onDistance = async function (request, response, next) {
    const { origin, destinations, apiKey, language } = request.body;

    if (!origin || !destinations || !Array.isArray(destinations) || destinations.length === 0 || !apiKey) {
        return response.status(400).json({ error: "Missing origin, destinations, or apiKey" });
    }

    try {
        const destinationStr = destinations.map(d => `${d.lat},${d.lng}`).join('|');
        const originStr = `${origin.lat},${origin.lng}`;

        const config = {
            params: {
                origins: originStr,
                destinations: destinationStr,
                key: apiKey,
                language: language || 'en'
            }
        };

        const res = await googleMapsAPI.get('/maps/api/distancematrix/json', config);
        
        const result = res.data.rows[0].elements.map((element, index) => ({
            from: res.data.origin_addresses[0],
            to: res.data.destination_addresses[index],
            distance: element.distance?.text || 'N/A',
            duration: element.duration?.text || 'N/A',
            status: element.status
        }));

        return response.status(200).json({ origin: res.data.origin_addresses[0], results: result });

    } catch (err) {
        console.error("Distance error message:", err.message);
        response.status(500).json({ error: "Failed to fetch distance", details: err.message });
    }
};
