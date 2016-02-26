'use strict';

module.exports = function (hook) {
    hook.method('plain', 'history', require('./history').method);

    hook.on('channel:new', require('./history').bindChannel);
    hook.on('channel:destroy', require('./history').removeChannel);
};
