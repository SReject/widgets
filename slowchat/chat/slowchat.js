var _ = require('lodash');
var config = require('./config');
var slowchat = module.exports = {};

/**
 * Returns the identified for a user, `i+id`. This is so that the keys in
 * the cache object are valid identifiers, preventing V8 from putting
 * it into has table mode.
 * @param  {User} user
 * @return {String}
 */
function ident (user) {
    return 'i' + user;
}

/**
 * The SlowChat widget is responsible for enforcing chat rate limits for
 * users of a channel.
 * @param {Channel} channel
 */
function SlowChat (channel) {
    this.channel = channel;
    this.duration = channel.getPreferences('channel:slowchat') || config.defaultSlowchat;
    this.booted = false;
}

/**
 * Binds slowchat settings on the channel - adds a property
 * "lastUserMessage", which is a map of user IDs to timestamps
 * for when the user last chatted. It also listens for incoming
 * messages to update the timing, and registers a cleanup event.
 * @return {SlowChat}
 * */
SlowChat.prototype.boot = function () {
    var channel = this.channel;
    var duration = this.duration;
    var interval;

    this.booted = true;

    // The record of user names to dates.
    channel.lastUserMessage = {};

    // When we get a new message, update the user's last message time.
    channel.on('ChatMessage', function (message) {
        channel.lastUserMessage[ident(message.user_id)] = Date.now();
    });

    // When the channel is destroyed, stop
    // trimming and clean the channel.
    channel.on('destroy', function () {
        clearInterval(interval);
        channel = null;
    });

    // On the trim interval, remove users whose slowchat intervals
    // have expired.
    interval = setInterval(function () {
        var now = Date.now();
        channel.lastUserMessage = _.omit(channel.lastUserMessage, function (last) {
            return now - last > duration;
        });
    }, config.trimInterval);

    return this;
};

/**
 * Returns whether the user is in a state to send a message. It returns
 * false if the user can't bypass slowchat and their last messages was
 * within the "slowchat" preference value.
 *
 * @param  {User} user
 * @return {Boolean}
 */
SlowChat.prototype.canSend = function (user) {
    var lastMessage = this.channel.lastUserMessage[ident(user.getId())];

    return lastMessage && !user.hasPermission('bypass_slowchat') &&
           Date.now() - lastMessage < this.duration;
};


/**
 * Ensures the user can send a message before piping it on.
 * @param  {Array}   data
 * @param  {Function} cb
 */
SlowChat.prototype.run = function (user, data, cb) {
    if (!this.booted) {
        this.boot();
    }

    if (this.canSend(user)) {
        cb('Please wait a moment before sending more messages.');
    } else {
        cb(undefined, data);
    }
};

/**
 * Creates a new slowchat bound to the channel.
 * @param  {Channel} channel
 * @return {SlowChat}
 */
SlowChat.pipe = function (channel) {
    return new SlowChat(channel);
};

module.exports = SlowChat;
