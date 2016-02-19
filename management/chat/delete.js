'use strict';
const Bluebird = require('bluebird');
const clip = require('../../clip');
const _ = require('lodash');

const del = module.exports = function (socket, args, respond) {
    Bluebird.try(() => {
        return del.remove(args[0], args[1], socket.user.getRoles());
    }).then(() => {
        respond(null, 'Message deleted.');
    }).catch(err => {
        respond(err.message);
    }); 
};

del.remove = function (channelId, messageId, deleterRoles, deleterId) {
    const history = require('../../history/chat/history');
    
    const channelHistory = history.getChannelHistory(channelId);
    if (!channelHistory) {
        throw new Error('Channel not active.');
    }
    const msg = channelHistory.getMessage(messageId);
    
    const delRole = clip.roles.getDominant(deleterRoles);
    const msgRole = clip.roles.getDominant(msg.user_roles);
    
    
    if (deleterId !== msg.user_id && !clip.roles.canAdministrate(delRole, msgRole)) {
        throw new Error('Access denied.');
    }
    return clip.manager.getChannel(channelId)
    .then(ch => ch.publish('DeleteMessage', { id: messageId }));
};
