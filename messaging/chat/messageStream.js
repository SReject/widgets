var events = require('events');
var util = require('util');
var _ = require('lodash');

/**
 * Readable-stream-like implementation that streams strings instead of
 * buffers, since buffer manipulation is currently terribly slow.
 * @param {String[]} data
 * @param {Function[]} pipes
 */
function MessageStream (data, pipes) {
    events.EventEmitter.call(this);
    this.data = data || [];
    this.transforms = pipes || [];
    this.aborted = false;
    this.context = { stream: this };
}
util.inherits(MessageStream, events.EventEmitter);

/**
 * Updates the context in which piped functions are run.
 * @param {Object} context
 */
MessageStream.prototype.setContext = function (context) {
    _.extend(this.context, context);
};

/**
 * Adds a new pipe filter to the message stream.
 * @param {Function} pipe
 * @return {MessageStream}
 */
MessageStream.prototype.pipe = function (pipe) {
    this.transforms.push(pipe);
    return this;
};

/**
 * Returns the data array.
 * @return {Array}
 */
MessageStream.prototype.getData = function () {
    return this.data;
};

/**
 * Pushes new data onto the message stream.
 * @param  {String} data
 * @return {MessageStream}
 */
MessageStream.prototype.push = function (data) {
    this.data.push(data);
    return this;
};

/**
 * Halts parsing and emits an "aborted" event.
 * @param  {*} err
 */
MessageStream.prototype.abort = function (err) {
    this.aborted = true;
    this.emit('aborted', err);
};

/**
 * Sends out data through attached pipes.
 */
MessageStream.prototype.run = function (idx) {
    var transform = idx || 0;
    var self = this;

    // If we reached the end of the pipes, we're done! Trim off empty
    // strings or nullish values that may have arisen.
    if (transform >= this.transforms.length) {
        return this.emit('end', _.filter(this.data));
    }


    // Keep the number of callbacks to go until we're done with the
    // current pipe. After the end, we'll "start" on the next level.
    var waiting = this.data.length;
    if (waiting === 0) {
        return this.run(transform + 1);
    }

    this.transforms[transform].call(this.context, this.data, function (err, data) {
        // On errors, just abort the parsing. We'll assume the pipe
        // handler
        if (err) {
            self.abort(err);
        } else {
            self.data = data;
            self.run(transform + 1);
        }
    });
};

module.exports = MessageStream;
