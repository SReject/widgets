var _ = require('lodash');
var clip = require('../../clip');
var Bluebird = require('bluebird');
var request = require('../../util/request');

var prefix = ':';
var postfix = 'inaspacesuit';

function InASpaceSuitPipe() {
}

/**
 * Pipe function for :[username]inaspacesuit emoticon, expects to come after words have been split.
 * @param  {Object}   messageObj
 * @param  {Function} callback
 */
InASpaceSuitPipe.prototype.run = function (user, messageObj, callback) {
    var message = messageObj.message;
    var todo = [];
    for (var i = 0, l = message.length; i < l; i++) {
        if (typeof message[i] === 'string') {
            if (this.isInASpaceSuit(message[i])) {
                var username = this.getUsername(message[i]);
                insertSpacesuitObject.call(this, i, username);
            }
        }
    }

    // Keep this function separate to retain the index in the previous loop.
    function insertSpacesuitObject (index, username) {
        todo.push(
            this.findUserId(username)
            .then(function (userId) {
                if (!userId) return;
                message[index] = {
                    type: 'inaspacesuit',
                    username: username,
                    userId: userId,
                    text: message[index]
                };
            })
        );
    }

    Bluebird.all(todo)
    .finally(function () {
        messageObj.message = message;
        callback(undefined, messageObj);
    });
};

InASpaceSuitPipe.prototype.isInASpaceSuit = function (string) {
    return (_.startsWith(string, prefix) && _.endsWith(string, postfix));
};

InASpaceSuitPipe.prototype.getUsername = function (string) {
    var usernameLength = string.length - prefix.length - postfix.length;
    return string.substr(1, usernameLength);
};

InASpaceSuitPipe.prototype.findUserId = function (username) {
    return request.run({
        url: clip.config.beam + '/api/v1/users/search',
        json: true,
        qs: { query: username }
    }).catch(function (err) {
        // catch errors within the request and return as 503s
        return [{ statusCode: 503, body: err }, null];
    }).spread(function (response, results) {
        if (response.statusCode !== 200) {
            clip.log.warn('Errorful response from API when searching users', {
                code: response.statusCode,
                body: response.body
            });

            return;
        }

        for (var i = 0; i < results.length; i++) {
            var user = results[i];
            if (user.username.toLowerCase() === username.toLowerCase()) {
                return user.id;
            }
        }

        return;
    });
};

module.exports = InASpaceSuitPipe;
