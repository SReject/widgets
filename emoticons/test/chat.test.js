var Bluebird = require('bluebird');
var packs = require('beam-emoticons');
var expect = require('chai').expect;
var sinon = require('sinon');

describe('emoticons', function () {
    var emoticons = require('../chat/emoticons');
    var data;

    beforeEach(function () {
        this.user.getResource = sinon.stub().returns(
            Bluebird.resolve(emoticons.pack([{ remotePath: 'default' }, { remotePath: 'space' }]))
        );
    });

    it('packs packs correctly', function () {
        var out = emoticons.pack([{ remotePath: 'default' }, { remotePath: 'space' }]);
        expect(Object.keys(out)).to.include.members(
            Object.keys(packs.default.emoticons).concat(Object.keys(packs.space.emoticons))
        );

        for (var key in out) {
            if (packs.default.emoticons[key]) {
                expect(out[key].pack).to.equal('default');
            } else {
                expect(out[key].pack).to.equal('space');
            }
        }
    });

    it('parses simple', function (done) {
        emoticons.pipe(this.channel).run(this.user, [':)'], function (err, result) {
            expect(err).to.be.undefined;
            expect(result).to.deep.equal([{ type: 'emoticon', text: ':)', path: 'default/1F604' }]);
            done();
        });
    });

    it('does not trip over objects', function (done) {
        emoticons.pipe(this.channel).run(this.user, [':)', { foo: 'bar' }, 'asdf', ':astronaut'], function (err, result) {
            expect(err).to.be.undefined;
            expect(result).to.deep.equal([
                { type: 'emoticon', text: ':)', path: 'default/1F604' },
                { foo: 'bar' },
                'asdf',
                { type: 'emoticon', text: ':astronaut', path: 'space/astronaut' },
            ]);
            done();
        });
    });
});
