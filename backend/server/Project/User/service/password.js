const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const PREFIX = 'scrypt';

const isPasswordHash = (value) => typeof value === 'string' && value.startsWith(`${PREFIX}$`);

const hashPassword = async (password) => {
    if (typeof password !== 'string' || password.length < 8) {
        throw new Error('PASSWORD_MUST_BE_AT_LEAST_8_CHARACTERS');
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = await scrypt(password, salt, 64);
    return `${PREFIX}$${salt}$${derivedKey.toString('hex')}`;
};

const verifyPassword = async (password, storedValue) => {
    if (typeof password !== 'string' || typeof storedValue !== 'string') return false;

    // Temporary compatibility for existing accounts. Successful login upgrades
    // this legacy value immediately; new and updated passwords are always hashed.
    if (!isPasswordHash(storedValue)) {
        const supplied = Buffer.from(password);
        const stored = Buffer.from(storedValue);
        return supplied.length === stored.length && crypto.timingSafeEqual(supplied, stored);
    }

    const [, salt, expectedHex] = storedValue.split('$');
    if (!salt || !expectedHex) return false;
    const expected = Buffer.from(expectedHex, 'hex');
    const actual = await scrypt(password, salt, expected.length);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

module.exports = { hashPassword, verifyPassword, isPasswordHash };
