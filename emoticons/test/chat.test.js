var Bluebird = require('bluebird');
var packs = require('beam-emoticons');
var expect = require('chai').expect;
var sinon = require('sinon');

describe('emoticons', function () {
    var emoticons = require('../chat/emoticons');
    var request = require('../../util/request');
    var data;

    beforeEach(function () {
        sinon.stub(request, 'run').returns(Bluebird.resolve(['', [{"emoticons":{":cat":{"x":0,"y":0},":fish":{"x":16,"y":0}},"url":"http://example.com/foo.png"}]]));
        this.user.getResource = sinon.stub().returns(
            emoticons.pack([{ remotePath: 'default' }, { remotePath: 'space' }], this.user)
        );
    });

    afterEach(function () {
        request.run.restore();
    })

    it('packs packs correctly', function (done) {
        emoticons.pack([{ remotePath: 'default' }, { remotePath: 'space' }], this.user).then(function (out) {
            expect(Object.keys(out)).to.include.members(
                Object.keys(packs.default.emoticons).concat(Object.keys(packs.space.emoticons))
            );

            for (var key in out) {
                var o = out[key];
                if (o.type === 'builtin') {
                    expect(packs[o.pack]).to.deep.equal(o);
                }
            }
            expect(out[':cat']).to.deep.equal({ coords: { x: 0, y: 0 }, pack: 'http://example.com/foo.png', source: 'external' });
            expect(out[':fish']).to.deep.equal({ coords: { x: 16, y: 0 }, pack: 'http://example.com/foo.png', source: 'external' });

            done();
        });
    });

    it('parses external', function (done) {
        emoticons.pipe(this.channel).run(this.user, [':cat'], function (err, result) {
            expect(err).to.be.undefined;
            expect(result).to.deep.equal([{ type: 'emoticon',
                source: 'external',
                pack: 'http://example.com/foo.png',
                coords: { x: 0, y: 0 },
                text: ':cat'
            }]);
            done();
        });
    });

    it('parses simple', function (done) {
        emoticons.pipe(this.channel).run(this.user, [':)'], function (err, result) {
            expect(err).to.be.undefined;
            expect(result).to.deep.equal([{ type: 'emoticon',
                source: 'builtin',
                pack: 'default',
                coords: { x: 64, y: 0 },
                text: ':)'
            }]);
            done();
        });
    });

    it('does not trip over objects', function (done) {
        emoticons.pipe(this.channel).run(this.user, [':)', { foo: 'bar' }, 'asdf', ':astronaut'], function (err, result) {
            expect(err).to.be.undefined;
            expect(result).to.deep.equal([{
                type: 'emoticon',
                source: 'builtin',
                pack: 'default',
                coords: { x: 64, y: 0 },
                text: ':)'
            }, { foo: 'bar' }, 'asdf', {
                type: 'emoticon',
                source: 'builtin',
                pack: 'space',
                coords: { x: 0, y: 0 },
                text: ':astronaut'
            }]);
            done();
        });
    });
});
