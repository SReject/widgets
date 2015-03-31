var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');

describe('messaging chat', function () {
    describe('transforms', function () {
        var transforms = require('../chat/transforms');
        var MessageStream = require('../chat/messageStream');
        var stream;

        beforeEach(function () {
            stream = new MessageStream();
        });

        describe('identity', function () {
            it('works', function (done) {
                stream.on('end', function (out) {
                    expect(out).to.deep.equal(['lorem ipsum', 'dolor']);
                    done();
                });
                stream.push('lorem ipsum');
                stream.push('dolor');
                stream.pipe(transforms.identity);
                stream.run();
            });
        });

        describe('finalize', function () {
            it('works on single strings', function (done) {
                stream.on('end', function (out) {
                    expect(out).to.deep.equal([{ type: 'text', data: 'lorem ipsum' }]);
                    done();
                });
                stream.push('lorem ipsum');
                stream.pipe(transforms.finalize);
                stream.run();
            });

            it('works on seperate strings', function (done) {
                stream.on('end', function (out) {
                    expect(out).to.deep.equal([{ type: 'text', data: 'lorem ipsum dolor' }]);
                    done();
                });
                stream.push('lorem ipsum');
                stream.push(' dolor');
                stream.pipe(transforms.finalize);
                stream.run();
            });

            it('works on mixed data', function (done) {
                stream.on('end', function (out) {
                    expect(out).to.deep.equal([
                        { type: 'text', data: 'lorem ipsum' },
                        { foo: 'bar' },
                        { type: 'text', data: 'sit dolor' }
                    ]);
                    done();
                });
                stream.push('lorem ipsum');
                stream.push({ foo: 'bar' });
                stream.push('sit');
                stream.push(' dolor');
                stream.pipe(transforms.finalize);
                stream.run();
            });
        });

        describe('splitWords', function () {

            it('works on empty', function (done) {
                stream.on('end', function (out) {
                    expect(out).to.deep.equal([]);
                    done();
                });
                stream.pipe(transforms.splitWords);
                stream.run();
            });

            it('works on basic', function (done) {
                stream.on('end', function (out) {
                    expect(out).to.deep.equal(['lorem', ' ', 'ipsum', ' ', 'dolor']);
                    done();
                });
                stream.push('lorem ipsum dolor');
                stream.pipe(transforms.splitWords);
                stream.run();
            });

            it('works with trailing spaces', function (done) {
                stream.on('end', function (out) {
                    expect(out).to.deep.equal(['   ', 'helloo', '   ']);
                    done();
                });
                stream.push('   helloo   ');
                stream.pipe(transforms.splitWords);
                stream.run();
            });

            it('works with multiple spaces', function (done) {
                stream.on('end', function (out) {
                    expect(out).to.deep.equal(['   ', 'helloo', '  ', 'world', ' ']);
                    done();
                });
                stream.push('   helloo  world ');
                stream.pipe(transforms.splitWords);
                stream.run();
            });

            it('works with nested and objects', function (done) {
                stream.on('end', function (out) {
                    expect(out).to.deep.equal(['a', ' ', 'b', 'c', {}, ' ', 'd', ' ', 'e']);
                    done();
                });
                stream.push('a b');
                stream.push('c');
                stream.push({});
                stream.push(' d e');
                stream.pipe(transforms.splitWords);
                stream.run();
            });
        });
    });

    describe('message streaming', function () {
        var MessageStream = require('../chat/messageStream');
        var stream;

        beforeEach(function () {
            stream = new MessageStream(['lorem', 'ipsum', 'dollarz']);
        });

        it('pipes through transforms', function (done) {
            stream.on('end', function (out) {
                expect(out).to.deep.equal(['dollarz', 'ipsum', 'lorem']);
                done();
            });
            stream.pipe(function (data, cb) { cb(null, data.reverse()); }).run();
        });

        it('aborts when an error is thrown', function (done) {
            stream.on('aborted', function (err) {
                expect(err).to.equal('err!');
                done();
            });

            stream.pipe(function (data, cb) {
                cb('err!');
            }).pipe(function () {
                assert.fail();
            }).run();
        });
    });

    describe('pipes', function () {
        var pipe = require('../chat/pipe');
        var oldTransforms;
        beforeEach(function () {
            oldTransforms = pipe.transforms.slice();
        });
        afterEach(function () {
            pipe.transforms = oldTransforms;
        });

        it('finalizes by default', function (done) {
            var stream = pipe.message('hello world');
            stream.on('end', function (data) {
                expect(data).to.deep.equal([{ type: 'text', data: 'hello world' }]);
                done();
            });
            stream.run();
        });

        it('adds new pipes 1', function () {
            pipe.add(15, 'foo');
            expect(pipe.transforms[0]).to.deep.equal({ priority: 15, transform: 'foo' });
        });
        it('adds new pipes 2', function () {
            pipe.add(60, 'foo');
            expect(pipe.transforms[1]).to.deep.equal({ priority: 60, transform: 'foo' });
        });
        it('adds new pipes 3', function () {
            pipe.add(110, 'foo');
            expect(pipe.transforms[2]).to.deep.equal({ priority: 110, transform: 'foo' });
        });
    });

    describe('methods', function () {
        var chat = require('../chat/chat');

        beforeEach(function () {
            sinon.stub(chat, 'sendMessageRaw');
        });
        afterEach(function () {
            chat.sendMessageRaw.restore();
        });

        it('parses the message', function () {
            chat.parseMessage({}, 'hello world', function (err, message) {
                expect(err).to.not.be.ok;
                expect(message).to.deep.equal([{ type: 'text', data: 'hello world' }]);
            });
        });
        it('sends the message', function () {
        });

        it('throws err on silly messages', function (done) {
            chat.method(this.user, [], function (err) {
                expect(err).to.be.defined;
                expect(chat.sendMessageRaw.called).to.be.false;
                done();
            });
        });
        it('allows good messages', function (done) {
            var test = this;
            chat.method(this.user, ['hello world'], function (err) {
                expect(err).not.to.be.ok;
                expect(chat.sendMessageRaw.calledWith(test.channel, test.user, [{ type: 'text', data: 'hello world' }])).to.be.true;
                done();
            });
        });

        it('binds to user', function () {
            chat.bindUser(this.user);
            this.user.sendMessage('hello world');
            expect(chat.sendMessageRaw.calledWith(this.channel, this.user, [{ type: 'text', data: 'hello world' }])).to.be.true;
        });
        it('binds to channel', function () {
            var user = { id: 2, roles: ['Developer'], username: 'connor4312' };
            chat.bindChannel(this.channel);
            this.channel.sendMessage(user, 'hello world');
            expect(chat.sendMessageRaw.calledWith(this.channel, user, [{ type: 'text', data: 'hello world' }])).to.be.true;
        });
    });
});
