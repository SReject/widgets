module.exports = function (hook) {
    hook.method('permission', 'whisper', ['chat', require('./whisper').method]);
    hook.on('channel:new', require('./whisper').bindChannel);
};
