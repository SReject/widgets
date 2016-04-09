var util = require('./util');
var clip = require('../../clip');
var start = module.exports = {};

/**
 * Validates the arguments, returning an error string if they're incorrect.
 * @param  {String}   question
 * @param  {[]String} answers
 * @param  {Number}   duration
 * @return {String}
 */
start.validate = function (channel, question, answers, duration) {
    if (typeof question !== 'string' || question.length < 2 || question.length > 255) {
        return 'You need to enter a question!';
    }
    if (!Array.isArray(answers) || answers.length < 2 || answers.length > 6) {
        return 'You need to give your users between two and six options.';
    }
    if (typeof duration !== 'number' || duration < 5 || duration > 300) {
        return 'Votes must be between 5 seconds and 5 minutes long.';
    }
    if (util.hasVote(channel)) {
        return 'There\'s already a vote happening!';
    }
};

/**
 * Sets up the hash in Redis for responses to be stored in, and logs that a
 * poll started in Influx.
 *
 * @param  {Object} redis
 * @param  {Object}   channel
 * @param  {Array}   answers
 * @param  {Function} callback
 */
start.setupRedis = function (channel, answers, duration, callback) {
    var responseSlug = util.responseSlug(channel);
    var votersSlug = util.votersSlug(channel);

    // Create the map for redis to store votes in.
    var map = {};
    for (var i = 0, l = answers.length; i < l; i++) {
        map[i] = 0;
    }

    clip.redis.multi()
        .hmset(responseSlug, map)
        // Set the expiry slightly later to prevent a race at the end.
        .pexpire(responseSlug, (duration + 1) * 1000)
        // Create a the voter set and add a "foo" value so we can set the ttl.
        .sadd(votersSlug, '#')
        .pexpire(votersSlug, duration * 1000)
        .exec(callback);
};

start.waitForEnd = function (channel, answers, duration) {
    // Set the interval to end the vote after the duration elapses.
    setTimeout(function () {
        clip.redis.hgetall(util.responseSlug(channel), function (err, results) {
            if (err) {
                // Nothing we can do with an error at this point.
                return;
            }

            // Count the number of responses from redis.
            var responses = {};
            var voters = 0;
            for (var i = 0, l = answers.length; i < l; i++) {
                var votes = ~~results[i] || 0;
                responses[answers[i]] = votes;
                voters += votes;
            }

            // Log that the poll stopped
            clip.influx.writePointAsync('polls', {
                voters,
                channel: channel.getId(),
            }, {});

            // Then emit them across the chat servers.
            channel.publish(
                'PollEnd',
                { voters: voters, responses: responses }
            );
        });
    }, duration * 1000);
};

/**
 * Triggered when we get a method to start a vote.
 * @param  {Object} user
 * @param  {Array} args
 * @param  {Function} next
 */
start.hook = function (user, args, callback) {
    // Validate the data.
    var channel = user.getChannel();
    var question = args[0], answers = args[1], duration = args[2];
    var redis = this.redis;

    var err = start.validate(channel, question, answers, duration);
    if (err) {
        return callback(err);
    }

    // At this point, we're good. Emit the poll start event and
    // set set up the response hash.
    start.setupRedis(channel, answers, duration, function (err) {
        if (err) {
            return callback(err);
        }

        channel.publish('PollStart', {
            q: args[0],
            answers: answers,
            duration: duration,
            endsAt: Date.now() + duration * 1000
        });

        start.waitForEnd(channel, answers, duration);

        // And call back, we're good!
        callback(undefined, 'Poll started.');

        // free for gc
        channel = null;
        answers = null;
        callback = null;
    });
};
