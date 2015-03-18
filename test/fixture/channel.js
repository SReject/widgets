var sinon = require('sinon');

module.exports = function () {
    return {
        getId: sinon.stub().returns(1337),
        broadcast: sinon.spy(),
        sendChatMessage: sinon.spy()
    };
};
