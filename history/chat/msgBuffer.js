'use strict';

const _ = require('lodash');

class ChannelHistory extends Array {
    constructor(maxLength) {
        super();
        this.maxLength = maxLength;
    }

    push(msg) {
        if (this.length >= this.maxLength) {
            this.shift();
        }

        Array.prototype.push.call(this, msg);
    }

    getMessage(id) {
        return _.find(this, { id });
    }

    remove(id) {
        _.remove(this, msg => msg.id === id);
    }
}

module.exports = ChannelHistory;