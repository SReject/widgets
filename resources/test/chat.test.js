var Bluebird = require('bluebird');
var expect = require('chai').expect;

describe('resource', function () {
    var resources = require('../chat/resources');
    var clip = require('../../clip');

    beforeEach(function () {
        resources.bindUser(this.user);
        resources.list = {};
        resources.load('a');
        resources.load('b', function (r) { return r.map(function (k) { return k.id; }); }, 'asdf');
    });

    it('requires alias is handled types', function () {
        expect(function () {
            resources.load('c', function () {});
        }).to.throw;
    });

    it('builds the "in" query', function () {
        expect(resources.inQuery()).to.equal('\'a\', \'b\'');
    });

    describe('load', function () {
        it('returns from the user cache when present', function (done) {
            this.user._resourceCache = { a: ['bar'] };
            resources.get.call(this.user, 'a').then(function (results) {
                expect(results).to.deep.equal(['bar']);
                expect(clip.mysql.queryAsync.called).to.be.false;
                done();
            }).catch(done);
        });
        it('returns blank when none present', function (done) {
            this.user._resourceCache = {};
            resources.get.call(this.user, 'a').then(function (results) {
                expect(results).to.deep.equal([]);
                expect(clip.mysql.queryAsync.called).to.be.false;
                done();
            }).catch(done);
        });
        it('otherwise works', function (done) {
            var user = this.user;

            clip.mysql.queryAsync.returns(Bluebird.resolve([[
                { id: 1, type: 'a' },
                { id: 1, type: 'a' },
                { id: 2, type: 'b' },
                { id: 3, type: 'b' },
                { id: 4, type: 'c' }
            ]]));

            resources.get.call(this.user, 'asdf').then(function (results) {
                expect(results).to.deep.equal([2, 3]);
                expect(user._resourceCache).to.deep.equal({
                    a: [{ id: 1, type: 'a' }],
                    asdf: [2, 3]
                });
                done();
            }).catch(done);
        });
    });
});
