module.exports = function (hook) {
    hook.on('channel:new', require('./slowchat').bind);

    hook.messagePipe(2, require('./slowchat').pipe);
};
