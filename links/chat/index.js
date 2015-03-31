module.exports = function (hook) {
    hook.messagePipe(30, require('./links').pipe);
};
