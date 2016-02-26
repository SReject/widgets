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

/**
 * return a random timeout between min and max milliseconds.
 * @param  {Number} min
 * @param  {Number} max
 * @return {Number}     Timeout between min and max ms.
 */
random.timeout = function (min, max) {
    return Math.floor(Math.random() * max) + min;
};
