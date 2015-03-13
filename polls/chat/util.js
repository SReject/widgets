/**
 * Gets the redis slug to store poll data in for a channel .
 * @param  {Object} channel
 * @return {String}
 */
module.exports.responseSlug = function (channel) {
    return ['chat', channel.getId(), 'widget:poll:responses'].join(':');
};

/**
 * Gets the redis slug to store a list of voters.
 * @param  {Object} channel
 * @return {String}
 */
module.exports.votersSlug = function (channel) {
    return ['chat', channel.getId(), 'widget:poll:voters'].join(':');
};

/**
 * Returns whether the channel has an ongoing vote, or not.
 * @param  {Object}  channel
 * @return {Boolean}
 */
module.exports.hasVote = function (channel) {
    return channel._ongoing_vote > Date.now();
};
