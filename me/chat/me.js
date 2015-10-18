var clip = require('../../clip');

/**
 * The "me" transform changes messages prefixed with a "/me" into a single
 * component which is displayed in a special manner on the frontend.
 */
function Me () {
    this.prefix = '/me ';
}

/**
 * Turns the message into a single "me" component before passing it on.
 * @param  {User}    user
 * @param  {Object}   data
 * @param  {Function} cb
 */
Me.prototype.run = function (user, data, callback) {
    var msg = data.message[0];
    var len = this.prefix.length;

    // If the message was tampered with, log a error but don't break...
    if (data.message.length !== 1 || typeof msg !== 'string') {
        clip.error('Message was tampered with prior to the "me" widget getting it.');
        return callback(undefined, data);
    }

    if (msg.slice(0, len) === this.prefix) {
        data.meta.me = true;
        data.message[0] = msg.slice(len);
    }
    callback(undefined, data);
};

/**
 * Creates a new "Me" message piper.
 * @return {Me}
 */
Me.pipe = function () {
    return new Me();
};

module.exports = Me;
