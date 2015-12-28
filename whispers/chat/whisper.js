var clip = require('../../clip');

/**
 * Sends a whisper to another user.
 * @param  {Object}   user
 * @param  {Array}   args
 * @param  {Function} callback
 */
exports.method = function (user, args, callback) {
    if (typeof args[0] !== 'string') {
        return callback('You must say who you\'re writing to!');
    }

    if (typeof args[1] !== 'string') {
        return callback('You must write a message!');
    }

    user.parseMessageAs(args[1], function (err, message) {
        if (err) {
            return callback(err);
        }

        message.target = args[0];
        message.message.meta.whisper = true;
        user.getChannel().publish('WhisperMessage', message);
    });
};

/**
 * Sets up listeners on the channel for incoming whisper messages.
 * @param {Channel} channel
 */
exports.bindChannel = function (channel) {
    channel.on('WhisperMessage', function (channel, message) {
        channel.forUser(function (user) {
            if (user.getUsername().toLowerCase() === message.target.toLowerCase()) {
                user.socket.sendEvent('ChatMessage', message);
            }
        });
    });
};
