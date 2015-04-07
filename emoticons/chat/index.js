var _ = require('lodash');

module.exports = function (hook) {
    var emoticons = require('./emoticons');

    hook.message.pipe(hook.message.priority.SPLIT, _.bind(emoticons.pipe, emoticons));
    hook.loadResource('chat:emoticon', 'emoticonPack', _.bind(emoticons.pack, emoticons));
};
