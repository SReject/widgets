module.exports = function (hook) {
    hook.message.pipe(hook.message.priority.FILTER, require('./slowchat').pipe);
};
