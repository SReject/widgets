'use strict';

module.exports = function (hook) {
    hook.on('channel:new', require('./history').bindChannel);
    hook.on('user:join', require('./history').bindUser);
};
