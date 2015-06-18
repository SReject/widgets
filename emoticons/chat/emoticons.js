var Pipe = require('./pipe');

var request = require('../../util/request');
var packs = require('beam-emoticons/_out/manifest.json');
var clip = require('../../clip');
var _ = require('lodash');

function Emoticons () {
    // Do some initial parsing on the packs we got to make them easier to load
    // later, on our loadResource handler.
    this.packs = {};
    for (var key in packs) {
        this.packs[key] = {};
        for (var emote in packs[key].emoticons) {
            this.packs[key][emote] = {
                coords: packs[key].emoticons[emote],
                pack: key,
                source: 'builtin'
            };
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
 * Loads additional emoticons the user has for being subscribed
 * to "networked" channels.
 * @param  {Object} resources
 * @param  {User} user
 * @return {Promise}
 */
Emoticons.prototype.loadNetworked = function (resources, user) {
    // todo: finish the node client and use it here instead :P
    return request.run({
        url: clip.config.beam + '/api/v1/channels/' + user.getChannel().id + '/emoticons',
        json: true,
        qs: { user: user.id }
    }).catch(function (err) {
        // catch errors within the request and return as 503s
        return [{ statusCode: 503, body: err }, null];
    }).spread(function (response, results) {
        if (response.statusCode !== 200) {
            clip.log.warn('Errorful response from API when requesting channel emoticons', {
                code: response.statusCode,
                body: response.body
            });

            return resources;
        }

        for (var i = 0; i < results.length; i++) {
            var pack = results[i];
            for (var key in pack.emoticons) {
                resources[key] = {
                    coords: pack.emoticons[key],
                    pack: pack.url,
                    source: 'external'
                };
            }
        }

        return resources;
    });
};

/**
 * A loadResource handler. Takes a list of emoticon resources and returns
 * a single, nicely packed object for use later. This takes a little time,
 * but if a user sends two messages we save time doing it now vs. doing
 * it on-the-fly.
 *
 * @param  {Object[]} resources
 * @param  {User} user
 * @return {Object}
 */
Emoticons.prototype.pack = function (resources, user) {
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

    return this.loadNetworked(output, user);
};

module.exports = new Emoticons();
