var Readable = require('stream').Readable;
var chat = module.exports = {};
var pipes = [];

/**
 * Adds a new function to message transform list. Messages will be
 * pushed down word-by-word through the stream. You'll probably prefer
 * using through2 for generating transforms.
 * @param  {Object} transform
 */
chat.addPipe = function (transform) {
    pipes.push(transform);
};

chat.pipeMess
