var clip = require('../../clip');
var util = require('./util');

/**
 * Votes for an ongoing poll.
 * @param  {Object}   user
 * @param  {Array}   args
 * @param  {Function} callback
 */
module.exports = function (user, args, callback) {
    var channel = user.getChannel();
    // If there's no ongoing vote, error
    if (!util.hasVote(channel)) {
        return callback('There\'s no vote right now!');
    }

    // Otherwise, check to see if they voted yet.
    clip.redis.sismemberAsync(util.votersSlug(channel), user.getId()).then(function (member) {
        if (member) {
            return callback('You already voted in this poll.');
        }

        // If not, record their vote.
        clip.redis.multi()
            .HINCRBY(util.responseSlug(channel), args[0], 1)
            .SADD(util.votersSlug(channel), user.getId())
            .exec(function (err) {
                callback(err, 'Vote recorded.');
            });

        // And record the vote in graphite
        var bucketName = "live."+channel.id+".poll.votes";
        clip.graphite.increment(bucketName);
    });
};
