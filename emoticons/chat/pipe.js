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
EmoticonPipe.prototype.run = function (user, messageObj, callback) {
    user.getResource('emoticonPack').then(function (pack) {

        var message = messageObj.message;
        for (var i = 0, l = message.length; i < l; i++) {
            if (typeof message[i] === 'string') {
                var emoticon = pack[message[i]];
                if (emoticon) {
                    message[i] = {
                        type: 'emoticon',
                        source: emoticon.source,
                        pack: emoticon.pack,
                        coords: emoticon.coords,
                        text: message[i]
                    };
                }
            }
        }

        messageObj.message = message;
        callback(undefined, messageObj);
    });
};

module.exports = EmoticonPipe;
