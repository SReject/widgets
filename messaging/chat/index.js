module.exports = function (hook) {
    hook.method('permission', 'msg', ['chat', require('./chat').method]);

    hook.on('user:join', require('./chat').bindUser);
    hook.on('channel:new', require('./chat').bindChannel);

    hook.messagePipe = require('./pipe').add;
};
