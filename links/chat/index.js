module.exports = function (hook) {
    hook.message.pipe(hook.message.priority.NORMAL, require('./links').pipe);
};
