var linkify = require('linkify-it')();
var util = require('util');
var _ = require('lodash');

/**
 * The NotAllowed error is used internally, and is thrown when a link is
 * detected in a context where links are not permitted.
 */
function NotAllowed () { Error.call(this); }
util.inherits(NotAllowed, Error);

/**
 * Links is a transform that prevents links from being set if preferences
 * dictate, and/or makes links "clickable".
 * @param {Channel} channel
 */
function Links (channel) {
    this.clickable = channel.getPreferences('channel:links:clickable') !== false;
    this.permitted = channel.getPreferences('channel:links:allowed') !== false;
}

/**
 * Takes a data string and matches, and returns an array of strings/objects
 * that should be used in place of it.
 * @param  {String} data
 * @param  {Array} matches
 * @return {Array}
 */
Links.prototype.clickify = function (data, matches) {
    var output = [], lastIndex = 0;

    // Loop through all the matches. At each match, add raw text we didn't
    // skipped over, then add the link object. Store the last index of the
    // link so on the next iteration (or at the end), we append the correct
    // data following the link.
    for (var i = 0, l = matches.length; i < l; i++) {
        var match = matches[i];

        output.push(data.slice(lastIndex, match.index));
        output.push({ type: 'link', url: match.url, text: match.text });
        lastIndex = match.lastIndex;
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
 * @throws {NotAllowed}
 * @return {Array}
 */
Links.prototype.parse = function (data, permitted) {
    // Loop through each "word" in the data. See if it matches and, if so,
    // either block or clickify.
    for (var i = 0; i < data.length; i++) {
        var part = data[i];

        // Make sure the data is a string, and only parse if it passes
        // our pretest. Most messages aren't links, so this saves time.
        if (typeof part === 'string' && linkify.pretest(part)) {
            var match = linkify.match(part);
            if (match !== null) {
                // Throw an error if links are not permitted. Otherwise,
                // clickify the links and replace the data with what was
                // parsed.
                if (!permitted) {
                    throw new NotAllowed();
                } else if (this.clickable) {
                    var parsed = this.clickify(part, match);
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
Links.prototype.run = function (user, data, callback) {
    // We're permitted to send links if  the we have the permission
    // bypass_links *or* links are allowed for everyone in the channel.
    var permitted = this.permitted || user.hasPermission('bypass_links');

    // If we're permitted to send links but don't need to make them clickable,
    // we don't have to bother going through looking for links.
    if (permitted && !this.clickable) {
        return callback(undefined, data);
    }

    // Try to parse the message. If links aren't allowed, we'll throw and
    // catch and exception.
    try {
        callback(undefined, this.parse(data, permitted));
    } catch (e) {
        if (e instanceof NotAllowed) {
            return callback('Links are not allowed in this chat');
        } else {
            throw e;
        }
    }
};

/**
 * Creates a links parser in the context of a channel.
 * @param  {Channel} channel
 * @return {Links}
 */
Links.pipe = function (channel) {
    return new Links(channel);
};

module.exports = Links;
