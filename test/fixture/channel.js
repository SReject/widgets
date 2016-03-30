var EventEmitter = require('events').EventEmitter;
var sinon = require('sinon');

module.exports = function () {
    var channel = new EventEmitter();
    channel.getId = sinon.stub().returns(1337);
    channel.broadcast = sinon.spy();
    channel.sendMessage = sinon.spy();
    channel.sendMessageRaw = sinon.spy();
    channel.preferences = {};
    channel.getPreferences = function (e) { return channel.preferences[e]; };

    return channel;
};
