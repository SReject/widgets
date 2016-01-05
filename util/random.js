var random = module.exports = {};

/**
 * Generates a random alphanumeric string.
 * @param  {Number} length
 * @return {String}
 */
random.alphanum = function (length) {
    return random.string(length, '1234567890abcdefghijklmnopqrstuvwxyz');
};

/**
 * Generates a random string of "length" formed from the characters.
 * @param  {Number} length
 * @param  {String} set
 * @return {String}
 */
random.string = function (length, set) {
    var out = '';
    for (; length; length--) {
        out += set[~~(Math.random() * set.length)];
    }

    return out;
};
