const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' }); // Load env variables if needed
const User = require('./server/Project/User/models/user.model.js');
const { createBaseService } = require('./helpers/base.service') || {};

// Since we just want to test what User.onQuerys returns
async function testLogin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/Buddhist', { useNewUrlParser: true, useUnifiedTopology: true });
        
        // We will just do a direct find to see what the document looks like
        const users = await User.find({ studentId: 'xxx', password: '123' }).populate('role status').lean();
        
        console.log("Found users length:", users.length);
        if (users.length > 0) {
            console.log("User 0 directly from DB (lean):", JSON.stringify(users[0], null, 2));
            console.log("Type of _id:", typeof users[0]._id, "Value:", users[0]._id);
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testLogin();
