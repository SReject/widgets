var Bluebird = require('bluebird');

var random = require('../../util/random');
var clip = require('../../clip');

var counter = module.exports = {};

var WORKERS_SET = 'chat:workers';
var HASH_PREFIX = 'chat:anoncount:';
var HASH_EXPIRY = 5 * 60;

// Generate a random ID for this process' chat hash.
var uniqId = random.alphanum(16);

/**
 * Initializes the counter system after the chat server has booted.
 */
counter.init = function () {
    removeStaleWorkers().then(function () {
        return initWorker();
    }).catch(function (err) {
        clip.log.error('Failed to add the anonymous counter.', err);
    });
};

/**
 * Adds the user to the user count.
 * @param {User} user
 */
counter.addUser = function (user) {
    // Don't count logged in users here
    if (!user.isAnon) {
        return;
    }
    var cId = user.getChannel().id;

    clip.redis.hincrbyAsync([
        getHashName(),
        cId,
        1
    ]).catch(handleError);
};

/**
 * Removes the user from the user count if they're anonymous.
 * @param  {User} user
 */
counter.removeUser = function (user) {
    // Don't count logged in users here
    if (!user.isAnon) {
        return;
    }
    var cId = user.getChannel().id;

    clip.redis.hincrbyAsync([
        getHashName(),
        cId,
        -1
    ]).catch(handleError);
};

/**
 * Returns the name of the current workers' hash in Redis.
 * @return {String}
 */
function getHashName () {
    return HASH_PREFIX + uniqId;
}

/**
 * Verifies that all workers exist, removes one if it doesn't.
 */
function removeStaleWorkers () {
    return clip.redis.smembersAsync(WORKERS_SET)
    .then(function (workers) {
        return Bluebird.all(workers.map(function (w) {
            return clip.redis.existsAsync(w);
        })).then(function (exists) {
            var toRemove = [];
            exists.forEach(function (exist, i) {
                if (exist !== 1) {
                    toRemove.push(clip.redis.sremAsync(WORKERS_SET, workers[i]));
                }
            });

            return Bluebird.all(toRemove);
        });
    });
}

/**
 * Initializes the worker and its hash. Also sets up the expiry interval.
 */
function initWorker () {
    // Add the worker to the set of workers and create the hash
    return Bluebird.all([
        clip.redis.saddAsync(WORKERS_SET, getHashName()),
        clip.redis.hsetAsync(getHashName(), 'alive', 1)
    ]).then(function () {
        setInterval(function () {
            clip.redis.expireAsync(getHashName(), HASH_EXPIRY)
            .catch(function (err) {
                clip.log.error('Failed to set expiry on worker hash',
                    { hash: getHashName(), error: err });
            });
        }, HASH_EXPIRY * 1000);
    });
}

/**
 * Handles the errors that could occur after an event listener fires.
 * @param  {Error} err
 */
function handleError (err) {
    clip.log.error('Failed to edit the anonimous count.', err);
}
