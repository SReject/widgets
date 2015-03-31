var expect = require('chai').expect;
var sinon = require('sinon');

describe('links', function () {
    var links = require('../chat/links');
    var data;

    beforeEach(function () {
        data = {
            nolink: ['Lorem ipsum dolor sit amet, consectetur adipisicing elit.'],
            onelink: ['Lorem ipsum dolor sit amet, github.com adipisicing elit.'],
            twolink: ['Lorem ipsum dolor sit amet, github.com adipisicing: https://beam.pro']
        };
    });

    it('does not test when clickable and permitted', function (done) {
        this.channel.preferences['channel:links:clickable'] = false;
        this.channel.preferences['channel:links:allowed'] = true;
        var stub = sinon.stub(links, 'parse');

        links.pipe.call(this, data.onelink, function (err, out) {
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
            links.pipe.call(this, data.onelink, function (err, out) {
                expect(err).not.to.be.undefined;
                done();
            });
        });
        it('allows when override present', function (done) {
            this.channel.preferences['channel:links:allowed'] = false;
            this.user.permissions = ['bypass_links'];
            links.pipe.call(this, data.onelink, function (err, out) {
                expect(err).to.be.undefined;
                done();
            });
        });
        it('allows when no links present', function (done) {
            this.channel.preferences['channel:links:allowed'] = false;
            links.pipe.call(this, data.nolink, function (err, out) {
                expect(err).to.be.undefined;
                done();
            });
        });
        it('allows when allowed is true', function (done) {
            links.pipe.call(this, data.onelink, function (err, out) {
                expect(err).to.be.undefined;
                done();
            });
        });
    });

    describe('clickify', function () {
        it('does not clickify when disabled', function (done) {
            this.channel.preferences['channel:links:clickable'] = false;
            links.pipe.call(this, data.onelink, function (err, out) {
                expect(err).to.be.undefined;
                expect(out).to.deep.equal(['Lorem ipsum dolor sit amet, github.com adipisicing elit.']);
                done();
            });
        });
        it('clickifies when enabled', function (done) {
            links.pipe.call(this, data.onelink, function (err, out) {
                expect(err).to.be.undefined;
                expect(out).to.deep.equal([
                    'Lorem ipsum dolor sit amet, ',
                    { type: 'link', url: 'http://github.com', text: 'github.com' },
                    ' adipisicing elit.'
                ]);
                done();
            });
        });
    });

    describe('parsing', function () {
        it('parses empty', function (done) {
            links.pipe.call(this, [], function (err, out) {
                expect(err).to.be.undefined;
                expect(out).to.deep.equal([]);
                done();
            });
        });
        it('parses with objects', function (done) {
            links.pipe.call(this, ['hello', { foo: 2 }, 'world'], function (err, out) {
                expect(err).to.be.undefined;
                expect(out).to.deep.equal(['hello', { foo: 2 }, 'world']);
                done();
            });
        });
        it('parses mid text', function (done) {
            links.pipe.call(this, ['a github.com b'], function (err, out) {
                expect(err).to.be.undefined;
                expect(out).to.deep.equal([
                    'a ',
                    { type: 'link', url: 'http://github.com', text: 'github.com' },
                    ' b'
                ]);
                done();
            });
        });
        it('parses end of text, multiple', function (done) {
            links.pipe.call(this, ['a github.com b google.com'], function (err, out) {
                expect(err).to.be.undefined;
                expect(out).to.deep.equal([
                    'a ',
                    { type: 'link', url: 'http://github.com', text: 'github.com' },
                    ' b ',
                    { type: 'link', url: 'http://google.com', text: 'google.com' },
                ]);
                done();
            });
        });
        it('parses multiple segments', function (done) {
            links.pipe.call(this, ['a github.com', { foo: 2 }, ' b google.com'], function (err, out) {
                expect(err).to.be.undefined;
                expect(out).to.deep.equal([
                    'a ',
                    { type: 'link', url: 'http://github.com', text: 'github.com' },
                    { foo: 2 },
                    ' b ',
                    { type: 'link', url: 'http://google.com', text: 'google.com' },
                ]);
                done();
            });
        });
    });
});
