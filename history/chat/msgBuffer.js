'use strict';

const _ = require('lodash');

/**
 * Array like to store a channel's chat history.
 */
class ChannelHistory {
    /**
     * @param  {Number} maxLength Maximum length of the history.
     */
    constructor(maxLength) {
        this.container = [];
        this.maxLength = maxLength || 50;
    }
    /**
     * Push a message on the array.
     * @param  {Object} msg The message object.
     */
    push(msg) {
        if (this.container.length >= this.maxLength) {
            this.container.shift();
        }

        this.container.push(msg);
    }

    /**
     * Retrieve a message from the array (by id).
     * @param  {String} id A unique messageID
     * @return {Message}
     */
    getMessage(id) {
        return _.find(this.container, { id });
    }

    /**
     * Removes a message from the array (by id).
     * @param  {String} id The messageID
     */
    remove(id) {
        this.container = _.reject(this.container, { id });
    }
}

module.exports = ChannelHistory;
