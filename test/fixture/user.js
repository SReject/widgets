var sinon = require('sinon');

module.exports = function (channel) {
    return {
        getChannel: sinon.stub().returns(channel),
        getId: sinon.stub().returns(42)
    };
};
