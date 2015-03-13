var Bluebird = require('bluebird');
var sinon = require('sinon');
var expect = require('chai').expect;

describe('poll chat', function () {
    describe('utils', function () {
        var util = require('../chat/util');

        it('detects has vote when not expired', function () {
            this.channel._ongoing_vote = Date.now() + 10000;
            expect(util.hasVote(this.channel)).to.be.true;
        });

        it('detects does not have vote when expired', function () {
            this.channel._ongoing_vote = Date.now() - 10000;
            expect(util.hasVote(this.channel)).to.be.false;
        });

        it('detects does not have vote when undef', function () {
            expect(util.hasVote(this.channel)).to.be.false;
        });

        it('generates voters slug', function () {
            expect(util.votersSlug(this.channel)).to.equal('chat:1337:widget:poll:voters');
        });

        it('generates response slug', function () {
            expect(util.responseSlug(this.channel)).to.equal('chat:1337:widget:poll:responses');
        });
    });

    describe('vote', function () {
        beforeEach(function () {
            this.channel._ongoing_vote = Date.now() + 10000;
        });

        var vote = require('../chat/vote');
        it('denies when no ongoing vote', function (done) {
            this.channel._ongoing_vote = Date.now() - 10000;
            vote(this.user, [1], function (err) {
                expect(err).to.equal('There\'s no vote right now!');
                done();
            });
        });

        it('denies when already voted', function (done) {
            var stub = this.redis.sismemberAsync = sinon.stub().returns(Bluebird.resolve(true));
            vote(this.user, [1], function (err) {
                expect(stub.calledWith('chat:1337:widget:poll:voters', 42)).to.be.true;
                expect(err).to.equal('You already voted in this poll.');
                done();
            });
        });

        it('allows when not voted', function (done) {
            var stub = this.redis.sismemberAsync = sinon.stub().returns(Bluebird.resolve(false));
            var hincrby = this.redis.HINCRBY = sinon.stub().returns(this.redis);
            var sadd = this.redis.SADD = sinon.stub().returns(this.redis);

            vote(this.user, [1], function (err) {
                expect(stub.calledWith('chat:1337:widget:poll:voters', 42)).to.be.true;
                expect(hincrby.calledWith('chat:1337:widget:poll:responses', 1, 1)).to.be.true;
                expect(sadd.calledWith('chat:1337:widget:poll:voters', 42)).to.be.true;
                expect(err).not.to.be.defined;
                done();
            });
        });
    });

    describe('events', function () {
        var events = require('../chat/events');
        it('starts a chat poll', function () {
            events.start(this.channel, { endsAt: 'eternity' });
            expect(this.channel._ongoing_vote).to.equal('eternity');
            expect(this.channel.broadcast.calledWith('PollStart', { endsAt: 'eternity' })).to.be.true;
        });
        it('ends a chat poll', function () {
            this.channel._ongoing_vote = Date.now();
            events.end(this.channel, { foo: 1 });
            expect(this.channel._ongoing_vote).to.be.zero;
            expect(this.channel.broadcast.calledWith('PollEnd', { foo: 1 })).to.be.true;
        });
    });

    describe('starting', function () {
        var start = require('../chat/start');

        describe('validation', function () {
            it('allows good', function () {
                expect(start.validate(this.channel, 'One or two?', [1, 2], 30)).to.be.undefined;
            });
            it('disallows lack of options', function () {
                expect(start.validate(this.channel, 'One or two?', [1], 30)).not.to.be.undefined;
            });
            it('disallows too many options', function () {
                expect(start.validate(this.channel, 'One or two?', [1, 2, 3, 4, 5, 6, 7], 30)).not.to.be.undefined;
            });
            it('disallows silly options', function () {
                expect(start.validate(this.channel, 'One or two?', 'fubar', 30)).not.to.be.undefined;
            });
            it('disallows no question', function () {
                expect(start.validate(this.channel, '!', [1, 2], 30)).not.to.be.undefined;
            });
            it('disallows long question', function () {
                expect(start.validate(this.channel, new Array(500).join('lul'), [1, 2], 30)).not.to.be.undefined;
            });
            it('disallows silly question', function () {
                expect(start.validate(this.channel, [], [1, 2], 30)).not.to.be.undefined;
            });
            it('disallows short duration', function () {
                expect(start.validate(this.channel, 'One or two?', [1, 2], 1)).not.to.be.undefined;
            });
            it('disallows long duration', function () {
                expect(start.validate(this.channel, 'One or two?', [1, 2], 1 << 15)).not.to.be.undefined;
            });
            it('disallows silly duration', function () {
                expect(start.validate(this.channel, 'One or two?', [1, 2], 'pineapples')).not.to.be.undefined;
            });
            it('disallows ongoing vote', function () {
                this.channel._ongoing_vote = Date.now() + 10000;
                expect(start.validate(this.channel, 'One or two?', [1, 2], 30)).not.to.be.undefined;
            });
        });

        it('sets up redis correctly', function (done) {
            var hmset = this.redis.hmset = sinon.stub().returns(this.redis);
            var sadd = this.redis.sadd = sinon.stub().returns(this.redis);
            var pexpire = this.redis.pexpire = sinon.stub().returns(this.redis);

            start.setupRedis(this.channel, ['foo', 'bar'], 30, function (err) {
                expect(err).to.be.undefined;
                expect(hmset.calledWith('chat:1337:widget:poll:responses', { '0': 0, '1': 0 })).to.be.true;
                expect(pexpire.calledWith('chat:1337:widget:poll:responses', 31000)).to.be.true;
                expect(sadd.calledWith('chat:1337:widget:poll:voters', '#')).to.be.true;
                expect(pexpire.calledWith('chat:1337:widget:poll:voters', 30000)).to.be.true;
                done();
            });
        });
    });
});
