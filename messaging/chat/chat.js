var _ = require('lodash');
var uuid = require('node-uuid');

var MessageStream = require('./messageStream');
var pipe = require('./pipe');
var clip = require('../../clip');
var chat = module.exports = {};

function noop () {}

/**
 * Parses a message through the pipes, running a callback
 * with the completed array of components.
 * @param  {String}   message
 * @param  {Function} callback
 */
chat.parseMessage = function (channel, user, message, callback) {
    var stream = new MessageStream({message: [message], meta: {}}, channel.messagePipes);

    stream.on('aborted', function (err) {
        callback(err);
    });
    stream.on('end', function (message) {
        callback(null, chat.tagMessage(channel, user, message));
    });

    stream.setUser(user).run();
};

/**
 * Parses a message and then sends it.
 * @param  {Object} channel
 * @param  {Object} user
 * @param  {String} message
 * @param  {Function} callback
 */
chat.sendMessage = function (channel, user, message, callback) {
    callback = callback || noop;

    if (!message) {
        callback('You must type a message!');
    }

    chat.parseMessage(channel, user, message, function (err, message) {
        if (err) {
            callback(err);
        } else {
            chat.sendMessageRaw(channel, user, message);
            callback(null, message.id);
        }
    });
};

/**
 * Adds default properties to a message object to fill it out for sending.
 * @param  {Object} channel
 * @param  {Object} user
 * @param  {Object} message
 * @return {Object}
 */
chat.tagMessage = function (channel, user, message) {
    if (message.id) {
        return message;
    }

    return {
        channel: channel.getId(),
        id: uuid.v1(),
        user_name: user.getUsername(),
        user_id: user.getId(),
        user_roles: user.getRoles(),
        message: message
    };
};

/**
 * Sends a chat message out to the channel.
 * @param  {Objec} user
 * @param  {Object} msg
 */
chat.sendMessageRaw = function (channel, user, msg) {
    var message = chat.tagMessage(channel, user, msg);

    channel.publish('ChatMessage', message);

    // Log the chat message into graphite
    var bucketName = "live."+channel.id+".chat.messages";
    clip.graphite.increment(bucketName);
};

/**
 * Triggered when we get a method to send a message.
 * @param  {Object} user
 * @param  {Array} args
 * @param  {Function} next
 */
chat.method = function (user, args, callback) {
    if (typeof args[0] !== 'string') {
        return callback('You must write a message!');
    }

    chat.sendMessage(user.getChannel(), user, args[0], function (err, uuid) {
        callback(err, {uuid});
    });
};

/**
 * Adds a method on a user for other widgets to use to send messages
 * on the user object.
 * @param  {Object} user
 */
chat.bindUser = function (user) {
    user.parseMessageAs = _.bind(chat.parseMessage, null, user.getChannel(), user);
    user.sendMessage = _.bind(chat.sendMessage, null, user.getChannel(), user);
};
/**
 * Adds a method on a user for other widgets to use to send messages
 * on a channel object.
 * @param  {Object} channel
 */
chat.bindChannel = function (channel) {
    channel.messagePipes = pipe.create(channel);
    channel.sendMessage = _.bind(chat.sendMessage, null, channel);
    channel.sendMessageRaw = _.bind(chat.sendMessageRaw, null, channel);

    channel.on('ChatMessage', function (ch, data) {
        channel.broadcast('ChatMessage', data);
    });
};