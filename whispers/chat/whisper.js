var clip = require('../../clip');

/**
 * Sends a whisper to another user.
 * @param  {Object}   user
 * @param  {Array}   args
 * @param  {Function} callback
 */
exports.method = function (user, args, callback) {
    var whisperTo      = args[0];
    var whisperMessage = args[1]

    if (typeof whisperTo !== 'string') {
        return callback('You must say who you\'re writing to!');
    }

    if (typeof whisperMessage !== 'string') {
        return callback('You must write a message!');
    }

    // Check if the user is actually in chat
    clip.mysql.queryAsync('SELECT `online` FROM `chat_user` WHERE `username` = ? AND channel = ? AND online=1;',
    [whisperTo, user.getChannel().id]).then(function (results) {
        if (results[0].length !== 0) {
            user.parseMessageAs(whisperMessage, function (err, message) {
                if (err) {
                    return callback(err);
                }

                message.target = whisperTo;
                message.message.meta.whisper = true;
                user.getChannel().publish('WhisperMessage', message);
            });
        } else {
            return callback(whisperTo + " isn't in this chat!");
        }
    });
};

/**
 * Sets up listeners on the channel for incoming whisper messages.
 * @param {Channel} channel
 */
exports.bindChannel = function (channel) {
    channel.on('WhisperMessage', function (channel, message) {
        channel.forUser(function (user) {
            if (user.isAnonymous()) {
                return;
            }

            if (user.getUsername().toLowerCase() === message.target.toLowerCase()) {
                user.socket.sendEvent('ChatMessage', message);
            }
        });
    });
};
