module.exports = function (hook) {
    var counter = require('./counter');

    hook.on('booted', counter.init);

    hook.on('user:join', counter.addUser);
    hook.on('user:leave', counter.removeUser);
};
