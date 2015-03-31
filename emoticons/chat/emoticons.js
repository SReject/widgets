var rawPacks = require('beam-emoticons');
var clip = require('../../clip');
var _ = require('lodash');
var packs = {};

var emoticons = module.exports = {};

// Do some initial parsing on the packs we got to make them easier to load
// later, on our loadResource handler.
(function () {
    for (var key in rawPacks) {
        packs[key] = {};
        for (var emote in rawPacks[key].emoticons) {
            packs[key][emote] = { name: rawPacks[key].emoticons[emote], pack: key };
        }
    }
})();

/**
 * Pipe function for emoticons, expects to come after words have been split.
 * Replaces emoticons (like ":)") in the message with proper components.
 * @param  {Array}   message
 * @param  {Function} callback
 */
emoticons.pipe = function (message, callback) {
    this.user.getResource('emoticonPack').then(function (pack) {

        for (var i = 0, l = message.length; i < l; i++) {
            if (typeof message[i] === 'string') {
                var emoticon = pack[message[i]];
                if (emoticon) {
                    message[i] = {
                        type: 'emoticon',
                        text: message[i],
                        path: emoticon.pack + '/' + emoticon.name
                    };
                }
            }
        }

        callback(undefined, message);
    });
};

/**
 * A loadResource handler. Takes a list of emoticon resources and returns
 * a single, nicely packed object for use later. This takes a little time,
 * but if a user sends two messages we save time doing it now vs. doing
 * it on-the-fly.
 * @param  {Object[]} resources
 * @return {Object}
 */
emoticons.pack = function (resources) {
    var output = {};

    for (var i = 0, l = resources.length; i < l; i++) {
        var pack = packs[resources[i].remote_path];
        if (!pack) {
            clip.log.warn('Tried to load unknown resource pack `' + resources[i].remote_path + '`!');
            continue;
        }

        for (var key in pack) {
            output[key] = pack[key];
        }
    }

    return output;
};
