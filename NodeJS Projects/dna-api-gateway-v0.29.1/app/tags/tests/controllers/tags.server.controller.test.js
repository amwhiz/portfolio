'use strict';

var expect = require('chai').expect,
    sinon = require('sinon'),
    mockery = require('mockery'),
    tagsController,
    dnaApiClient,
    tagsApiClient,
    httpMocks = require('node-mocks-http'),
    dataMock,
    req,
    res,
    nextMock,
    errorCallback;

describe('Tags controller', function() {
    before(function() {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });

        dataMock = {
            then: function(cb) {
                cb();
                return dataMock;
            },
            error: function(cb) {
                errorCallback = cb;
            }
        };

        dnaApiClient = {
            dnaTagsApiClient: {
                getTags: function() {
                    return dataMock;
                },
                getGSETags: function() {
                    return dataMock;
                },
                getSkillTags: function() {
                    return dataMock;
                },
                getExtTags: function() {
                    return dataMock;
                },
                getExtTag: function() {
                    return dataMock;
                },
                postExtTag: function() {
                    return dataMock;
                },
                putExtTag: function() {
                    return dataMock;
                },
                deleteExtTag: function() {
                    return dataMock;
                },
                getExtTagTypes: function() {
                    return dataMock;
                },
                getExtTagType: function() {
                    return dataMock;
                },
                postExtTagType: function() {
                    return dataMock;
                },
                putExtTagType: function() {
                    return dataMock;
                },
                deleteExtTagType: function() {
                    return dataMock;
                }

            }
        };

        tagsApiClient = dnaApiClient.dnaTagsApiClient;

        mockery.registerMock('../../dnaApiClient', dnaApiClient);
        tagsController = require('../../controllers/tags.server.controller');
    });

    beforeEach(function() {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        nextMock = function() {
        };
    });

    after(function() {
        mockery.disable();
    });

    describe('method', function() {
        describe('list', function() {
            it('should exist', function() {
                expect(tagsController.list).to.be.instanceOf(Function);
            });

            it('should call tagsApiClient.getTags', function(done) {
                var getTagsSpy = sinon.spy(tagsApiClient, 'getTags');

                tagsController.list(req, res);
                expect(getTagsSpy.calledOnce).to.be.true();
                getTagsSpy.restore();
                done();
            });

            it('should call next for error callback', function(done) {
                var nextSpy = sinon.spy();

                tagsController.list(req, res, nextSpy);
                errorCallback({});
                expect(nextSpy.calledOnce).to.be.true();
                done();
            });
        });

        describe('gse', function() {
            it('should exist', function() {
                expect(tagsController.gse).to.be.instanceOf(Function);
            });

            it('should call tagsApiClient.getGSETags', function(done) {
                var getGSETagsSpy = sinon.spy(tagsApiClient, 'getGSETags');

                tagsController.gse(req, res);
                expect(getGSETagsSpy.calledOnce).to.be.true();
                getGSETagsSpy.restore();
                done();
            });

            it('should call next for error callback', function(done) {
                var nextSpy = sinon.spy();

                tagsController.gse(req, res, nextSpy);
                errorCallback({});
                expect(nextSpy.calledOnce).to.be.true();
                done();
            });
        });

        describe('skill', function() {
            it('should exist', function() {
                expect(tagsController.skill).to.be.instanceOf(Function);
            });

            it('should call tagsApiClient.getSkillTags', function(done) {
                var getSkillTagsSpy = sinon.spy(tagsApiClient, 'getSkillTags');

                tagsController.skill(req, res);
                expect(getSkillTagsSpy.calledOnce).to.be.true();
                getSkillTagsSpy.restore();
                done();
            });

            it('should call next for error callback', function(done) {
                var nextSpy = sinon.spy();

                tagsController.skill(req, res, nextSpy);
                errorCallback({});
                expect(nextSpy.calledOnce).to.be.true();
                done();
            });
        });

        describe('getExtTags', function() {
            it('should exist', function() {
                expect(tagsController.getExtTags).to.be.instanceOf(Function);
            });

            it('should call tagsApiClient.getExtTags', function(done) {
                var getExtTagsSpy = sinon.spy(tagsApiClient, 'getExtTags');

                tagsController.getExtTags(req, res, nextMock);
                expect(getExtTagsSpy.calledOnce).to.be.true();
                getExtTagsSpy.restore();
                done();
            });

            it('should call res.json', function(done) {
                var resSpy = sinon.spy(res, 'json');

                tagsController.getExtTags(req, res, nextMock);
                expect(resSpy.calledOnce).to.be.true();
                resSpy.restore();
                done();
            });

            it('should call next for error callback', function(done) {
                var nextSpy = sinon.spy();

                tagsController.getExtTags(req, res, nextSpy);
                errorCallback({});
                expect(nextSpy.calledOnce).to.be.true();
                done();
            });
        });

        describe('getExtTag', function() {
            it('should exist', function() {
                expect(tagsController.getExtTag).to.be.instanceOf(Function);
            });

            it('should call tagsApiClient.getExtTag', function(done) {
                var getExtTagSpy = sinon.spy(tagsApiClient, 'getExtTag');

                tagsController.getExtTag(req, res, nextMock);
                expect(getExtTagSpy.calledOnce).to.be.true();
                getExtTagSpy.restore();
                done();
            });

            it('should call res.json', function(done) {
                var resSpy = sinon.spy(res, 'json');

                tagsController.getExtTag(req, res, nextMock);
                expect(resSpy.calledOnce).to.be.true();
                resSpy.restore();
                done();
            });

            it('should call next for error callback', function(done) {
                var nextSpy = sinon.spy();

                tagsController.getExtTag(req, res, nextSpy);
                errorCallback({});
                expect(nextSpy.calledOnce).to.be.true();
                done();
            });
        });

        describe('postExtTag', function() {
            it('should exist', function() {
                expect(tagsController.postExtTag).to.be.instanceOf(Function);
            });

            it('should call tagsApiClient.postExtTag', function(done) {
                var postExtTagSpy = sinon.spy(tagsApiClient, 'postExtTag');

                tagsController.postExtTag(req, res, nextMock);
                expect(postExtTagSpy.calledOnce).to.be.true();
                postExtTagSpy.restore();
                done();
            });

            it('should call res.json', function(done) {
                var resSpy = sinon.spy(res, 'json');

                tagsController.postExtTag(req, res, nextMock);
                expect(resSpy.calledOnce).to.be.true();
                resSpy.restore();
                done();
            });

            it('should call next for error callback', function(done) {
                var nextSpy = sinon.spy();

                tagsController.postExtTag(req, res, nextSpy);
                errorCallback({});
                expect(nextSpy.calledOnce).to.be.true();
                done();
            });
        });

        describe('putExtTag', function() {
            it('should exist', function() {
                expect(tagsController.putExtTag).to.be.instanceOf(Function);
            });

            it('should call tagsApiClient.putExtTag', function(done) {
                var putExtTagSpy = sinon.spy(tagsApiClient, 'putExtTag');

                tagsController.putExtTag(req, res, nextMock);
                expect(putExtTagSpy.calledOnce).to.be.true();
                putExtTagSpy.restore();
                done();
            });

            it('should call res.json', function(done) {
                var resSpy = sinon.spy(res, 'json');

                tagsController.putExtTag(req, res, nextMock);
                expect(resSpy.calledOnce).to.be.true();
                resSpy.restore();
                done();
            });

            it('should call next for error callback', function(done) {
                var nextSpy = sinon.spy();

                tagsController.putExtTag(req, res, nextSpy);
                errorCallback({});
                expect(nextSpy.calledOnce).to.be.true();
                done();
            });
        });

        describe('deleteExtTag', function() {
            it('should exist', function() {
                expect(tagsController.deleteExtTag).to.be.instanceOf(Function);
            });

            it('should call tagsApiClient.deleteExtTag', function(done) {
                var deleteExtTagSpy = sinon.spy(tagsApiClient, 'deleteExtTag');

                tagsController.deleteExtTag(req, res);
                expect(deleteExtTagSpy.calledOnce).to.be.true();
                deleteExtTagSpy.restore();
                done();
            });

            it('should call res.json', function(done) {
                var resSpy = sinon.spy(res, 'json');

                tagsController.deleteExtTag(req, res);
                expect(resSpy.calledOnce).to.be.true();
                resSpy.restore();
                done();
            });

            it('should call next for error callback', function(done) {
                var nextSpy = sinon.spy();

                tagsController.deleteExtTag(req, res, nextSpy);
                errorCallback({});
                expect(nextSpy.calledOnce).to.be.true();
                done();
            });
        });

        describe('getExtTagTypes', function() {
            it('should exist', function() {
                expect(tagsController.getExtTagTypes).to.be.instanceOf(Function);
            });

            it('should call tagsApiClient.getExtTagTypes', function(done) {
                var getExtTagTypesSpy = sinon.spy(tagsApiClient, 'getExtTagTypes');

                tagsController.getExtTagTypes(req, res);
                expect(getExtTagTypesSpy.calledOnce).to.be.true();
                getExtTagTypesSpy.restore();
                done();
            });

            it('should call res.json', function(done) {
                var resSpy = sinon.spy(res, 'json');

                tagsController.getExtTagTypes(req, res);
                expect(resSpy.calledOnce).to.be.true();
                resSpy.restore();
                done();
            });

            it('should call next for error callback', function(done) {
                var nextSpy = sinon.spy();

                tagsController.getExtTagTypes(req, res, nextSpy);
                errorCallback({});
                expect(nextSpy.calledOnce).to.be.true();
                done();
            });
        });

        describe('getExtTagType', function() {
            it('should exist', function() {
                expect(tagsController.getExtTagType).to.be.instanceOf(Function);
            });

            it('should call tagsApiClient.getExtTagType', function(done) {
                var getExtTagTypeSpy = sinon.spy(tagsApiClient, 'getExtTagType');

                tagsController.getExtTagType(req, res);
                expect(getExtTagTypeSpy.calledOnce).to.be.true();
                getExtTagTypeSpy.restore();
                done();
            });

            it('should call res.json', function(done) {
                var resSpy = sinon.spy(res, 'json');

                tagsController.getExtTagType(req, res);
                expect(resSpy.calledOnce).to.be.true();
                resSpy.restore();
                done();
            });

            it('should call next for error callback', function(done) {
                var nextSpy = sinon.spy();

                tagsController.getExtTagType(req, res, nextSpy);
                errorCallback({});
                expect(nextSpy.calledOnce).to.be.true();
                done();
            });
        });

        describe('postExtTagType', function() {
            it('should exist', function() {
                expect(tagsController.postExtTagType).to.be.instanceOf(Function);
            });

            it('should call tagsApiClient.postExtTagType', function(done) {
                var postExtTagTypeSpy = sinon.spy(tagsApiClient, 'postExtTagType');

                tagsController.postExtTagType(req, res);
                expect(postExtTagTypeSpy.calledOnce).to.be.true();
                postExtTagTypeSpy.restore();
                done();
            });

            it('should call res.json', function(done) {
                var resSpy = sinon.spy(res, 'json');

                tagsController.postExtTagType(req, res);
                expect(resSpy.calledOnce).to.be.true();
                resSpy.restore();
                done();
            });

            it('should call next for error callback', function(done) {
                var nextSpy = sinon.spy();

                tagsController.postExtTagType(req, res, nextSpy);
                errorCallback({});
                expect(nextSpy.calledOnce).to.be.true();
                done();
            });
        });

        describe('putExtTagType', function() {
            it('should exist', function() {
                expect(tagsController.putExtTagType).to.be.instanceOf(Function);
            });

            it('should call tagsApiClient.putExtTagType', function(done) {
                var putExtTagTypeSpy = sinon.spy(tagsApiClient, 'putExtTagType');

                tagsController.putExtTagType(req, res);
                expect(putExtTagTypeSpy.calledOnce).to.be.true();
                putExtTagTypeSpy.restore();
                done();
            });

            it('should call res.json', function(done) {
                var resSpy = sinon.spy(res, 'json');

                tagsController.putExtTagType(req, res);
                expect(resSpy.calledOnce).to.be.true();
                resSpy.restore();
                done();
            });

            it('should call next for error callback', function(done) {
                var nextSpy = sinon.spy();

                tagsController.putExtTagType(req, res, nextSpy);
                errorCallback({});
                expect(nextSpy.calledOnce).to.be.true();
                done();
            });
        });

        describe('deleteExtTagType', function() {
            it('should exist', function() {
                expect(tagsController.deleteExtTagType).to.be.instanceOf(Function);
            });

            it('should call tagsApiClient.deleteExtTagType', function(done) {
                var deleteExtTagTypeSpe = sinon.spy(tagsApiClient, 'deleteExtTagType');

                tagsController.deleteExtTagType(req, res);
                expect(deleteExtTagTypeSpe.calledOnce).to.be.true();
                deleteExtTagTypeSpe.restore();
                done();
            });

            it('should call res.json', function(done) {
                var resSpy = sinon.spy(res, 'json');

                tagsController.deleteExtTagType(req, res);
                expect(resSpy.calledOnce).to.be.true();
                resSpy.restore();
                done();
            });

            it('should call next for error callback', function(done) {
                var nextSpy = sinon.spy();

                tagsController.deleteExtTagType(req, res, nextSpy);
                errorCallback({});
                expect(nextSpy.calledOnce).to.be.true();
                done();
            });
        });
    });
});
