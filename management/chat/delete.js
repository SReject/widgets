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
    if (!msg) {
        throw new Error('Message not found.');
    }

    const delRole = clip.roles.getDominant(deleterRoles);
    const msgRole = clip.roles.getDominant(msg.user_roles);

    const deletingOwnMessage = msg.user_id === deleterId && delRole.level > clip.roles.getLevel('User');
    if (!clip.roles.canAdministrate(delRole.level, msgRole.level) && !deletingOwnMessage) {
        throw new Error('Access denied.');
    }

    return clip.manager.getChannel(channelId)
    // Only broadcast locally, since this method is run on each chat instance.
    .then(ch => ch.broadcast('DeleteMessage', { id: messageId }));
};
