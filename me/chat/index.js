module.exports = function (hook) {
    hook.message.pipe(hook.message.priority.FILTER, require('./me').pipe);
};
