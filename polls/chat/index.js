module.exports = function (hook) {
    hook.method('permission', 'vote:start', ['poll_start', require('./start').hook]);
    hook.method('permission', 'vote:choose', ['poll_vote', require('./vote')]);

    hook.on('channel:new', function (channel) {
        channel.on('PollStart', require('./events').start);
        channel.on('PollEnd', require('./events').end);
    });
};
