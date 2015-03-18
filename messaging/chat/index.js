module.exports = function (hook) {
    hook.method('permission', 'msg', ['chat', require('./chat').send]);

    hook.on('user:join', require('./chat').bindUser);
    hook.on('user:new', require('./chat').bindChannel);

    hook.messagePipe = require('./chat').addPipe;
};
