var expect = require('chai').expect;
var sinon = require('sinon');

describe('slowchat', function () {
    var slowchat = require('../chat/slowchat');
    var config = require('../chat/config');
    var clock;

    beforeEach(function () {
        clock = sinon.useFakeTimers();
        slowchat.bind(this.channel);
    });
    afterEach(function () {
        this.channel.emit('destroy');
        clock.restore();
    });

    describe('get durations', function () {
        it('gets default', function () {
            expect(slowchat.getDuration(this.channel)).to.equal(config.defaultSlowchat);
        });
        it('overrides', function () {
            this.channel.preferences['channel:slowchat'] = 1234;
            expect(slowchat.getDuration(this.channel)).to.equal(1234);
        });
    });

    describe('binds to channel', function () {

        it('updates on chat message', function () {
            expect(this.channel.lastUserMessage.i42).to.be.undefined;
            this.channel.emit('ChatMessage', { user_id: 42 });
            expect(this.channel.lastUserMessage.i42).to.equal(Date.now());
        });

        it('cleans out old people from list', function () {
            clock.tick(config.trimInterval - 1);
            this.channel.lastUserMessage.i1 = Date.now() - (config.defaultSlowchat * 2);
            this.channel.lastUserMessage.i2 = Date.now() - (config.defaultSlowchat * 0.5);
            this.channel.lastUserMessage.i3 = Date.now() - (config.defaultSlowchat * 0);
            clock.tick(2);
            expect(this.channel.lastUserMessage).to.have.all.keys(['i2', 'i3']);
        });
    });

    describe('pipe', function () {
        it('allows first message', function (done) {
            var channel = this.channel;

            slowchat.pipe.call(this, 'foo', function (err, data) {
                expect(err).not.to.be.defined;
                expect(data).to.equal('foo');
                done();
            });
        });

        it('disallows slowchat when just sent', function (done) {
            this.channel.lastUserMessage.i42 = Date.now() - (config.defaultSlowchat / 2);

            slowchat.pipe.call(this, 'foo', function (err, data) {
                expect(err).to.be.defined;
                done();
            });
        });

        it('allows chat when old', function (done) {
            var channel = this.channel;
            channel.lastUserMessage.i42 = Date.now() - (config.defaultSlowchat * 2);

            slowchat.pipe.call(this, 'foo', function (err, data) {
                expect(err).not.to.be.defined;
                expect(data).to.equal('foo');
                done();
            });
        });
    });
});
