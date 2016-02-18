'use strict';
const clip = require('../../clip');
const LifeRaft = require('liferaft');
const MsgBuffer = require('./msgBuffer');

let instance = null;

/**
 * 
 */
function History () {
    this.cache = {};
}



History.prototype.store = function (channelId, data) {
    if (!this.cache.hasOwnProperty(`c${channelId}`)) {
        this.cache[`c${channelId}`] = new MsgBuffer(clip.config.messages.cache);
    }
    
    const historyCache = this.cache[`c${channelId}`];
    
    historyCache.push(data);
};

History.prototype.getChannelHistory = function (channelId) {
    if (this.cache.hasOwnProperty(`c${channelId}`)) {
        return this.cache[`c${channelId}`];
    }
    
    return;
};

/**
 * 
 * @param  {User}    user
 * @param  {Object}   data
 * @param  {Function} cb
 */
History.bindChannel = function (channel) {
    if (!instance) instance = new History();
    
    channel.on('ChatMessage', function (ch, msg) {
        instance.store(channel.id, msg);
    });
};

History.bindUser = function (user) {
    if (!instance) instance = new History();
    
    const historyCache = instance.getChannelHistory(user.getChannel().id);
    if (user.params.history) {
        const count = Math.min(
            clip.config.get('messages.cache') || 50, 
            parseInt(user.params.history, 10) || 0,
            historyCache.length || 0
        );
        // TODO(JamyDev): Export this to a function or use a lodash one?
        const begin = historyCache.length - count;
        const slice = historyCache.slice(begin, historyCache.length);

        for (let i = 0; i < slice.length; ++i) {
            user.socket.sendEvent('ChatMessage', slice[i]);
        }
        
    }
};

module.exports = History;
