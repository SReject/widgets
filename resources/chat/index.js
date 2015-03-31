module.exports = function (hook) {
    hook.on('user:join', require('./resources').bindUser);
    hook.loadResource = require('./resources').load;
};
