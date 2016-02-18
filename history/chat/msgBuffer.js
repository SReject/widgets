'use strict';

class MsgBuffer extends Array {
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
}

module.exports = MsgBuffer;