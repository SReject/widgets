'use strict';


const expect = require('chai').expect;
const sinon = require('sinon');

describe('stats', function () {
    // Contains one :) emote, some text, and two :D emotes, with a total length of 10
    const demoMessage = () => ({
        meta: {},
        message: [
            {
                type: 'emoticon',
                source: 'builtin',
                pack: 'default',
                coords: { x: 88, y: 0 },
                text: ':)'
            },
            { foo: 'bar' },
            { type: 'text', data: 'asdf'},
            {
                type: 'emoticon',
                source: 'builtin',
                pack: 'default',
                coords: { x: 88, y: 0 },
                text: ':D'
            },
            {
                type: 'emoticon',
                source: 'builtin',
                pack: 'default',
                coords: { x: 88, y: 0 },
                text: ':D'
            }
        ]
    });

    const Stats = require('../chat/stats');
    let clock;
    let stats;

    beforeEach(function () {
        clock = sinon.useFakeTimers();
        stats = new Stats(this.influx, this.log);
    });

    afterEach(function () {
        clock.restore();
    });

    describe('queuing', function () {

        it('queues up messages before writing', function () {
            stats._write('foo', { tag: 'a' }, { field: 'b' });
            stats._write('bar', { tag: 'c' }, { field: 'd' });
            stats._write('bar', { tag: 'e' }, { field: 'f' });

            expect(this.influx.writeSeries).not.to.have.been.called;

            clock.tick(2000);
            expect(this.influx.writeSeries).to.have.been.calledWith({
                foo: [[{ field: 'b'}, { tag: 'a' }]],
                bar: [[{ field: 'd'}, { tag: 'c' }], [{ field: 'f'}, { tag: 'e' }]],
            });

            stats._write('bleh', {}, {});

            clock.tick(2000);
            expect(this.influx.writeSeries).to.have.been.calledWith({
                bleh: [[{}, {}]],
            });

            clock.tick(2000);
            expect(this.influx.writeSeries).to.have.been.calledTwice;
        });
    });

    describe('message recording', function () {
        it('writes emote states', function () {
            stats.pipe(this.user, demoMessage(), (err, result) => {
                expect(err).to.be.undefined;
                expect(result).to.deep.equal(demoMessage());

                expect(stats._queue.points).to.deep.equal({
                    messages: [
                        [{ user: 42, channel: 1337, length: 10, count: 1}, {}]
                    ],
                    emojis: [
                        [{ user: 42, channel: 1337, count: 1 }, { emoji: ':)' }],
                        [{ user: 42, channel: 1337, count: 2 }, { emoji: ':D' }],
                    ],
                });
            });
        });
    });
});
