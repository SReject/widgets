var sinon = require('sinon');

module.exports = function (redis) {
    return {
        getRedis: sinon.stub().returns(redis),
        getId: sinon.stub().returns(1337),
        broadcast: sinon.spy(),
        sendChatMessage: sinon.spy()
    };
};
