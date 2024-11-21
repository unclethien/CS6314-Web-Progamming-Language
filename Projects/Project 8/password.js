const crypto = require('crypto');

/**
 * Return a salted and hashed password entry from a clear text password.
 * @param {string} clearTextPassword
 * @return {object} passwordEntry where passwordEntry is an object with two
 * string properties:
 *    salt - The salt used for the password.
 *    hash - The sha1 hash of the password and salt.
 */
function makePasswordEntry(clearTextPassword) {
    // Generate a random 16-byte salt
    const salt = crypto.randomBytes(8).toString('hex');
    
    // Create SHA1 hash of password + salt
    const hash = crypto.createHash('sha1')
        .update(clearTextPassword + salt)
        .digest('hex');

    return {
        salt: salt,
        hash: hash
    };
}

/**
 * Return true if the specified clear text password and salt generates the
 * specified hash.
 * @param {string} hash
 * @param {string} salt
 * @param {string} clearTextPassword
 * @return {boolean}
 */
function doesPasswordMatch(hash, salt, clearTextPassword) {
    // Generate hash of provided password + salt
    const computedHash = crypto.createHash('sha1')
        .update(clearTextPassword + salt)
        .digest('hex');
    
    // Compare with stored hash
    return computedHash === hash;
}

module.exports = {
    makePasswordEntry,
    doesPasswordMatch
};