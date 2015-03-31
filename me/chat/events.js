module.exports.hook = function (channel, data) {
    channel.broadcast('MeEvent', data);
};
