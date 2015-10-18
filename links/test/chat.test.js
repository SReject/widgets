var expect = require('chai').expect;
var sinon = require('sinon');

describe('links', function () {
    var Links = require('../chat/links');
    var data;

    beforeEach(function () {
        data = {
            nolink: {meta: {}, message: ['Lorem ipsum dolor sit amet, consectetur adipisicing elit.']},
            onelink: {meta: {}, message: ['Lorem ipsum dolor sit amet, github.com adipisicing elit.']},
            twolink: {meta: {}, message: ['Lorem ipsum dolor sit amet, github.com adipisicing: https://beam.pro']}
        };
        links = Links.pipe(this.channel);
    });

    it('does not test when clickable and permitted', function (done) {
        this.channel.preferences['channel:links:clickable'] = false;
        this.channel.preferences['channel:links:allowed'] = true;
        var links = Links.pipe(this.channel);
        var stub = sinon.stub(links, 'parse');

        links.run(this.user, data.onelink, function (err, out) {
            expect(out).to.deep.equal(data.onelink);
            expect(err).to.be.undefined;
            expect(stub.called).to.be.false;
            stub.restore();
            done();
        });
    });

    describe('link enforcement', function () {
        it('throws an error when links are not permitted', function (done) {
            this.channel.preferences['channel:links:allowed'] = false;
            var links = Links.pipe(this.channel);
            links.run(this.user, data.onelink, function (err, out) {
                expect(err).not.to.be.undefined;
                done();
            });
        });
        it('allows when override present', function (done) {
            this.channel.preferences['channel:links:allowed'] = false;
            this.user.permissions = ['bypass_links'];
            var links = Links.pipe(this.channel);
            links.run(this.user, data.onelink, function (err, out) {
                expect(err).to.be.undefined;
                done();
            });
        });
        it('allows when no links present', function (done) {
            this.channel.preferences['channel:links:allowed'] = false;
            var links = Links.pipe(this.channel);
            links.run(this.user, data.nolink, function (err, out) {
                expect(err).to.be.undefined;
                done();
            });
        });
        it('allows when allowed is true', function (done) {
            var links = Links.pipe(this.channel);
            links.run(this.user, data.onelink, function (err, out) {
                expect(err).to.be.undefined;
                done();
            });
        });
    });

    describe('clickify', function () {
        it('does not clickify when disabled', function (done) {
            this.channel.preferences['channel:links:clickable'] = false;
            var links = Links.pipe(this.channel);
            links.run(this.user, data.onelink, function (err, out) {
                expect(err).to.be.undefined;
                expect(out).to.deep.equal({meta: {}, message: ['Lorem ipsum dolor sit amet, github.com adipisicing elit.']});
                done();
            });
        });
        it('clickifies when enabled', function (done) {
            var links = Links.pipe(this.channel);
            links.run(this.user, data.onelink, function (err, out) {
                expect(err).to.be.undefined;
                expect(out).to.deep.equal({
                    meta: {},
                    message: [
                        'Lorem ipsum dolor sit amet, ',
                        { type: 'link', url: 'http://github.com', text: 'github.com' },
                        ' adipisicing elit.'
                    ]
                });
                done();
            });
        });
    });

    describe('parsing', function () {
        it('parses empty', function (done) {
            var links = Links.pipe(this.channel);
            links.run(this.user, {meta: {}, message: []}, function (err, out) {
                expect(err).to.be.undefined;
                expect(out).to.deep.equal({meta: {}, message: []});
                done();
            });
        });
        it('parses with objects', function (done) {
            var links = Links.pipe(this.channel);
            links.run(this.user, {meta: {}, message: ['hello', { foo: 2 }, 'world']}, function (err, out) {
                expect(err).to.be.undefined;
                expect(out).to.deep.equal({ meta: {}, message: ['hello', { foo: 2 }, 'world']});
                done();
            });
        });
        it('parses mid text', function (done) {
            var links = Links.pipe(this.channel);
            links.run(this.user, {meta: {}, message: ['a github.com b']}, function (err, out) {
                expect(err).to.be.undefined;
                expect(out).to.deep.equal({
                    meta: {},
                    message: [
                        'a ',
                        { type: 'link', url: 'http://github.com', text: 'github.com' },
                        ' b'
                    ]
                });
                done();
            });
        });
        it('parses end of text, multiple', function (done) {
            links.run(this.user, {meta: {}, message: ['a github.com b google.com']}, function (err, out) {
                expect(err).to.be.undefined;
                expect(out).to.deep.equal({
                    meta: {},
                    message: [
                        'a ',
                        { type: 'link', url: 'http://github.com', text: 'github.com' },
                        ' b ',
                        { type: 'link', url: 'http://google.com', text: 'google.com' },
                    ]
                });
                done();
            });
        });
        it('parses multiple segments', function (done) {
            links.run(this.user, {meta: {}, message: ['a github.com', { foo: 2 }, ' b google.com']}, function (err, out) {
                expect(err).to.be.undefined;
                expect(out).to.deep.equal({
                    meta: {},
                    message: [
                        'a ',
                        { type: 'link', url: 'http://github.com', text: 'github.com' },
                        { foo: 2 },
                        ' b ',
                        { type: 'link', url: 'http://google.com', text: 'google.com' },
                    ]
                });
                done();
            });
        });
    });
});
