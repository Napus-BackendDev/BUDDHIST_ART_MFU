const instance = require('axios');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../../server/Project/User/models/user.model');
const Role = require('../../server/Project/Settings/models/role.model');
const Status = require('../../server/Project/Settings/models/status.model');
const ResMessage = require('../../server/Project/Settings/service/message');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, given_name } = payload;

        if (!email) {
            return response.status(400).json({ message: "Google account does not have an email" });
        }

        // 2. Find user in database by studentEmail OR personalEmail
        let user = await User.findOne({ 
            $or: [
                { "contact.studentEmail": email },
                { "contact.personalEmail": email }
            ]
        }).populate('role');

        // 3. If user NOT found, Register them as a new Customer
        if (!user) {
            console.log(`Registering new user: ${email}`);
            
            // Find "Customer" Role
            const customerRole = await Role.findOne({ "title.value": "Customer" });
            if (!customerRole) {
                throw new Error("Default 'Customer' role not found in database. Please run seed:role.");
            }

            // Find "NewStudent" Status (Optional default)
            const newStatus = await Status.findOne({ "title.value": "NewStudent" });

            // Extract studentId from email if it's an MFU email, otherwise use a timestamp
            const isMfuEmail = email.endsWith('@lamduan.mfu.ac.th');
            const studentId = isMfuEmail ? email.split('@')[0] : `G-${Date.now().toString().slice(-8)}`;

            // Create new user
            user = await User.create({
                studentId: studentId,
                image: picture,
                name: [
                    { key: 'en', value: name || given_name },
                    { key: 'th', value: name || given_name }
                ],
                role: customerRole._id,
                status: newStatus ? newStatus._id : null,
                contact: {
                    studentEmail: isMfuEmail ? email : null,
                    personalEmail: !isMfuEmail ? email : null
                }
            });

            // Populate role for the response
            user = await User.findById(user._id).populate('role');
        }

        // 4. Prepare Role Name for JWT and Frontend
        let roleName = 'Customer';
        if (user.role && user.role.title) {
            const roleObj = user.role.title.find(t => t.key === 'en');
            if (roleObj) roleName = roleObj.value;
        } else if (user.role && typeof user.role === 'string') {
            roleName = user.role;
        }

        // 5. Generate a SECURE JWT
        const systemToken = jwt.sign(
            { 
                userId: user._id, 
                role: roleName,
                email: email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const userData = JSON.parse(JSON.stringify(user));
        userData.role = roleName;
        userData.token = systemToken; // Real JWT!
        
        return ResMessage.sendResponse(response, 0, 20000, userData);

    } catch (err) {
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
