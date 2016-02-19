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
            clip.roles = {
                Mod: { level: 50 },
                User: { level: 10 }
            }
            mockChan = {
                publish: sinon.stub()
            };
            mockUser = {
                getRoles: sinon.stub(),
                getChannel: sinon.stub().returns(mockChan)
            };
            mockSock = {
                user: mockUser
            };
            mockHist = {
                getMessage: sinon.stub()
            }
            sinon.stub(history, 'getChannelHistory').returns(mockHist);
        });
        
        afterEach(() => {
            history.getChannelHistory.restore();
        })
        
        it('should delete when roles match up', () => {
            mockUser.getRoles.returns(["Mod"]);
            mockHist.getMessage.returns({ id: 1337, user_roles: ["User"], channel: 1, user_id: 2, message: [] });
            
            let respond = sinon.spy();
            del(mockSock, [ 1, 1337 ], respond);
            
            expect(mockChan.publish.calledWith('DeleteMessage', { id: 1337 })).to.be.true;
            expect(respond.calledWith(null, 'Message deleted.')).to.be.true;
        });
        
        it('should not allow with equal levels', () => {
            mockUser.getRoles.returns(["Mod"]);
            mockHist.getMessage.returns({ id: 1337, user_roles: ["Mod"], channel: 1, user_id: 2, message: [] });
            
            let respond = sinon.spy();
            del(mockSock, [ 1, 1337 ], respond);
            
            expect(mockChan.publish.notCalled).to.equal.true;
            expect(respond.calledWith('Access denied.')).to.equal.true;
        });
    });
});
