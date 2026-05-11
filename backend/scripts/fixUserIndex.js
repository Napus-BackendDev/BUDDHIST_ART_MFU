const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.dev') });

async function fixIndex() {
    try {
        const mongoURI = process.env.MONGODB;
        if (!mongoURI) throw new Error('MONGODB URI not found');

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        
        const User = mongoose.connection.collection('User');
        
        console.log('Dropping index: contact.studentEmail_1...');
        try {
            await User.dropIndex('contact.studentEmail_1');
            console.log('Successfully dropped the index!');
        } catch (e) {
            console.log('Index might not exist or already dropped:', e.message);
        }

        console.log('Index fix complete. Please restart your server.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixIndex();
