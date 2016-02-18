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
    if (!this.cache.hasOwnProperty(channelId)) {
        this.cache[channelId] = new MsgBuffer(clip.config.messages.cache);
    }
    
    const historyCache = this.cache[channelId];
    
    historyCache.push(data);
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

module.exports = History;
