var expect = require('chai').expect;

describe('me command', function () {
    var Me = require('../chat/me');
    var me;

    beforeEach(function () {
        me = Me.pipe();
    });

    it('transforms prefixed messages', function (done) {
        me.run(this.user, {meta: {}, message: ['/me says hello!']}, function (err, message) {
            expect(err).to.be.undefined;
            expect(message).to.deep.equal({
                meta: {me: true},
                message: ['says hello!']
            });
            done();
        });
    });

    it('passes on non prefixed', function (done) {
        me.run(this.user, {meta: {}, message: ['notme says hello!']}, function (err, message) {
            expect(err).to.be.undefined;
            expect(message).to.deep.equal({
                meta: {},
                message: ['notme says hello!']
            });
            done();
        });
    });
});
