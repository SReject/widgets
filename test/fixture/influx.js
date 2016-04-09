const Bluebird = require('bluebird');
const sinon = require('sinon');

module.exports = function () {
    return {
        writePoint: sinon.stub(),
        writePointAsync: sinon.stub().returns(Bluebird.resolve()),
        writeSeries: sinon.stub(),
        writeSeriesAsync: sinon.stub().returns(Bluebird.resolve()),
    };
};
