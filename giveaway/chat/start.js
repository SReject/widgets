var config = require('./config');
var clip = require('../../clip');
var start = module.exports = {};

/**
 * Triggered when a user enters /giveaway. We'll chose someone and emit
 * events to the other chat servers for a brief countdown.
 * @param  {Object} channel
 * @param  {Object} user
 * @param  {Array} args
 * @param  {Function} next
 */
start.hook = function (user, args, callback) {
    var channel = user.getChannel();

    // I know order by rand() is evil, but we're doing it on a relatively
    // small dataset, and there's not much of a better way :/
    clip.mysql.query(
        'SELECT userName FROM ( ' +
            'SELECT DISTINCT userName FROM chat_user ' +
            'WHERE online = 1 AND expires > NOW() AND channel = ?' +
        ') as t ORDER BY RAND() LIMIT 1; ', [channel.getId()],
        function (err, result) {
            if (err || !result.length) {
                return callback('An unknown error occurred!');
            }

            // And start the countdown!
            start.countdown(channel, {
                user: result[0].userName,
                endsAt: Date.now() + 1000 * config.countdown
            });

            callback(null, 'Starting a giveaway');
        }
    );
};

/**
 * Sends a countdown message down
 * @param  {Object} channel
 * @param  {Object} data
 */
start.countdown = function (channel, data) {
    var seconds = Math.round((data.endsAt - Date.now()) / 1000);
    // Check if we reached the end of the countdown...
    if (seconds < 1) {
        return start.results(channel, data);
    }

    // Otherwise just send a countdown message.
    start.message(channel, 'Giveaway in ' + seconds + '...');

    setTimeout(start.countdown.bind(null, channel, data), 1000);
};

/**
 * Sends the results of who won the giveaway.
 * @param  {Object} channel
 * @param  {Object} data
 */
start.results = function (channel, data) {
    start.message(channel, '@' + data.user + ' won the giveaway!');
};

/**
 * Sends a message from a fake GiveawayBot user.
 * @param  {Object} channel
 * @param  {String} body
 */
start.message = function (channel, body) {
    channel.sendMessageRaw({
        getUsername: () => 'GiveawayBot',
        getId: () => -1,
        getRoles: () => ['Admin']
    }, { meta: {avatar: "/_latest/img/beam-ball-small.png"}, message: body });
};

