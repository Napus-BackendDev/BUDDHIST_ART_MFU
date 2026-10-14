'use strict';

const mongoose = require('mongoose');
const User = require('../server/Project/User/models/user.model');
const Role = require('../server/Project/Settings/models/role.model');

const option = (name) => {
    const index = process.argv.indexOf(name);
    return index === -1 ? null : process.argv[index + 1];
};

const help = () => {
    console.log('Usage: node checkAdminUser.js --student-id <id> --email <email>');
};

async function main() {
    if (process.argv.includes('--help')) {
        help();
        return;
    }

    const studentId = option('--student-id');
    const email = option('--email');
    if (!studentId || !email) {
        throw new Error('Both --student-id and --email are required');
    }
    if (!process.env.MONGODB) {
        throw new Error('MONGODB environment variable is missing');
    }

    await mongoose.connect(process.env.MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000
    });

    try {
        const user = await User.findOne({
            $or: [
                { studentId },
                { 'contact.studentEmail': email },
                { 'contact.personalEmail': email }
            ]
        }).select('+password').populate('role', 'title').lean();

        const adminRole = await Role.findOne({
            title: { $elemMatch: { key: 'en', value: /^admin$/i } }
        }).lean();

        console.log(JSON.stringify({
            accountFound: Boolean(user),
            studentId: user && user.studentId,
            role: user && user.role && user.role.title,
            hasPasswordHash: Boolean(user && user.password),
            adminRoleExists: Boolean(adminRole)
        }, null, 2));
    } finally {
        await mongoose.disconnect();
    }
}

main().catch(error => {
    console.error(`Admin account check failed: ${error.message}`);
    process.exitCode = 1;
});
