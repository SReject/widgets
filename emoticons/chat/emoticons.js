var packs = require('beam-emoticons');
var Pipe = require('./pipe');
var clip = require('../../clip');
var _ = require('lodash');

function Emoticons () {
    // Do some initial parsing on the packs we got to make them easier to load
    // later, on our loadResource handler.
    this.packs = {};
    for (var key in packs) {
        this.packs[key] = {};
        for (var emote in packs[key].emoticons) {
            this.packs[key][emote] = { name: packs[key].emoticons[emote], pack: key };
        }
    }
}

/**
 * Returns a new Pipe object for emoticons.
 * @param  {Channel} channel
 * @return {Pipe}
 */
Emoticons.prototype.pipe = function (channel) {
    return new Pipe(this.packs, channel);
};

/**
 * A loadResource handler. Takes a list of emoticon resources and returns
 * a single, nicely packed object for use later. This takes a little time,
 * but if a user sends two messages we save time doing it now vs. doing
 * it on-the-fly.
 * @param  {Object[]} resources
 * @return {Object}
 */
Emoticons.prototype.pack = function (resources) {
    var output = {};

    for (var i = 0, l = resources.length; i < l; i++) {
        var pack = this.packs[resources[i].remotePath];
        if (!pack) {
            clip.log.warn(
                'Tried to load unknown resource pack `' + resources[i].remotePath + '`!',
                { resource: resources[i] }
            );
            continue;
        }

        for (var key in pack) {
            output[key] = pack[key];
        }
    }

    return output;
};

module.exports = new Emoticons();
