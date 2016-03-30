var EventEmitter = require('events').EventEmitter;
var sinon = require('sinon');

module.exports = function (channel) {
    var user = new EventEmitter();
    user.getChannel = sinon.stub().returns(channel);
    user.getId = sinon.stub().returns(42);
    user.getUsername = sinon.stub().returns('connor4312');
    user.getRoles = sinon.stub().returns(['Developer', 'User']);
    user.permissions = [];
    user.hasPermission = function (p) { return this.permissions.indexOf(p) !== -1; };

    return user;
};
