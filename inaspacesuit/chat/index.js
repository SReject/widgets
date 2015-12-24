var _ = require('lodash');

module.exports = function (hook) {
    var inaspacesuit = require('./inaspacesuit');

    hook.message.pipe(hook.message.priority.SPLIT, _.bind(inaspacesuit.pipe, inaspacesuit));
};
