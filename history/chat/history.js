'use strict';

const MsgBuffer = require('./msgBuffer');
const clip = require('../../clip');
const _ = require('lodash');

const cache = {};
const history = module.exports = {};

/**
 * Store a message in the channel history.
 */
history.store = function (channelId, data) {
    if (!cache.hasOwnProperty(channelId)) {
        cache[channelId] = new MsgBuffer(clip.config.messages.cache);
    }

    const historyCache = cache[channelId];

    historyCache.push(data);
};

/**
 * Delete a message from the history.
 */
history.delete = function (channelId, msgId) {
    if (!cache.hasOwnProperty(channelId)) {
        return;
    }

    const historyCache = cache[channelId];

    historyCache.remove(msgId);
};

/**
 * Return the ChannelHistory array for the specified channel.
 */
history.getChannelHistory = function (channelId) {
    if (cache.hasOwnProperty(channelId)) {
        return cache[channelId];
    }

    return;
};

/**
 * Binds to the channel when it's created in the chat server.
 * @param  {User}    user
 * @param  {Object}   data
 * @param  {Function} cb
 */
history.bindChannel = function (channel) {
    channel.on('ChatMessage', function (ch, msg) {
        history.store(channel.id, msg);
    });

    channel.on('DeleteMessage', (ch, msgId) => {
        history.delete(channel.id, msgId);
    });
};

/**
 * Handler for the `history` method to get the chat history.
 * @param {Number} args.count Amount of messages to send down.
 */
history.method = function (socket, args, respond) {
    const count = parseInt(args[0], 10) || 0;

    const historyCache = history.getChannelHistory(socket.user.getChannel().id);
    const slice = _.takeRight(historyCache.container, Math.min(clip.config.get('messages.cache'), count));

    respond(null, slice);
};


