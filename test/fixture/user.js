var sinon = require('sinon');

module.exports = function (channel) {
    return {
        getChannel: sinon.stub().returns(channel),
        getId: sinon.stub().returns(42),
        permissions: [],
        hasPermission: function (p) { return this.permissions.indexOf(p) !== -1; }
    };
};
