var sinon = require('sinon');

module.exports = function () {
    return {
        increment: sinon.stub(),
        decrement: sinon.stub(),
        gauge: sinon.stub()
    };
};
