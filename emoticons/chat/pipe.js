function EmoticonPipe(packs, channel) {
    this.packs = packs;
    this.channel = channel;
}


/**
 * Pipe function for emoticons, expects to come after words have been split.
 * Replaces emoticons (like ":)") in the message with proper components.
 * @param  {Array}   message
 * @param  {Function} callback
 */
EmoticonPipe.prototype.run = function (user, message, callback) {
    user.getResource('emoticonPack').then(function (pack) {

        for (var i = 0, l = message.length; i < l; i++) {
            if (typeof message[i] === 'string') {
                var emoticon = pack[message[i]];
                if (emoticon) {
                    message[i] = {
                        type: 'emoticon',
                        source: 'builtin',
                        pack: emoticon.pack,
                        coords: emoticon.coords,
                        text: message[i]
                    };
                }
            }
        }

        callback(undefined, message);
    });
};

module.exports = EmoticonPipe;
