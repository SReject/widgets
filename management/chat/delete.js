'use strict';
const Bluebird = require('bluebird');
const clip = require('../../clip');

const del = module.exports = function (socket, args, respond) {
    Bluebird.try(() => {
        const user = socket.user;
        const channel = user.getChannel();
        return del.remove(channel.getId(), args[0], user.getId(), user.getRoles(), true);
    }).then(() => {
        respond(null, 'Message deleted.');
    }).catch(err => {
        respond(err.message);
    });
};

del.remove = function (channelId, messageId, deleterId, deleterRoles, publish) {
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
    .then(ch => {
        // Publish when it's not coming from the backend, since if it's from the
        // backend all nodes have recieved it already.
        if (publish) {
            return ch.publish('DeleteMessage', { id: messageId });
        }
        channelHistory.remove(messageId);
        ch.broadcast('DeleteMessage', { id: messageId });
    });
};
