/**
 * Handles a new creation poll event. It attaches an _ongoing_vote vote
 * to the channel object for use later, and broadcasts to users.
 * @param  {Object} channel
 * @param  {Object} data
 */
module.exports.start = function (channel, data) {
    channel._ongoing_vote = data.endsAt;
    channel.broadcast('PollStart', data);
};
/**
 * Handles a new creation poll completion event. Resets the
 * _ongoing vote, and broadcasts to users.
 * @param  {Object} channel
 * @param  {Object} data
 */
module.exports.end = function (channel, data) {
    channel._ongoing_vote = 0;
    channel.broadcast('PollEnd', data);
};
