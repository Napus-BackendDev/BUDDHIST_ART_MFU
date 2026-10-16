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
        let payload;
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch (verifyError) {
            // Local development and test environments can validate decoded token if ALLOW_UNVERIFIED_GOOGLE_DEV is enabled.
            // Never enable this fallback in production: signature verification remains mandatory there.
            const allowDevFallback = (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') && process.env.ALLOW_UNVERIFIED_GOOGLE_DEV === 'true';
            if (!allowDevFallback) throw verifyError;

            const decoded = jwt.decode(token);
            const now = Math.floor(Date.now() / 1000);
            const audience = Array.isArray(decoded?.aud) ? decoded.aud : [decoded?.aud];
            if (!decoded || !audience.includes(process.env.GOOGLE_CLIENT_ID) ||
                !['accounts.google.com', 'https://accounts.google.com'].includes(decoded.iss) ||
                !decoded.exp || decoded.exp <= now) {
                throw verifyError;
            }
            console.warn('Google certificate unavailable; using development-only validated payload fallback.');
            payload = decoded;
        }
        const { email, name, picture, given_name } = payload;

        if (!email) {
            return response.status(400).json({ message: "Google account does not have an email" });
        }

        const trimmedEmail = email.trim();
        const escapedEmail = trimmedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const emailRegex = new RegExp(`^${escapedEmail}$`, 'i');
        const isMfuEmail = trimmedEmail.toLowerCase().endsWith('@lamduan.mfu.ac.th');
        const mfuStudentId = isMfuEmail ? trimmedEmail.split('@')[0] : null;

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
            if (needsSave) {
                await user.save();
            }
        }

        // 3. If user NOT found, Register them as a new Customer
        if (!user) {
            console.log(`Registering new user: ${trimmedEmail}`);
            
            // Find "Customer" Role
            const customerRole = await Role.findOne({ "title.value": "Customer" });
            console.log("Customer Role found:", customerRole ? customerRole._id : "NOT FOUND");
            if (!customerRole) {
                throw new Error("Default 'Customer' role not found in database. Please run seed:role.");
            }

            // Find "NewStudent" Status (Optional default)
            const newStatus = await Status.findOne({ "title.value": "NewStudent" });

            const studentId = mfuStudentId || `G-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;

            // Create new user
            console.log("Creating user with data:", JSON.stringify({ studentId, role: customerRole._id }, null, 2));
            user = await User.create({
                studentId: studentId,
                image: picture || null,
                name: [
                    { key: 'en', value: name || given_name || 'User' },
                    { key: 'th', value: name || given_name || 'User' }
                ],
                role: customerRole._id,
                status: newStatus ? newStatus._id : null,
                contact: {
                    ...(isMfuEmail ? { studentEmail: trimmedEmail } : { personalEmail: trimmedEmail })
                }
            });
            console.log("User created successfully:", user._id);

            // Populate role for the response
            user = await User.findById(user._id).populate('role');
        }

        // 4. Prepare Role Name for JWT and Frontend
        let roleName = 'Customer';
        if (user.role && Array.isArray(user.role.title)) {
            const roleObj = user.role.title.find(t => t.key === 'en');
            if (roleObj && roleObj.value) roleName = roleObj.value;
        } else if (user.role && user.role._id) {
            if (Array.isArray(user.role.title)) {
                const roleObj = user.role.title.find(t => t.key === 'en');
                if (roleObj && roleObj.value) roleName = roleObj.value;
            }
        } else if (user.role) {
            const roleDoc = await Role.findById(user.role);
            if (roleDoc && Array.isArray(roleDoc.title)) {
                const roleObj = roleDoc.title.find(t => t.key === 'en');
                if (roleObj && roleObj.value) roleName = roleObj.value;
            }
        }

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
        userData.token = systemToken; // Real JWT!
        delete userData.password;
        
        return ResMessage.sendResponse(response, 0, 20000, userData);

    } catch (err) {
        console.error("Google Auth Error:", err);
        if (err.response) console.error("Response Data:", err.response.data);
        
        return response.status(401).json({ 
            message: "Google Authentication failed", 
            error: err.message 
        });
    }
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
