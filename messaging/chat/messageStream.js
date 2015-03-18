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
    this.pipes = pipes || [];
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
    this.pipes.push(pipe);
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
MessageStream.prototype.run = function (_pipe) {
    var pipe = _pipe || 0;
    var self = this;

    // If we reached the end of the pipes, we're done! Trim off empty
    // strings or nullish values that may have arisen.
    if (pipe >= this.pipes.length) {
        return this.emit('end', _.filter(this.data));
    }


    // Keep the number of callbacks to go until we're done with the
    // current pipe. After the end, we'll "start" on the next level.
    var waiting = this.data.length;
    // Store the data and clear "this" data, as we'll
    // rebuilt it from the transform.
    var data = this.data;
    this.data = [];
    // Context object the transform will be run in.
    // Extend the local context atop of it.
    var cb = {};
    for (var key in this.context) {
        cb[key] = this.context[key];
    }

    /**
     * When "next" is called we'll assume the processing for a particular
     * chunk is complete, and we'll start the next pipe if necessary.
     * @param  {*}   err
     */
    cb.next = function (err) {
        // Don't do anything if we're aborted.
        if (self.aborted) {
            return cb;
        }
        // On errors, just abort the parsing. We'll assume the pipe
        // handler
        if (err) {
            self.abort(err);
            return cb;
        }
        // Start the next pipe if we're done this "level"
        if (--waiting === 0) {
            self.run(pipe + 1);
        }

        return cb;
    };
    /**
     * Pushes new data to be passed on to the next pipe level.
     * @param  {*} data
     */
    cb.push = function (data) {
        self.data.push(data);
        return cb;
    };


    // Now loop through all the data. Skip any items that aren't strings,
    // as they must have already been parsed into objects.
    for (var i = 0; i < data.length; i++) {
        this.pipes[pipe].call(cb, data[i]);
    }
};

module.exports = MessageStream;
