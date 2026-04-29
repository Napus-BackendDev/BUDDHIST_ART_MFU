const instance = require('axios');
const User = require('../../server/Project/User/models/user.model');
const ResMessage = require('../../server/Project/Settings/service/message');

const googleAuthAPI = instance.create({
    baseURL: 'https://www.googleapis.com',
    headers: { 'Content-Type': 'application/json' }
});

const googleMapsAPI = instance.create({
    baseURL: 'https://maps.googleapis.com',
    headers: { 'Content-Type': 'application/json' }
});

/**
 * Handles Google Authentication
 * 1. Verifies token with Google
 * 2. Finds user in local database by email
 * 3. Returns user data with system token
 */
exports.onQuery = async function (request, response, next) {
    try {
        const { token } = request.body;
        
        if (!token) {
            return response.status(400).json({ message: "Token is required" });
        }

        const config = {
            params: {
                alt: "json",
                access_token: token
            }
        };

        // 1. Get user info from Google
        const googleRes = await googleAuthAPI.get("/oauth2/v3/userinfo", config);
        const googleUser = googleRes.data;

        if (!googleUser.email) {
            return response.status(400).json({ message: "Google account does not have an email" });
        }

        // 2. Find user in database by studentEmail
        const user = await User.findOne({ "contact.studentEmail": googleUser.email }).populate('role');

        if (!user) {
            console.warn(`User with email ${googleUser.email} not found.`);
            return response.status(404).json({ 
                code: 40400, 
                message: "This Google account is not registered in our system.",
                email: googleUser.email 
            });
        }

        // 3. Prepare User Data (Consistent with user.service.js)
        let roleName = 'Customer';
        if (user.role && user.role.title) {
            const roleObj = user.role.title.find(t => t.key === 'en');
            if (roleObj) roleName = roleObj.value;
        } else if (user.role && typeof user.role === 'string') {
            roleName = user.role;
        }

        const userData = JSON.parse(JSON.stringify(user));
        userData.role = roleName;
        // Using your system's dummy token for consistency
        userData.token = "1a661eec9bf358b8567c3dc022146d19c69d2ceafe92f503e89391e5d9f9f739";

        console.log("Google Login Success for:", googleUser.email);
        
        return ResMessage.sendResponse(response, 0, 20000, userData);

    } catch (err) {
        console.error("Google Auth Error:", err.response?.data || err.message);
        return response.status(401).json({ 
            message: "Google Authentication failed", 
            error: err.response?.data || err.message 
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
