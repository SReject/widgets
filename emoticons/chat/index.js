module.exports = function (hook) {
    hook.messagePipe(70, require('./emoticons').pipe);
    hook.loadResource('chat:emoticon', 'emoticonPack', require('./emoticons').pack);
};
