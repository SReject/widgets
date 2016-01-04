var Pipe = require('./pipe');

function InASpaceSuit () {
}

/**
 * Returns a new Pipe object for inaspacesuit emoticon.
 * @param  {Channel} channel
 * @return {Pipe}
 */
InASpaceSuit.prototype.pipe = function (channel) {
    return new Pipe(channel);
};

module.exports = new InASpaceSuit();
