var expect = require('chai').expect;
var sinon = require('sinon');

describe('chat starting', function () {
    var start = require('../chat/start');

    it('sends the completion message', function () {
        start.results(this.channel, { user: 'connor4312' });
        expect(this.channel.sendChatMessage.calledWith({
            username: 'GiveawayBot',
            id: -1,
            role: 'Admin'
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
});
