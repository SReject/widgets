'use strict';
const history = require('../../history/chat/history');
const clip = require('../../clip');
const _ = require('lodash');

module.exports = function (socket, args, respond) {
    const channelId = args[0],
        messageId = args[1];
    const channelHistory = history.getChannelHistory(channelId);
    if (!channelHistory) {
        console.log("NOCHANHIST")
        return respond('Channel not active.');
    }
    const msg = channelHistory.getMessage(messageId);
    
    if (getHighestLevel(socket.user.getRoles()) <= getHighestLevel(msg.user_roles)) {
        return respond('Access denied.');
    }
    socket.user.getChannel().publish('DeleteMessage', { id: messageId });
    
    respond(null, 'Message deleted.');
};

function getHighestLevel(roles) {
    _(roles)
    .map(role => clip.roles[role].level)
    .max();
}