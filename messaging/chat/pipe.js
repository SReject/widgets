var MessageStream = require('./messageStream');
var pipe = module.exports = {};
var pipes = [];

/**
 * Adds a new function to message transform list. It's similar to standard
 * streams - it should take arguments (str, next) and invoke next
 * with the parsed word.
 * @param  {Function} transform
 */
pipe.add = function (transform) {
    pipes.push(transform);
};

/**
 * Pipes a message through our transform streams.
 * @param  {String} message
 * @return {stream.Readable}
 */
pipe.message = function (message) {

};

/**
 * Takes a message string and splits it into an array of words and spaces,
 * sending chunks down the pipe as we parse.
 * @param  {String} message
 * @return {String[]}
 */
pipe.splitWords = function (message, stream) {
    var lastWasSpace = message[0] !== ' ';
    var building = '';
    for (var i = 0; i < message.length; i++) {
        if ((!lastWasSpace && message[i] === ' ') || (lastWasSpace && message[i] !== ' ')) {
            stream.push(building);
            lastWasSpace = !lastWasSpace;
            building = '';
        }

        building += message[i];
    }

    stream.push(building);
};
