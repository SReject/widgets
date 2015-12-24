var Bluebird = require('bluebird');
var expect = require('chai').expect;
var sinon = require('sinon');

describe('inaspacesuit', function () {
    var inaspacesuit = require('../chat/inaspacesuit');
    var request = require('../../util/request');

    beforeEach(function () {
        sinon.stub(request, 'run').returns(Bluebird.resolve([{ statusCode: 200 }, [
            {"username": "zeldarick", "id": 1}, 
            {"username": "zeldarick2", "id": 2}, 
            {"username": "zeldarick3", "id": 3}
        ]]));
    });

    afterEach(function () {
        request.run.restore();
    });

    it('identifies a spacesuit', function (done) {
        var result = inaspacesuit.pipe().isInASpaceSuit(':zeldarickinaspacesuit');
        expect(result).to.be.true;
        done();
    });

    it('extracts the spacesuit occupant', function (done) {
        var result = inaspacesuit.pipe().getUsername(':zeldarickinaspacesuit');
        expect(result).to.equal('zeldarick');
        done();
    });

    it('finds the occupant\'s ID', function (done) {
        inaspacesuit.pipe().findUserId('zeldarick')
        .then(function (userId) {
            expect(userId).to.equal(1);
            done();
        })
        .catch(done);
    });

    it('parses spacesuits', function (done) {
        inaspacesuit.pipe().run(this.user, {meta: {}, message: [':zeldarickinaspacesuit']}, function (err, result) {
            expect(err).to.be.undefined;
            expect(result).to.deep.equal({
                meta: {},
                message: [
                    { 
                        type: 'inaspacesuit',
                        username: 'zeldarick',
                        userId: 1,
                        text: ':zeldarickinaspacesuit'
                    }
                ]
            });
            done();
        });
    });

    it('parses multiple spacesuits', function (done) {
        inaspacesuit.pipe().run(this.user, {meta: {}, message: [':zeldarickinaspacesuit', ':zeldarickinaspacesuit']}, function (err, result) {
            expect(err).to.be.undefined;
            expect(result).to.deep.equal({
                meta: {},
                message: [
                    {
                        type: 'inaspacesuit',
                        username: 'zeldarick',
                        userId: 1,
                        text: ':zeldarickinaspacesuit'
                    },
                    {
                        type: 'inaspacesuit',
                        username: 'zeldarick',
                        userId: 1,
                        text: ':zeldarickinaspacesuit'
                    }
                ]
            });
            done();
        });
    });

    it('does not trip over objects', function (done) {
        inaspacesuit.pipe().run(this.user, {meta: {}, message: ['Hi', { foo: 'bar' }, ':zeldarickinaspacesuit', 'hello']}, function (err, result) {
            expect(err).to.be.undefined;
            expect(result).to.deep.equal({
                meta: {},
                message: [
                    'Hi',
                    { 
                        foo: 'bar' 
                    },
                    {
                        type: 'inaspacesuit',
                        username: 'zeldarick',
                        userId: 1,
                        text: ':zeldarickinaspacesuit'
                    },
                    'hello'
                ]
            });
            done();
        });
    });

    it('does not trip over incorrect usernames', function (done) {
        inaspacesuit.pipe().run(this.user, {meta: {}, message: ['Hello',  ':beldarickinaspacesuit', 'harhar']}, function (err, result) {
            expect(err).to.be.undefined;
            expect(result).to.deep.equal({
                meta: {},
                message: ['Hello', ':beldarickinaspacesuit', 'harhar']
            });
            done();
        })
    });
});
