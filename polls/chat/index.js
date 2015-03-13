module.exports = function (hook) {
    hook.method('permission', 'vote:start', ['poll_start', require('./start').hook]);
    hook.method('permission', 'vote:choose', ['poll_vote', require('./vote')]);
    hook.event('PollStart', require('./events').start);
    hook.event('PollEnd', require('./events').end);
};
