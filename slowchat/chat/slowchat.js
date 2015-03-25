var _ = require('lodash');
var config = require('./config');
var slowchat = module.exports = {};

/**
 * Binds slowchat settings on the channel - adds a property
 * "lastUserMessage", which is a map of user IDs to timestamps
 * for when the user last chatted. It also listens for incoming
 * messages to update the timing, and registers a cleanup event.
 *
 * @param  {Channel} channel
 */
slowchat.bind = function (channel) {
    var interval;

    // The record of user names to dates.
    channel.lastUserMessage = {};

    // When we get a new message, update the user's last message time.
    channel.on('ChatMessage', function (message) {
        channel.lastUserMessage['i' + message.user_id] = Date.now();
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
            return now - last > slowchat.getDuration(channel);
        });
    }, config.trimInterval);
};

/**
 * Returns the slowchat time for a channel.
 * @param  {Channel} channel
 * @return {Number}
 */
slowchat.getDuration = function (channel) {
    return channel.getPreferences('channel:slowchat') || config.defaultSlowchat;
};


/**
 * Ensures the user can send a message before piping it on.
 * @param  {Array}   data
 * @param  {Function} cb
 */
slowchat.pipe = function (data, cb) {
    var id = 'i' + this.user.getId();
    var channel = this.user.getChannel();
    var lastMessage = channel.lastUserMessage[id];

    if (lastMessage && Date.now() - lastMessage < slowchat.getDuration(channel)) {
        cb('Please wait a moment before sending more messages.');
    } else {
        cb(undefined, data);
    }
};
