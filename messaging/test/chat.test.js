var expect = require('chai').expect;
var assert = require('chai').assert;

describe('messaging chat', function () {
    describe('messaging pipe', function () {
        var pipe = require('../chat/pipe');
        var MessageStream = require('../chat/messageStream');

        describe('word splitting', function () {
            var stream;
            beforeEach(function () {
                stream = new MessageStream();
            });

            it('works on empty', function (done) {
                stream.on('end', function (out) {
                    expect(out).to.deep.equal([]);
                    done();
                });
                pipe.splitWords('', stream);
                stream.run();
            });

            it('works on basic', function (done) {
                stream.on('end', function (out) {
                    expect(out).to.deep.equal(['lorem', ' ', 'ipsum', ' ', 'dolor']);
                    done();
                });
                pipe.splitWords('lorem ipsum dolor', stream);
                stream.run();
            });

            it('works with trailing spaces', function (done) {
                stream.on('end', function (out) {
                    expect(out).to.deep.equal(['   ', 'helloo', '   ']);
                    done();
                });
                pipe.splitWords('   helloo   ', stream);
                stream.run();
            });

            it('works with multiple spaces', function (done) {
                stream.on('end', function (out) {
                    expect(out).to.deep.equal(['   ', 'helloo', '  ', 'world', ' ']);
                    done();
                });
                pipe.splitWords('   helloo  world ', stream);
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
                expect(out).to.deep.equal(['LOREM', 'IPSUM', 'DOLLARZ']);
                done();
            });
            stream.pipe(function (str, cb) { this.push(str.toUpperCase()).next(); }).run();
        });

        it('aborts when an error is thrown', function (done) {
            stream.on('aborted', function (err) {
                expect(err).to.equal('err!');
                done();
            });

            stream.pipe(function (str, cb) {
                this.push(str);

                if (str === 'ipsum') this.next('err!');
                else this.next();
            }).pipe(function () {
                assert.fail();
            }).run();
        });
    });
});
