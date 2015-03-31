var linkify = require('linkify-it')();
var util = require('util');
var _ = require('lodash');

var links = module.exports = {};

/**
 * The NotAllowed error is used internally, and is thrown when a link is
 * detected in a context where links are not permitted.
 */
links.notAllowed = function () { Error.call(this); };
util.inherits(links.notAllowed, Error);

/**
 * Takes a data string and matches, and returns an array of strings/objects
 * that should be used in place of it.
 * @param  {String} data
 * @param  {Array} matches
 * @return {Array}
 */
links.clickify = function (data, matches) {
    var output = [], lastIndex = 0;

    // Loop through all the matches. At each match, add raw text we didn't
    // skipped over, then add the link object. Store the last index of the
    // link so on the next iteration (or at the end), we append the correct
    // data following the link.
    for (var i = 0, l = matches.length; i < l; i++) {
        output.push(data.slice(lastIndex, matches[i].index));
        output.push({ type: 'link', url: matches[i].url, text: matches[i].text });
        lastIndex = matches[i].lastIndex;
    }

    // At the end, if there's trailing text, add that on.
    if (lastIndex < data.length) {
        output.push(data.slice(lastIndex));
    }

    return output;
};

/**
 * Parses the message. Clickifies links if necessary, and throws an error
 * if links are not permitted.
 *
 * @param  {Array} data
 * @param  {Boolean} permitted
 * @param  {Boolean} clickable
 * @throws {links.notAllowed}
 * @return {Array}
 */
links.parse = function (data, permitted, clickable) {
    // Loop through each "word" in the data. See if it matches and, if so,
    // either block or clickify.
    for (var i = 0; i < data.length; i++) {
        // Make sure the data is a string, and only parse if it passes
        // our pretest. Most messages aren't links, so this saves time.
        if (typeof data[i] === 'string' && linkify.pretest(data[i])) {
            var match = linkify.match(data[i]);
            if (match !== null) {
                // Throw an error if links are not permitted. Otherwise,
                // clickify the links and replace the data with what was
                // parsed.
                if (!permitted) {
                    throw new links.notAllowed();
                } else if (clickable) {
                    var parsed = links.clickify(data[i], match);
                    data = data.slice(0, i).concat(parsed).concat(data.slice(i + 1));
                    i += parsed.length;
                }
            }
        }
    }

    return data;
};

/**
 * Ensures the user can send a message before piping it on.
 * @param  {Array}   data
 * @param  {Function} cb
 */
links.pipe = function (data, callback) {
    // Pull channgel preferences regarding links. By default things are
    // clickable and links are allow. We're permitted to send links if
    // the we have the permission bypass_links *or* links are allowed
    // for everyone in the channel.
    var clickable = this.user.getChannel().getPreferences('channel:links:clickable') !== false;
    var permitted = this.user.hasPermission('bypass_links') ||
                    this.user.getChannel().getPreferences('channel:links:allowed') !== false;

    // If we're permitted to send links but don't need to make them clickable,
    // we don't have to bother going through looking for links.
    if (permitted && !clickable) {
        return callback(undefined, data);
    }

    // Try to parse the message. If links aren't allowed, we'll throw and
    // catch and exception.
    try {
        callback(undefined, links.parse(data, permitted, clickable));
    } catch (e) {
        if (e instanceof links.notAllowed) {
            return callback('Links are not allowed in this chat');
        } else {
            throw e;
        }
    }

};
