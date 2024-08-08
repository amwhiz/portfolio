'use strict';

var should = require('should'),
    acl = require('../../lib/acl.server.middleware.lib.js'),
    httpMocks = require('node-mocks-http'),
    sinon = require('sinon'),
    request,
    response;

describe('Users ACL middleware', function() {

    beforeEach(function() {
        request = httpMocks.createRequest();
        response = httpMocks.createResponse();
        request.user = {
            roles: []
        };
        response.jsonp = sinon.spy();
        acl.aclMiddleware(request, response, function() {
        });
    });

    describe('Method sendForbidden', function() {
        it('should exist', function(done) {
            should.exist(response.sendForbidden);
            done();
        });

        it('should set response status to 403', function(done) {
            response.sendForbidden(response);
            response.statusCode.should.be.equal(403);

            done();
        });

        it('should return proper jsonp message', function(done) {
            response.sendForbidden(response);
            response.jsonp.calledWith({
                message: 'Forbidden',
                status: 403
            });

            done();
        });
    });

    describe('Method canEdit', function() {
        it('should exist', function(done) {
            should.exist(request.canEdit);
            done();
        });

        it('should return true if has owner and edit roles', function(done) {
            request.user.roles = ['owner', 'edit'];
            request.canEdit().should.be.equal(true);
            done();
        });

        it('should return true if has edit role', function(done) {
            request.user.roles = ['edit'];
            request.canEdit().should.be.equal(true);
            done();
        });

        it('should return true if has owner role', function(done) {
            request.user.roles = ['owner'];
            request.canEdit().should.be.equal(true);
            done();
        });

        it('should return false if has improper role', function(done) {
            request.user.roles = ['view'];
            request.canEdit().should.be.equal(false);
            done();
        });

        it('should return false if has no role', function(done) {
            request.user.roles = [];
            request.canEdit().should.be.equal(false);
            done();
        });
    });

    describe('Method canView', function() {
        it('should exist', function(done) {
            should.exist(request.canView);
            done();
        });

        it('should return true if has view role', function(done) {
            request.user.roles = ['view'];
            request.canView().should.be.equal(true);
            done();
        });

        it('should return true if has edit role', function(done) {
            request.user.roles = ['edit'];
            request.canView().should.be.equal(true);
            done();
        });

        it('should return true if has owner role', function(done) {
            request.user.roles = ['owner'];
            request.canView().should.be.equal(true);
            done();
        });

        it('should return false if has improper role', function(done) {
            request.user.roles = ['role'];
            request.canView().should.be.equal(false);
            done();
        });

        it('should return false if has no role', function(done) {
            request.user.roles = [];
            request.canView().should.be.equal(false);
            done();
        });
    });
});
