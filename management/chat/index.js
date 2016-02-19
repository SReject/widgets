'use strict';
const LifeRaft = require('liferaft');
const redis = require('redis');

module.exports = function (hook) {
    hook.method('permission', 'deleteMessage', ['remove_message', require('./delete')]);
    hook.on('booted', () => {
        const clip = require('../../clip');
        const client = redis.createClient(clip.config.get('redis'));
        client.on('pmessage', (pattern, event, data) => {
            console.log(event, LifeRaft.states[clip.cluster.state])
            if (!event.match(/chatcompat\:[0-9]+\:deleteMessage/) || 
                LifeRaft.states[clip.cluster.state] !== 'LEADER') {
                return;
            }
            try {
                data = JSON.parse(data);
            } catch (e) {
                return;
            }
            console.log(event.split(':')[1], data.id, data.user_roles, data.user_id)
            
            try {
                require('./delete').remove(event.split(':')[1], data.id, data.user_roles, data.user_id);
            } catch (e) {} // Ignore catch
        });

        client.psubscribe('chatcompat:*:deleteMessage');
    })
};
