module.exports = function (hook) {
    hook.method('permission', 'me', ['chat', require('./me').hook]);
    hook.event('MeEvent', require('./events').hook);
};
