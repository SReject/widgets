'use strict';


/**
 * Data is debounced and written to Influx in batches. batchInterval specifies
 * the duration over which points should be queued.
 * @type {Number}
 */
const batchInterval = 2000;

/**
 * Stats hooks on to messages and collects interesting data about them.
 */
module.exports = class Stats {

    /**
     * Creates a new stats instances that sends data to the influx connection.
     * @param  {InfluxDB} influx
     * @param  {Bunyan} log
     */
    constructor(influx, log) {
        this._influx = influx;
        this._log = log;
        this._resetQueue();
    }

    /**
     * Schedules a point for writing to InfluxDB.
     * @param  {String} series
     * @param  {Object.<String, String>} tags
     * @param  {Object.<String, *>} values
     * @see https://github.com/node-influx/node-influx#writeseries for format
     */
    _write(series, tags, values) {
        let data = this._queue.points[series];
        if (!data) {
            data = this._queue.points[series] = [];
        }

        data.push([values, tags]);
        this._scheduleWrite(batchInterval);
    }

    /**
     * ScheduleWrite propagates _queue.timeout with a timeout function that'll
     * write and clear the points in the queue after the specified interval.
     * @param {Number} interval
     * @see batchInterval
     */
    _scheduleWrite(interval) {
        if (this._queue.timeout !== null) {
            return;
        }

        this._queue.timeout = setTimeout(() => {
            this._influx.writeSeries(this._queue.points, (err) => {
                if (err) this._log.error(err, 'widgets/stats: could not write data to influx');
            });

            this._resetQueue();
        }, interval);
    }

    /**
     * Initializes the stored _queue with the default values, so that the
     * next call to _write will schedule a batch write an add a the first
     * point in the queue batch.
     */
    _resetQueue() {
        this._queue = { points: {}, timeout: null };
    }

    /**
     * Implements Messaging.Transform, and is called right before a message
     * gets dispatched over the socket. This grabs stats:
     *  - about the total message length, relating it to the channel and sender
     *  - about the emojis used, again relating it to the channel and sender
     *
     * @param  {User}     user
     * @param  {Object}   data
     * @param  {Function} callback
     */
    pipe(user, data, callback) {
        const emojis = {};
        let length = 0;

        // Loop through components of the message. Count up the emojis used
        // as well as the message's total length.
        data.message.forEach(m => {
            switch (m.type) {
            case 'emoticon':
                emojis[m.text] = (emojis[m.text] || 0) + 1;
                length += m.text.length;
                return;
            case 'text':
                length += m.data.length;
                break;
            }
        });

        this._write('messages', {}, {
            length,
            count: 1,
            user: user.getId(),
            channel: user.getChannel().getId(),
        });

        Object.keys(emojis).forEach(emoji => {
            this._write('emojis', { emoji }, {
                count: emojis[emoji],
                user: user.getId(),
                channel: user.getChannel().getId(),
            });
        });

        callback(undefined, data);
    }
}
