var expect = require('chai').expect;
var sinon = require('sinon');

describe('slowchat', function () {
    var Slowchat = require('../chat/slowchat');
    var config = require('../chat/config');
    var clock;

    beforeEach(function () {
        clock = sinon.useFakeTimers();
    });
    afterEach(function () {
        this.channel.emit('destroy');
        clock.restore();
    });

    describe('get durations', function () {
        it('gets default', function () {
            var slowchat = Slowchat.pipe(this.channel);
            expect(slowchat.duration).to.equal(config.defaultSlowchat);
        });
        it('overrides', function () {
            this.channel.preferences['channel:slowchat'] = 1234;
            var slowchat = Slowchat.pipe(this.channel);
            expect(slowchat.duration).to.equal(1234);
        });
    });

    describe('binds to channel', function () {

        it('updates on chat message', function () {
            Slowchat.pipe(this.channel).boot();
            expect(this.channel.lastUserMessage.i42).to.be.undefined;
            this.channel.emit('ChatMessage', { user_id: 42 });
            expect(this.channel.lastUserMessage.i42).to.equal(Date.now());
        });

        it('cleans out old people from list', function () {
            Slowchat.pipe(this.channel).boot();

            clock.tick(config.trimInterval - 2);
            this.channel.lastUserMessage.i1 = Date.now() - (config.defaultSlowchat * 2);
            this.channel.lastUserMessage.i2 = Date.now() - (config.defaultSlowchat * 0.5);
            this.channel.lastUserMessage.i3 = Date.now() - (config.defaultSlowchat * 0);
            clock.tick(4);
            expect(this.channel.lastUserMessage).to.have.all.keys(['i2', 'i3']);
        });
    });

    describe('pipe', function () {
        it('allows first message', function (done) {
            var channel = this.channel;


            var slowchat = Slowchat.pipe(this.channel).boot();
            slowchat.run(this.user, 'foo', function (err, data) {
                expect(err).not.to.be.defined;
                expect(data).to.equal('foo');
                done();
            });
        });

        it('disallows slowchat when just sent', function (done) {
            var slowchat = Slowchat.pipe(this.channel).boot();
            this.channel.lastUserMessage.i42 = Date.now() - (config.defaultSlowchat / 2);

            slowchat.run(this.user, 'foo', function (err, data) {
                expect(err).to.be.defined;
                done();
            });
        });

        it('allows when can bypass', function (done) {
            var slowchat = Slowchat.pipe(this.channel).boot();
            this.user.permissions.push('bypass_slowchat');
            this.channel.lastUserMessage.i42 = Date.now() - (config.defaultSlowchat / 2);

            slowchat.run(this.user, 'foo', function (err, data) {
                expect(err).not.to.be.defined;
                expect(data).to.equal('foo');
                done();
            });
        });

        it('allows chat when old', function (done) {
            var slowchat = Slowchat.pipe(this.channel).boot();
            this.channel.lastUserMessage.i42 = Date.now() - (config.defaultSlowchat * 2);

            slowchat.run(this.user, 'foo', function (err, data) {
                expect(err).not.to.be.defined;
                expect(data).to.equal('foo');
                done();
            });
        });
    });
});
