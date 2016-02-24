'use strict';

const _ = require('lodash');

class ChannelHistory extends Array {
    constructor(maxLength) {
        super();
        this.maxLength = maxLength || 50;
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
        const i = _.find(this, { id });
        this.splice(i, 1);
    }
}

module.exports = ChannelHistory;