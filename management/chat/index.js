'use strict';

module.exports = function (hook) {
    hook.method('permission', 'deleteMessage', ['remove_message', require('./delete')]);
};
