var me = module.exports = {};

me.hook = function (user, args, callback) {
    var channel = user.getChannel();
    var message = args[0];

    try {
        // Try and verify the message.
        me._verifyMessage(message);

        // If no errors were thrown, we'll be here, and can emit the message.
        channel.emit('MeEvent', {
            user_name: user.username,
            user_id: user.id,
            user_roles: user.roles,
            message: message
        });

        // Finally, call the callback with no error!
        return callback(null, {success: true});
    } catch (err) {
        // If any err was thrown, catch it, and redirect the err message back
        // into the callback as the first argument (sig. that the thing was not
        // completed succesfully).
        if (err) {
            return callback(err, null);
        }
    }
};

me._verifyMessage = function (message, callback) {
    if (typeof message !== 'string') {
        throw 'Could not preform /me because your message is not a string!';
    } else if (message.length > 200) {
        throw 'Could not preform /me because your message was too long!';
    }
};
