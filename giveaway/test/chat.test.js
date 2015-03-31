var expect = require('chai').expect;
var sinon = require('sinon');

describe('giveaway starting', function () {
    var start = require('../chat/start');
    var clip = require('../../clip');

    it('sends the completion message', function () {
        start.results(this.channel, { user: 'connor4312' });
        expect(this.channel.sendMessage.calledWith({
            username: 'GiveawayBot',
            id: -1,
            roles: ['Admin']
        }, 'connor4312 won the giveaway!')).to.be.true;
    });

    it('sends results at end of countdown', function () {
        var stub = sinon.stub(start, 'results');

        var data = { user: 'connor4312', endsAt: Date.now() };
        start.countdown(this.channel, data);
        expect(stub.calledWith(this.channel, data)).to.be.true;

        stub.restore();
    });

    it('otherwise sends a message and waits', function () {
        var messageStub = sinon.stub(start, 'message');
        var resultStub = sinon.stub(start, 'results');
        var clock = sinon.useFakeTimers();

        var data = { user: 'connor4312', endsAt: Date.now() + 1000 };
        start.countdown(this.channel, data);
        expect(resultStub.called).to.be.false;
        expect(messageStub.calledWith(this.channel, 'Giveaway in 1...')).to.be.true;
        clock.tick(1001);
        expect(resultStub.calledWith(this.channel, data)).to.be.true;

        messageStub.restore();
        resultStub.restore();
        clock.restore();
    });

    describe('hook', function () {
        beforeEach(function () {
            sinon.stub(start, 'countdown');
        });
        afterEach(function () {
            start.countdown.restore();
        });

        it('errors with no results', function (done) {
            clip.mysql = { query: function (query, args, cb) {
                expect(args).to.deep.equal([1337]);
                cb(null, []);
            }};

            start.hook(this.user, [], function (err) {
                expect(err).to.be.defined;
                expect(start.countdown.called).to.be.false;
                done();
            });
        });

        it('calls when successful', function (done) {
            clip.mysql = { query: function (query, args, cb) {
                expect(args).to.deep.equal([1337]);
                cb(null, [{}]);
            }};

            start.hook(this.user, [], function (err) {
                expect(err).not.to.be.defined;
                expect(start.countdown.called).to.be.true;
                done();
            });
        });
    });
});
