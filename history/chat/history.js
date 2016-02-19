'use strict';

const MsgBuffer = require('./msgBuffer');
const LifeRaft = require('liferaft');
const clip = require('../../clip');
const _ = require('lodash');

let instance = new History();

/**
 * History class that contains all channel histories.
 */
function History () {
    this.cache = {};
}


/**
 * Store a message in the channel history.
 */
History.prototype.store = function (channelId, data) {
    if (!this.cache.hasOwnProperty(`c${channelId}`)) {
        this.cache[`c${channelId}`] = new MsgBuffer(clip.config.messages.cache);
    }
    
    const historyCache = this.cache[`c${channelId}`];
    
    historyCache.push(data);
};

/**
 * Return the ChannelHistory array for the specified channel.
 */
History.prototype.getChannelHistory = function (channelId) {
    if (this.cache.hasOwnProperty(`c${channelId}`)) {
        return this.cache[`c${channelId}`];
    }
    
    return;
};

/**
 * Binds to the channel when it's created in the chat server.
 * @param  {User}    user
 * @param  {Object}   data
 * @param  {Function} cb
 */
History.bindChannel = function (channel) {
    channel.on('ChatMessage', function (ch, msg) {
        instance.store(channel.id, msg);
    });
};

/** 
 * Handler for the `history` method to get the chat history.
 * @param {Number} args.count Amount of messages to send down.
 */
History.method = function (socket, args, respond) {
    const count = parseInt(args[0], 10) || 0;
    
    const historyCache = instance.getChannelHistory(socket.user.getChannel().id);
    const slice = _.takeRight(historyCache, Math.min(clip.config.get('messages.cache'), count));
    
    respond(null, slice);
};

module.exports = History;
