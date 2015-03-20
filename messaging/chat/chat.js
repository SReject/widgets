var _ = require('lodash');
var uuid = require('node-uuid');

var pipe = require('./pipe');
var clip = require('../../clip');
var chat = module.exports = {};

/**
 * Parses a message through the pipes, running a callback
 * with the completed array of components.
 * @param  {String}   message
 * @param  {Function} callback
 */
chat.parseMessage = function (user, message, callback) {
    var stream = pipe.message(message);
    stream.setContext(_.extend({ user: user }, this));

    stream.on('aborted', function (err) {
        callback(err);
    });
    stream.on('end', function (message) {
        callback(null, message);
    });

    stream.run();
};

/**
 * Parses a message and then sends it.
 * @param  {Object} user
 * @param  {String} msg
 */
chat.sendMessage = function (channel, user, message) {
    chat.parseMessage(user, message, function (err, message) {
        if (err) {
            clip.log.error(err);
        } else {
            chat.sendMessageRaw(channel, user, message);
        }
    });
};

/**
 * Sends a chat message out to the channel.
 * @param  {Objec} user
 * @param  {Array} msg
 */
chat.sendMessageRaw = function (channel, user, msg) {
    var message = {
        channel: channel.id,
        id: uuid.v1(),
        user_name: user.username,
        user_id: user.id,
        user_role: user.role,
        message: msg
    };

    channel.publish('ChatMessage', message);

    // Save the message into our Cassandra archive.
    clip.cassandra
        .ChatMessage
        .new()
        .extend(message)
        .save({ ttl: clip.config.messages.ttl });
};

/**
 * Triggered when we get a method to start a vote.
 * @param  {Object} user
 * @param  {Array} args
 * @param  {Function} next
 */
chat.method = function (user, args, callback) {
    if (typeof args[0] !== 'string') {
        return callback('You must write a message!');
    }

    chat.sendMessage(user.getChannel(), user, args[0]);
    callback(null, 'Message sent');
};

/**
 * Adds a method on a user for other widgets to use to send messages
 * on the user object.
 * @param  {Object} user
 */
chat.bindUser = function (user) {
    user.sendMessage = _.bind(chat.sendMessage, null, user.getChannel(), user);
};
/**
 * Adds a method on a user for other widgets to use to send messages
 * on a channel object.
 * @param  {Object} channel
 */
chat.bindChannel = function (channel) {
    channel.sendMessage = _.bind(chat.sendMessage, null, channel);
};
