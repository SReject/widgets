module.exports = function (hook) {
    hook.method('permission', 'giveaway:start', ['giveaway_start', require('./start').hook]);
};
