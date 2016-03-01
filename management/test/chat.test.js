'use strict';
const Bluebird = require('bluebird');
const sinon = require('sinon');
const expect = require('chai').expect;
const clip = require('../../clip');

const history = require('../../history/chat/history');

describe('management', () => {
    describe('delete', () => {
        const del = require('../chat/delete');
        let mockSock, mockUser, mockChan, mockHist;

        beforeEach(() => {

            mockChan = {
                publish: sinon.stub(),
                getId: sinon.stub().returns(1),
                historyAvailable: true
            };
            mockUser = {
                getRoles: sinon.stub(),
                getChannel: sinon.stub().returns(mockChan),
                getId: sinon.stub.returns(123)
            };
            mockSock = {
                user: mockUser
            };
            mockHist = {
                getMessage: sinon.stub()
            };

            clip.roles = {
                Mod: { level: 50 },
                User: { level: 10 },
                getDominant: arr => clip.roles[arr[0]],
                canAdministrate: (role, other) => role >= 25 && role - 10 >= other
            };
            clip.manager = {
                getChannel: sinon.stub().returns(Bluebird.resolve(mockChan))
            };

            sinon.stub(history, 'getChannelHistory').returns(mockHist);
        });

        afterEach(() => {
            history.getChannelHistory.restore();
        });

        it('should delete when roles match up', next => {
            mockUser.getRoles.returns(["Mod"]);
            mockHist.getMessage.returns({ id: 1337, user_roles: ["User"], channel: 1, user_id: 2, message: [] });

            del(mockSock, [ 1337 ], (err, data) => {
                expect(mockChan.publish.calledWith('DeleteMessage', { id: 1337 })).to.be.true;
                expect(err).to.be.null;
                expect(data).to.equal('Message deleted.');

                next();
            });
        });

        it('should not allow with equal levels', next => {
            mockUser.getRoles.returns(["Mod"]);
            mockHist.getMessage.returns({ id: 1337, user_roles: ["Mod"], channel: 1, user_id: 2, message: [] });

            let respond = sinon.spy();
            del(mockSock, [ 1, 1337 ], (err, data) => {
                expect(err).to.equal('Access denied.');
                expect(data).to.be.undefined;
                expect(mockChan.publish.notCalled).to.equal.true;

                next();
            });
        });
    });
});
