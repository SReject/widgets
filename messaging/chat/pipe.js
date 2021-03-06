var _ = require('lodash');

var MessageStream = require('./messageStream');
var transforms = require('./transforms');

var pipe = module.exports = {};
pipe.transforms = [
    { priority: 50, transform: transforms.splitWords},
    { priority: 100, transform: transforms.finalize}
];

/**
 * Adds a new function to message transform list. It's similar to standard
 * streams - it should take arguments (str, next) and invoke next
 * with the parsed word.
 *
 * Priority should be passed. Priorities closer to zero will be
 * run first - these should be the least expensive operations.
 * In general:
 *     - 0 to 20 are reserved for message verifications which
 *       determine if it can actually be sent.
 *     - 50 is reserved for splitWords. Transforms after this can
 *       expect to run word-by-word.
 *     - 100 is reserved for finalization that turns remaining
 *       strings into "text" components.
 *
 * @param  {Number} priority
 * @param  {Function} transform
 */
pipe.add = function (priority, transform) {
    var obj = { priority: priority, transform: transform };
    var idx = _.sortedIndex(pipe.transforms, obj, 'priority');

    pipe.transforms.splice(idx, 0, obj);
};

pipe.priority = {
    FILTER: 10,
    NORMAL: 35,
    SPLIT: 75,
    LEAD: 150
};

/**
 * Instatiates a series of message pipes for a channel.
 * @param  {Channel} channel
 * @return {Array}
 */
pipe.create = function (channel) {
    return pipe.transforms.map(function (t) {
        return t.transform(channel);
    });
};
