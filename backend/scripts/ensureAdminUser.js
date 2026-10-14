'use strict';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const printHelp = () => {
    console.log(`
Provision or promote one Buddhist Art MFU user to the Admin role.

Usage:
  pnpm admin:ensure -- --env-file .env.production --student-id <id> --email <email> [options]

Required:
  --env-file <path>       Backend environment file containing MONGODB
  --student-id <id>       Login username / student ID
  --email <email>         Official email address

Required for a new account:
  --name-th <name>        Thai display name
  --name-en <name>        English display name
  --password-stdin        Read initial password from standard input

Optional:
  --apply                 Write the change. Without this flag, the script only reports a dry run.
  --dry-run               Explicitly report the planned change without writing it (default behavior).
  --password-stdin        Reset an existing account password as well as create a new account password.
  --help                  Show this help text.

Examples:
  pnpm admin:ensure -- --env-file .env.production --student-id 6631503016 --email 6631503016@lamduan.mfu.ac.th --dry-run

  read -s -p 'Temporary password: ' ADMIN_PASSWORD; echo
  printf '%s' "$ADMIN_PASSWORD" | pnpm admin:ensure -- --env-file .env.production --student-id 6631503016 --email 6631503016@lamduan.mfu.ac.th --name-th 'ชื่อ นามสกุล' --name-en 'Name Surname' --password-stdin --apply
  unset ADMIN_PASSWORD
`);
};

const readOption = (args, option) => {
    const index = args.indexOf(option);
    if (index === -1) return null;
    const value = args[index + 1];
    if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for ${option}`);
    }
    return value.trim();
};

const readPasswordFromStdin = () => new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin.on('data', chunk => chunks.push(chunk));
    process.stdin.once('error', reject);
    process.stdin.once('end', () => {
        const password = Buffer.concat(chunks).toString('utf8').replace(/[\r\n]+$/, '');
        if (!password) {
            reject(new Error('Password from standard input is empty'));
            return;
        }
        resolve(password);
    });
    process.stdin.resume();
});

const displayName = (existingName, nameTh, nameEn) => {
    if (!nameTh && !nameEn) return existingName;

    const preserved = Array.isArray(existingName)
        ? existingName.filter(item => item && item.key !== 'th' && item.key !== 'en')
        : [];

    return [
        { key: 'th', value: nameTh || '' },
        { key: 'en', value: nameEn || '' },
        ...preserved
    ];
};

const main = async () => {
    const args = process.argv.slice(2);
    if (args.includes('--help')) {
        printHelp();
        return;
    }

    const envFileInput = readOption(args, '--env-file');
    const studentId = readOption(args, '--student-id');
    const email = readOption(args, '--email');
    const nameTh = readOption(args, '--name-th');
    const nameEn = readOption(args, '--name-en');
    const apply = args.includes('--apply');
    const dryRun = args.includes('--dry-run');
    const passwordFromStdin = args.includes('--password-stdin');

    if (!envFileInput || !studentId || !email) {
        throw new Error('Use --env-file, --student-id, and --email. Run with --help for details.');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error('Email address is invalid');
    }
    if (apply && dryRun) {
        throw new Error('Use either --apply or --dry-run, not both');
    }

    const envFile = path.resolve(process.cwd(), envFileInput);
    if (!fs.existsSync(envFile)) {
        throw new Error(`Environment file not found: ${envFile}`);
    }
    require('dotenv').config({ path: envFile, override: true });
    if (!process.env.MONGODB) {
        throw new Error(`MONGODB is missing from ${envFile}`);
    }

    const User = require('../server/Project/User/models/user.model');
    const Role = require('../server/Project/Settings/models/role.model');
    const { hashPassword } = require('../server/Project/User/service/password');

    let password = null;
    if (passwordFromStdin) password = await readPasswordFromStdin();

    await mongoose.connect(process.env.MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    });

    try {
        const adminRole = await Role.findOne({
            title: { $elemMatch: { key: 'en', value: /^admin$/i } }
        }).lean();
        if (!adminRole) {
            throw new Error('Admin role is not configured. Do not run seed:settings on production; restore or create the role through the approved settings workflow.');
        }

        const matches = await User.find({
            $or: [
                { studentId },
                { 'contact.studentEmail': email },
                { 'contact.personalEmail': email }
            ]
        }).select('+password').lean();

        const distinctMatches = [...new Map(matches.map(user => [String(user._id), user])).values()];
        if (distinctMatches.length > 1) {
            throw new Error('Student ID and email match different accounts. Resolve the duplicate identity manually before changing roles.');
        }

        const existing = distinctMatches[0] || null;
        if (existing && existing.studentId && existing.studentId !== studentId) {
            throw new Error(`Email belongs to an existing account with a different student ID (${existing.studentId}). Refusing to change identity automatically.`);
        }
        if (!existing && (!nameTh || !nameEn || !password)) {
            throw new Error('New account requires --name-th, --name-en, and a password supplied with --password-stdin.');
        }

        const contact = {
            ...((existing && existing.contact) || {}),
            studentEmail: email
        };
        const update = {
            studentId,
            role: adminRole._id,
            contact,
            name: displayName(existing && existing.name, nameTh, nameEn)
        };
        if (password) update.password = await hashPassword(password);

        const result = {
            action: existing ? 'promote-existing-user' : 'create-admin-user',
            dryRun: !apply,
            studentId,
            email,
            role: 'Admin',
            passwordUpdated: Boolean(password),
            existingUserId: existing ? String(existing._id) : null
        };

        if (!apply) {
            console.log(JSON.stringify(result, null, 2));
            console.log('Dry run only. Add --apply after reviewing this result.');
            return;
        }

        if (existing) {
            await User.updateOne({ _id: existing._id }, { $set: update });
            result.userId = String(existing._id);
        } else {
            const user = await User.create(update);
            result.userId = String(user._id);
        }

        console.log(JSON.stringify(result, null, 2));
    } finally {
        await mongoose.disconnect();
    }
};

main().catch(error => {
    console.error(`Admin provisioning failed: ${error.message}`);
    process.exitCode = 1;
});
