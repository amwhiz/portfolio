'use strict';

var tagController,
    expect = require('chai').expect,
    sinon = require('sinon'),
    _ = require('lodash'),
    mockery = require('mockery'),
    sharedBehaviors = require('../sharedBehaviors'),
    errors = require('../../errors/errors'),
    tagServiceMock,
    tagTypeServiceMock,
    tagValidatorMock,
    tagIdGeneratorMock,
    request,
    response,
    next,
    promiseMock,
    thenCallbacks,
    catchCallbacks,
    BluebirdMock,
    spreadCallbacks,
    commonValidatorMock,
    tagResponseMapperMock;

describe('Tag Controller', function() {
    sharedBehaviors.mockery();

    before(function() {
        tagServiceMock = {
            getTagsWithCount: function() {
                return promiseMock;
            },
            getTagById: function() {
                return promiseMock;
            },
            createTag: function() {
                return promiseMock;
            },
            updateTagById: function() {
                return promiseMock;
            },
            removeTagById: function() {
                return promiseMock;
            },
            checkTagLabel: function() {
                return promiseMock;
            },
            findParent: function() {
                return promiseMock;
            },
            getLastId: function() {
                return promiseMock;
            }
        };

        tagTypeServiceMock = {
            getTagTypeById: function() {
                return promiseMock;
            }
        };

        tagValidatorMock = {
            validate: function() {
                return promiseMock;
            }
        };

        tagIdGeneratorMock = {
            generateId: function() {
                return 'SKL00001';
            }
        };

        commonValidatorMock = {
            checkId: function() {
                return false;
            }
        };

        BluebirdMock = {
            all: function() {
                return promiseMock;
            }
        };

        tagResponseMapperMock = {
            mapTagForGet: function() {
            },
            mapTagsForFlatList: function() {
            }
        };

        mockery.registerMock('../lib/tagValidator', tagValidatorMock);
        mockery.registerMock('../lib/tagIdGenerator', tagIdGeneratorMock);
        mockery.registerMock('../lib/commonValidator', commonValidatorMock);
        mockery.registerMock('bluebird', BluebirdMock);
        mockery.registerMock('../services/tag.service', tagServiceMock);
        mockery.registerMock('../services/tagType.service', tagTypeServiceMock);
        mockery.registerMock('../lib/tagResponseMapper', tagResponseMapperMock);
        tagController = require('../../controllers/tag.controller');
    });

    beforeEach(function() {
        thenCallbacks = [];
        catchCallbacks = [];
        spreadCallbacks = [];

        promiseMock = {
            then: function(cb) {
                thenCallbacks.push(cb);

                return this;
            },
            spread: function(cb) {
                spreadCallbacks.push(cb);

                return this;
            },
            catch: function(cb, cb2, cb3) {
                if (_.isUndefined(cb2)) {
                    catchCallbacks.push(cb);
                } else if (_.isUndefined(cb3)) {
                    catchCallbacks.push(cb2);
                } else {
                    catchCallbacks.push(cb3);
                }

                return this;
            }
        };

        request = sharedBehaviors.getRequestMock();
        response = sharedBehaviors.getResponseMock();
        next = sharedBehaviors.getNextMock();
    });

    it('should be defined object', function() {
        expect(tagController).to.be.a('object');
    });

    describe('getTags method', function() {
        it('should exist', function() {
            expect(tagController.getTags).to.be.a('function');
        });

        it('should run service method getTags', function() {
            var getTagsSpy = sinon.spy(tagServiceMock, 'getTagsWithCount');

            tagController.getTags(request, response, next);

            expect(getTagsSpy).to.have.been.callCount(1);
        });

        describe('first spreadCallback callback', function() {
            it('should exist', function() {
                tagController.getTags(request, response, next);
                expect(spreadCallbacks[0]).to.be.a('function');
            });

            it('should call res.sendSuccess', function() {
                var sendSuccessSpy = sinon.spy(tagResponseMapperMock, 'mapTagsForFlatList');

                tagController.getTags(request, response, next);
                spreadCallbacks[0]();
                expect(sendSuccessSpy).to.have.been.callCount(1);
            });
        });

        describe('second spreadCallback callback', function() {
            it('should exist', function(done) {
                tagController.getTags(request, response, next);
                expect(spreadCallbacks[1]).to.be.a('function');
                done();
            });

            it('should call res.sendSuccess', function() {
                var sendSuccessSpy = sinon.spy(response, 'sendSuccess');

                tagController.getTags(request, response, next);
                spreadCallbacks[1]();
                expect(sendSuccessSpy).to.have.been.callCount(1);
            });
        });

        describe('catch callback', function() {
            it('should exist', function(done) {
                tagController.getTags(request, response, next);
                expect(catchCallbacks[0]).to.be.a('function');
                done();
            });

            it('should call next', function() {
                var nextSpy = sinon.spy();

                tagController.getTags(request, response, nextSpy);
                catchCallbacks[0]();
                expect(nextSpy).to.have.been.callCount(1);
            });
        });
    });

    describe('getTagById method', function() {
        it('should exist', function(done) {
            expect(tagController.getTagById).to.be.a('function');
            done();
        });

        it('should run service method getTagById', function() {
            var getTagByIdSpy = sinon.spy(tagServiceMock, 'getTagById');

            tagController.getTagById(request, response, next);

            expect(getTagByIdSpy).to.have.been.callCount(1);
        });

        describe('then callback', function() {
            it('should exist', function(done) {
                tagController.getTagById(request, response, next);
                expect(thenCallbacks[0]).to.be.a('function');
                done();
            });

            it('should call res.sendNotFound when data is empty', function() {
                var sendNotFoundSpy = sinon.spy(response, 'sendNotFound');

                tagController.getTagById(request, response, next);
                thenCallbacks[0]('');
                expect(sendNotFoundSpy).to.have.been.callCount(1);
            });

            it('should call res.sendSuccess when data is not empty', function() {
                var data = {id: 'some'},
                    sendSuccessSpy = sinon.spy(response, 'sendSuccess');

                tagController.getTagById(request, response, next);
                thenCallbacks[0](data);
                expect(sendSuccessSpy).to.have.been.callCount(1);
            });
        });

        describe('catch callback', function() {
            it('should exist', function(done) {
                tagController.getTagById(request, response, next);
                expect(catchCallbacks[0]).to.be.a('function');
                done();
            });

            it('should call next', function() {
                var nextSpy = sinon.spy();

                tagController.getTagById(request, response, nextSpy);
                catchCallbacks[0]();
                expect(nextSpy).to.have.been.callCount(1);
            });
        });
    });

    describe('createTag method', function() {
        it('should exist', function() {
            expect(tagController.createTag).to.be.a('function');
        });

        it('should run service method getTagTypeById and findParent', function() {
            var getTagTypeByIdSpy = sinon.spy(tagTypeServiceMock, 'getTagTypeById'),
                findParentSpy = sinon.spy(tagServiceMock, 'findParent');

            tagController.createTag(request, response, next);

            expect(getTagTypeByIdSpy).to.have.been.callCount(1);
            expect(findParentSpy).to.have.been.callCount(1);

            getTagTypeByIdSpy.restore();
            findParentSpy.restore();
        });

        describe('first spread callback', function() {
            it('should exist', function() {
                tagController.createTag(request, response);
                expect(spreadCallbacks[0]).to.be.a('function');
            });

            it('should call throw MissingTagTypeError for empty data argument', function() {
                tagController.createTag(request, response);
                expect(function() {
                    spreadCallbacks[0]([]);
                }).to.throw();
            });

            it('should call throw CannotFindParentError for non-empty tagType, empty parent and existing parentTagId', function() {
                var tagType = {tagTypeLabel: 'SKL'};

                request.body.parentTagId = 'SKL00001';
                tagController.createTag(request, response);
                expect(function() {
                    spreadCallbacks[0](tagType, {});
                }).to.throw();
            });

            it('should call tagService createTag when there is some data', function() {
                var checkTagLabelSpy = sinon.spy(tagServiceMock, 'checkTagLabel'),
                    tagType;

                tagType = {tagTypeLabel: 'SKL'};

                tagController.createTag(request, response);
                spreadCallbacks[0](tagType, {});
                expect(checkTagLabelSpy).to.have.been.callCount(1);
            });
        });

        describe('second spread callback', function() {
            it('should exist', function() {
                tagController.createTag(request, response);
                expect(spreadCallbacks[1]).to.be.a('function');
            });

            it('should throw error for not empty data', function() {
                var data = {data: 'some'};

                tagController.createTag(request, response);
                expect(function() {
                    spreadCallbacks[1](data, {}, {});
                }).to.throw();
            });

            it('should call validate for empty data and not empty body', function() {
                var validateSpy = sinon.spy(tagValidatorMock, 'validate');

                request.body = {
                    tagId: 'tag_id'
                };

                tagController.createTag(request, response);
                spreadCallbacks[1]('', {}, {}, {});
                expect(validateSpy).to.have.been.callCount(1);
                validateSpy.restore();
            });
        });

        describe('third spread callback', function() {
            it('should exist', function() {
                tagController.createTag(request, response);
                expect(spreadCallbacks[2]).to.be.a('function');
            });

            it('should call res.sendCreated when data is empty', function() {
                var createTagSpy = sinon.spy(tagServiceMock, 'findParent');

                tagController.createTag(request, response);
                spreadCallbacks[2]('');
                expect(createTagSpy).to.have.been.callCount(1);
            });
        });

        describe('first then callback', function() {
            it('should exist', function() {
                tagController.createTag(request, response);
                expect(thenCallbacks[0]).to.be.a('function');
            });

            it('should call res.sendCreated', function() {
                var sendCreatedSpy = sinon.spy(response, 'sendCreated');

                tagController.createTag(request, response);
                thenCallbacks[0]('');
                expect(sendCreatedSpy).to.have.been.callCount(1);
            });
        });

        describe('first catch callback', function() {
            it('should exist', function() {
                tagController.createTag(request, response);
                expect(catchCallbacks[0]).to.be.a('function');
            });

            it('should call res.sendBadRequest()', function() {
                var sendBadRequestSpy = sinon.spy(response, 'sendBadRequest');

                tagController.createTag(request, response);
                catchCallbacks[0](new errors.MissingTagTypeError());
                expect(sendBadRequestSpy).to.have.been.callCount(1);
            });
        });

        describe('second catch callback', function() {
            it('should exist', function() {
                tagController.createTag(request, response);
                expect(catchCallbacks[1]).to.be.a('function');
            });

            it('should call res.sendConflict()', function() {
                var sendConflictSpy = sinon.spy(response, 'sendConflict');

                tagController.createTag(request, response);
                catchCallbacks[1](new errors.DuplicatedTagError());
                expect(sendConflictSpy).to.have.been.callCount(1);
            });
        });

        describe('third catch callback', function() {
            it('should exist', function() {
                tagController.createTag(request, response);
                expect(catchCallbacks[2]).to.be.a('function');
            });

            it('should call res.sendBadRequest() for ValidationError', function() {
                var sendBadRequestSpy = sinon.spy(response, 'sendBadRequest');

                tagController.createTag(request, response, next);
                catchCallbacks[2]({
                    name: 'ValidationError'
                });
                expect(sendBadRequestSpy).to.have.been.callCount(1);
            });

            it('should call next', function() {
                var nextSpy = sinon.spy();

                tagController.createTag(request, response, nextSpy);
                catchCallbacks[2]();
                expect(nextSpy).to.have.been.callCount(1);
            });
        });
    });

    describe('updateTagById method', function() {
        it('should exist', function() {
            expect(tagController.updateTagById).to.be.a('function');
        });

        it('should run service method updateTagById', function() {
            var validateSpy = sinon.spy(tagValidatorMock, 'validate');

            tagController.updateTagById(request, response, next);

            expect(validateSpy).to.have.been.callCount(1);
        });

        describe('first then callback', function() {
            it('should exist', function() {
                tagController.updateTagById(request, response, next);
                expect(thenCallbacks[0]).to.be.a('function');
            });

            it('should throw error when validator returns true', function() {
                var checkIdStub = sinon.stub(commonValidatorMock, 'checkId').returns(true);

                tagController.updateTagById(request, response, next);
                expect(function() {
                    thenCallbacks[0]();
                }).to.throw();

                checkIdStub.restore();
            });

            it('should call commonValidator.checkId when data is empty', function() {
                var checkIdSpy = sinon.spy(commonValidatorMock, 'checkId');

                tagController.updateTagById(request, response, next);
                thenCallbacks[0]('');
                expect(checkIdSpy).to.have.been.callCount(1);
                checkIdSpy.restore();
            });
        });

        describe('second then callback', function() {
            it('should exist', function() {
                tagController.updateTagById(request, response, next);
                expect(thenCallbacks[1]).to.be.a('function');
            });

            it('should call res.sendCreated when data is empty', function() {
                var sendCreatedSpy = sinon.spy(response, 'sendCreated');

                tagController.updateTagById(request, response, next);
                thenCallbacks[1]('');
                expect(sendCreatedSpy).to.have.been.callCount(1);
            });
        });

        describe('first catch callback', function() {
            it('should exist', function() {
                tagController.updateTagById(request, response, next);
                expect(catchCallbacks[0]).to.be.a('function');
            });

            it('should call res.sendConflict()', function() {
                var sendConflictSpy = sinon.spy(response, 'sendConflict');

                tagController.updateTagById(request, response, next);
                catchCallbacks[0]();
                expect(sendConflictSpy).to.have.been.callCount(1);
            });
        });

        describe('second catch callback', function() {
            it('should exist', function() {
                tagController.updateTagById(request, response, next);
                expect(catchCallbacks[1]).to.be.a('function');
            });

            it('should call res.sendBadRequest() for ValidationError', function() {
                var sendBadRequestSpy = sinon.spy(response, 'sendBadRequest');

                tagController.updateTagById(request, response, next);
                catchCallbacks[1]({
                    name: 'ValidationError'
                });
                expect(sendBadRequestSpy).to.have.been.callCount(1);
            });

            it('should call next()', function() {
                var nextSpy = sinon.spy();

                tagController.updateTagById(request, response, nextSpy);
                catchCallbacks[1]();
                expect(nextSpy).to.have.been.callCount(1);
            });
        });
    });

    describe('removeTagById method', function() {
        it('should exist', function() {
            expect(tagController.removeTagById).to.be.a('function');
        });

        it('should run service method removeTagById', function() {
            var removeTagByIdSpy = sinon.spy(tagServiceMock, 'removeTagById');

            tagController.removeTagById(request, response, next);

            expect(removeTagByIdSpy).to.have.been.callCount(1);
        });

        describe('then callback', function() {
            it('should exist', function(done) {
                tagController.removeTagById(request, response, next);
                expect(thenCallbacks[0]).to.be.a('function');
                done();
            });

            it('should call res.sendNoContent when data is empty', function() {
                var sendNoContentSpy = sinon.spy(response, 'sendNoContent');

                tagController.removeTagById(request, response, next);
                thenCallbacks[0]([]);
                expect(sendNoContentSpy).to.have.been.callCount(1);
            });

            it('should call res.send when data is empty', function() {
                var sendSpy = sinon.spy(response, 'send');

                tagController.removeTagById(request, response, next);
                thenCallbacks[0]([1]);
                expect(sendSpy).to.have.been.callCount(1);
            });
        });

        describe('first catch callback', function() {
            it('should exist', function() {
                tagController.removeTagById(request, response, next);
                expect(catchCallbacks[0]).to.be.a('function');
            });

            it('should call res.sendConflict', function() {
                var sendConflictSpy = sinon.spy(response, 'sendConflict');

                tagController.removeTagById(request, response, next);
                catchCallbacks[0]();
                expect(sendConflictSpy).to.have.been.callCount(1);
            });
        });

        describe('second catch callback', function() {
            it('should exist', function() {
                tagController.removeTagById(request, response, next);
                expect(catchCallbacks[1]).to.be.a('function');
            });

            it('should call next()', function() {
                var nextSpy = sinon.spy();

                tagController.removeTagById(request, response, nextSpy);
                catchCallbacks[1]();
                expect(nextSpy).to.have.been.callCount(1);
            });
        });
    });
});