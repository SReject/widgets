'use strict';

const MsgBuffer = require('./msgBuffer');
const Bluebird = require('bluebird');
const random = require('../../util/random');
const clip = require('../../clip');
const _ = require('lodash');

const cache = {};
const history = module.exports = {};

/**
 * Store a message in the channel history.
 */
history.store = function (channelId, data) {
    const historyCache = history.initCache(channelId);

    historyCache.push(data);
};

history.initCache = function (channelId) {
    if (!cache.hasOwnProperty(channelId)) {
        cache[channelId] = new MsgBuffer(clip.config.messages.cache);
    }

    return cache[channelId];
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
    history.retrieve(channel)
    .then(() => {
        channel.on('ChatMessage', function (ch, msg) {
            history.store(channel.id, msg);
        });

        channel.on('DeleteMessage', (ch, msgId) => {
            history.delete(channel.id, msgId);
        });

        channel.on('getHistory', (ch, uniqId) => {
            if (history.getChannelHistory(ch.getId())) {
                // Return the history after a timeout between 50 and 1000 ms.
                setTimeout(() =>
                    history.returnHistory(ch.getId(), uniqId),
                random.timeout(50, 1000));
            }
        });
    });
};

/**
 * Removes the channel from the cache after it has been removed.
 * @param  {User}    user
 * @param  {Object}   data
 * @param  {Function} cb
 */
history.removeChannel = function (channel) {
    history.clear(channel.getId());
};

/**
 * Removes the history for a certain channel from the cache.
 * @param  {Number} channelId
 */
history.clear = function (channelId) {
    const hist = history.getChannelHistory(channelId);

    if (hist) {
        delete cache[channelId];
    }
};

/**
 * Handler for the `history` method to get the chat history.
 * @param {Number} args.count Amount of messages to send down.
 */
history.method = function (socket, args, respond) {
    const count = parseInt(args[0], 10) || 0;

    const historyCache = history.getChannelHistory(socket.user.getChannel().id);
    if (!historyCache) return respond(null, []);

    const slice = _.takeRight(historyCache.container, Math.min(clip.config.get('messages.cache'), count));

    respond(null, slice);
};

/**
 * Retrieve the chat history from another channel over redis.
 * Retrieval uses Redis to request the history from anyone that may have
 * it. The one that decides to respond then locks a key so only 1 instance
 * will respond.
 * @param  {Channel} channel
 * @return {Promise}
 */
history.retrieve = function (channel) {
    const channelId = channel.getId();
    const prom = Bluebird.defer();
    const uniqId = random.alphanum(5);
    const EVENT_TOKEN = `chat:${channelId}:history${uniqId}`;

    const timeout = setTimeout(() => prom.resolve(), 1000);

    history.initCache(channelId);

    channel.once(EVENT_TOKEN, (ch, data) => {
        clearTimeout(timeout);
        // Clear the previous channel history if it existed.
        history.clear(channelId);

        // Store each historical message.
        data.forEach((msg) => history.store(channelId, msg));
    });

    clip.redis.publish(`chat:${channelId}:getHistory`, JSON.stringify(uniqId));

    return prom.promise;
};

const LOCK_EXPIRY = 2;
/**
 * Returns the history for the given channel and uniqId.
 * @param  {Number} channelId The id of the channel to retrieve history for.
 * @param  {String} uniqId    A unique ID for this history request.
 * @return {Promise}
 */
history.returnHistory = function (channelId, uniqId) {
    const lockKey = `lock:${uniqId}`;
    return clip.redis.getAsync(lockKey)
    .then(locked => {
        if (locked) return;
        return clip.redis.setAsync(lockKey, true, 'EX', LOCK_EXPIRY)
        .then(() => {
            const event = `chat:${channelId}:history${uniqId}`;
            const data = history.getChannelHistory(channelId);
            return clip.redis.publishAsync(event, JSON.stringify(data.container));
        });
    });
};
