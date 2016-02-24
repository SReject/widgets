'use strict';

const _ = require('lodash');

/**
 * Array like to store a channel's chat history.
 */
class ChannelHistory extends Array {
    /**
     * @param  {Number} maxLength Maximum length of the history.
     */
    constructor(maxLength) {
        super();
        this.maxLength = maxLength || 50;
    }
    /**
     * Push a message on the array.
     * @param  {Object} msg The message object.
     */
    push(msg) {
        if (this.length >= this.maxLength) {
            this.shift();
        }

        Array.prototype.push.call(this, msg);
    }

    /**
     * Retrieve a message from the array (by id).
     * @param  {String} id A unique messageID
     * @return {Message}
     */
    getMessage(id) {
        return _.find(this, { id });
    }

    /**
     * Removes a message from the array (by id).
     * @param  {String} id The messageID
     */
    remove(id) {
        const i = _.find(this, { id });
        this.splice(i, 1);
    }
}

module.exports = ChannelHistory;
