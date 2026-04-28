const instance = require('axios');

instance.defaults.baseURL = 'https://www.googleapis.com';

instance.defaults.headers = {
    "Content-Type": "application/json"
}


const googleAuthAPI = instance.create({
    baseURL: 'https://www.googleapis.com',
    headers: { 'Content-Type': 'application/json' }
});

const googleMapsAPI = instance.create({
    baseURL: 'https://maps.googleapis.com',
    headers: { 'Content-Type': 'application/json' }
});

const User = require('../../server/Project/User/models/user.model');

exports.onQuery = async function (request, response, next) {
    try {
        const config = {
            params: {
                alt: "json",
                access_token: request.body.token
            }
        };

        const googleRes = await googleAuthAPI.get("/oauth2/v3/userinfo", config);
        const googleUser = googleRes.data;

        if (!googleUser.email) {
            return response.status(401).json({ 
                code: 40100, 
                error: "Google email not found" 
            });
        }

        // Find user in our database by studentEmail
        // We use populate('role') to get role details
        const user = await User.findOne({ 
            "contact.studentEmail": googleUser.email 
        }).populate('role');

        if (!user) {
            console.warn(`User with email ${googleUser.email} not found in database.`);
            return response.status(404).json({
                code: 40400,
                error: "User not registered in the system",
                email: googleUser.email
            });
        }

        // Replicate logic from onSignIn to extract role and token
        let roleName = 'Customer';
        if (user.role && user.role.title) {
            const roleObj = user.role.title.find(t => t.key === 'en');
            if (roleObj) roleName = roleObj.value;
        } else if (user.role && typeof user.role === 'string') {
            roleName = user.role;
        }

        const userData = JSON.parse(JSON.stringify(user));
        userData.role = roleName;
        userData.token = "1a661eec9bf358b8567c3dc022146d19c69d2ceafe92f503e89391e5d9f9f739"; // Using the same dummy token as onSignIn

        return response.status(200).json({
            code: 20000,
            data: userData
        });

    } catch (err) {
        console.error("Google OAuth Error:", err.response?.data || err.message);
        return response.status(401).json({ 
            code: 40100, 
            error: "Google Authentication Failed",
            message: err.response?.data?.error_description || err.message 
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
                language: language || 'en'   // กำหนดค่า default เป็นอังกฤษ
            }
        };

        const res = await googleMapsAPI.get('/maps/api/distancematrix/json', config);

        console.log('Google Response:', res.data); // <-- เพิ่มบรรทัดนี้

        const result = res.data.rows[0].elements.map((element, index) => ({
            from: res.data.origin_addresses[0],
            to: res.data.destination_addresses[index],
            distance: element.distance?.text || 'N/A',
            duration: element.duration?.text || 'N/A',
            status: element.status
        }));

        // response.json({ origin: res.data.origin_addresses[0], results: result });

        return response.status(200).json({ origin: res.data.origin_addresses[0], results: result });

    } catch (err) {
        // ลองดูข้อมูล error ให้ละเอียด
        console.error("Distance error message:", err.message);
        if (err.response) {
            console.error("Status code:", err.response.status);
            console.error("Response data:", err.response.data);
        } else {
            console.error("No response from API.");
        }
        response.status(500).json({ error: "Failed to fetch distance", details: err.message });
    }
};

