'use strict';

var expect = require('chai').expect,
    sinon = require('sinon'),
    httpMocks = require('node-mocks-http'),
    DescriptorStatusController = require('../../controllers/descriptor-status.server.controller'),
    descriptorStatusApiClient = require('../../../dnaApiClient').dnaDescriptorStatusApiClient;

describe('Descriptor status controller', function() {
    describe('method', function() {
        describe('list', function() {
            it('should call descriptorStatusApiClient.getDescriptorStatusList', function(done) {
                var res = httpMocks.createResponse(),
                    req = httpMocks.createRequest(),
                    nextMock;

                nextMock = function() {
                };

                req.logout = function() {
                };

                sinon.spy(descriptorStatusApiClient, 'getDescriptorStatusList');
                expect(descriptorStatusApiClient.getDescriptorStatusList.called).to.be.false();
                DescriptorStatusController.list(req, res, nextMock);
                expect(descriptorStatusApiClient.getDescriptorStatusList.calledOnce).to.be.true();
                done();
            });
        });

        describe('defaultStatuses', function() {
            it('should call descriptorStatusApiClient.getDefaultDescriptorStatusesKeys', function(done) {
                var res = httpMocks.createResponse(),
                    req = httpMocks.createRequest(),
                    nextMock;

                nextMock = function() {
                };

                req.logout = function() {
                };

                sinon.spy(descriptorStatusApiClient, 'getDefaultDescriptorStatusesKeys');
                expect(descriptorStatusApiClient.getDefaultDescriptorStatusesKeys.called).to.be.false();
                DescriptorStatusController.defaultStatuses(req, res, nextMock);
                expect(descriptorStatusApiClient.getDefaultDescriptorStatusesKeys.calledOnce).to.be.true();
                done();
            });
        });
    });
});
