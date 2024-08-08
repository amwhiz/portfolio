'use strict';

var tagTypeController,
    chai = require('chai'),
    sinon = require('sinon'),
    _ = require('lodash'),
    mockery = require('mockery'),
    sharedBehaviors = require('../sharedBehaviors'),
    errors = require('../../errors/errors'),
    expect = chai.expect,
    tagTypeServiceMock,
    tagServiceMock,
    BluebirdMock,
    request,
    response,
    next,
    promiseMock,
    bluebirdPromiseMock,
    tagTypeOutputDecoratorMock,
    tagTypeValidatorMock,
    tagTypeIdGeneratorMock,
    commonValidatorMock,
    tagResponseMapperMock,
    tagTypeResponseMapperMock,
    thenCallbacks,
    mapCallback,
    map2Callback,
    spreadCallback,
    catchCallbacks;

chai.use(require('sinon-chai'));

describe('Tag Type Controller', function() {
    sharedBehaviors.mockery();

    before(function() {
        tagTypeServiceMock = {
            getTagTypes: function() {
                return promiseMock;
            },
            getTagTypeById: function() {
                return promiseMock;
            },
            createTagType: function() {
                return promiseMock;
            },
            updateTagTypeById: function() {
                return promiseMock;
            },
            removeTagTypeById: function() {
                return promiseMock;
            }
        };

        tagServiceMock = {
            countTagsByTagTypeId: function() {
                return promiseMock;
            },
            getTagsByTagTypeId: function() {
                return promiseMock;
            }
        };

        BluebirdMock = {
            all: function() {
                return bluebirdPromiseMock;
            },
            resolve: function() {
                return promiseMock;
            }
        };

        tagTypeOutputDecoratorMock = {
            decorateWithCount: function() {
                return promiseMock;
            },
            decorateWithTags: function() {
                return promiseMock;
            }
        };

        tagTypeValidatorMock = {
            validate: function() {
                return promiseMock;
            }
        };

        tagTypeIdGeneratorMock = {
            generateId: function() {
                return 'SKL';
            }
        };

        commonValidatorMock = {
            checkId: function() {
                return false;
            }
        };

        tagResponseMapperMock = {};

        tagTypeResponseMapperMock = {
            mapTagTypeForGet: function() {
            }
        };

        mockery.registerMock('../lib/tagTypeOutputDecorator', tagTypeOutputDecoratorMock);
        mockery.registerMock('../lib/tagTypeValidator', tagTypeValidatorMock);
        mockery.registerMock('../lib/commonValidator', commonValidatorMock);
        mockery.registerMock('../lib/tagTypeIdGenerator', tagTypeIdGeneratorMock);
        mockery.registerMock('../services/tagType.service', tagTypeServiceMock);
        mockery.registerMock('bluebird', BluebirdMock);
        mockery.registerMock('../services/tag.service', tagServiceMock);
        mockery.registerMock('../lib/tagTypeResponseMapper', tagTypeResponseMapperMock);
        mockery.registerMock('../lib/tagResponseMapper', tagResponseMapperMock);
        tagTypeController = require('../../controllers/tagType.controller');
    });

    beforeEach(function() {
        thenCallbacks = [];
        catchCallbacks = [];
        spreadCallback = null;
        mapCallback = null;
        map2Callback = null;
        promiseMock = {
            then: function(cb) {
                thenCallbacks.push(cb);

                return this;
            },
            map: function(cb) {
                mapCallback = cb;

                return bluebirdPromiseMock;
            },
            catch: function(cb, cb2) {
                if (_.isUndefined(cb2)) {
                    catchCallbacks.push(cb);
                } else {
                    catchCallbacks.push(cb2);
                }

                return this;
            }
        };

        bluebirdPromiseMock = {
            spread: function(cb) {
                spreadCallback = cb;

                return promiseMock;
            },
            map: function(cb) {
                map2Callback = cb;

                return promiseMock;
            }
        };

        request = sharedBehaviors.getRequestMock();
        response = sharedBehaviors.getResponseMock();
        next = sharedBehaviors.getNextMock();
    });

    it('should be defined object', function() {
        expect(tagTypeController).to.be.a('object');
    });

    describe('getTagTypes method', function() {
        it('should exist', function() {
            expect(tagTypeController.getTagTypes).to.be.a('function');
        });

        it('should run service method getTagTypes', function() {
            var getTagTypesSpy = sinon.spy(tagTypeServiceMock, 'getTagTypes');

            tagTypeController.getTagTypes(request, response, next);

            expect(getTagTypesSpy).to.have.been.callCount(1);
        });

        describe('map callback', function() {
            it('should exist', function() {
                tagTypeController.getTagTypes(request, response, next);
                expect(mapCallback).to.be.a('function');
            });

            it('should call getTagsByTagTypeId', function() {
                var data = [{}, {}],
                    getTagsByTagTypeIdSpy = sinon.spy(tagServiceMock, 'getTagsByTagTypeId');

                request.query.expand = true;

                tagTypeController.getTagTypes(request, response, next);
                mapCallback(data);
                expect(getTagsByTagTypeIdSpy).to.have.been.callCount(1);
                getTagsByTagTypeIdSpy.restore();
            });

            it('should call all', function() {
                var data = [{}, {}],
                    allSpy = sinon.spy(BluebirdMock, 'all');

                tagTypeController.getTagTypes(request, response, next);
                mapCallback(data);
                expect(allSpy).to.have.been.callCount(1);
            });
        });

        describe('map spread callback', function() {
            it('should exist', function() {
                tagTypeController.getTagTypes(request, response, next);
                expect(map2Callback).to.be.a('function');
            });

            it('should call decorateWithCount for no expand param', function() {
                var data = [
                        {},
                        {}
                    ],
                    allSpy = sinon.spy(tagTypeOutputDecoratorMock, 'decorateWithCount');

                tagTypeController.getTagTypes(request, response, next);
                map2Callback(data);
                expect(allSpy).to.have.been.callCount(1);
            });

            it('should call decorateWithTags for expand param', function() {
                var data = [
                        {},
                        {}
                    ],
                    allSpy = sinon.spy(tagTypeOutputDecoratorMock, 'decorateWithTags');

                request.query.expand = true;

                tagTypeController.getTagTypes(request, response, next);
                map2Callback(data);
                expect(allSpy).to.have.been.callCount(1);
            });
        });

        describe('first then callback', function() {
            it('should exist', function() {
                tagTypeController.getTagTypes(request, response, next);
                expect(thenCallbacks[0]).to.be.a('function');
            });

            it('should call res.sendSuccess', function() {
                var data = [
                        {},
                        {}
                    ],
                    sendSuccessSpy = sinon.spy(response, 'sendSuccess');

                tagTypeController.getTagTypes(request, response, next);
                thenCallbacks[0](data);
                expect(sendSuccessSpy).to.have.been.callCount(1);
            });
        });

        describe('catch callback', function() {
            it('should exist', function() {
                tagTypeController.getTagTypes(request, response, next);
                expect(catchCallbacks[0]).to.be.a('function');
            });

            it('should call next', function() {
                var nextSpy = sinon.spy();

                tagTypeController.getTagTypes(request, response, nextSpy);
                catchCallbacks[0]();
                expect(nextSpy).to.have.been.callCount(1);
            });
        });
    });

    describe('getTagTypeById method', function() {
        it('should exist', function() {
            expect(tagTypeController.getTagTypeById).to.be.a('function');
        });

        it('should run service method getTagTypeById', function() {
            var getTagTypeByIdSpy = sinon.spy(tagTypeServiceMock, 'getTagTypeById'),
                getTagsByTagTypeIdSpy = sinon.spy(tagServiceMock, 'getTagsByTagTypeId');

            tagTypeController.getTagTypeById(request, response, next);

            expect(getTagTypeByIdSpy).to.have.been.callCount(1);
            expect(getTagsByTagTypeIdSpy).to.have.been.callCount(1);
        });

        describe('spread callback', function() {
            it('should exist', function() {
                tagTypeController.getTagTypeById(request, response, next);
                expect(spreadCallback).to.be.a('function');
            });

            it('should call res.sendNotFound when data is empty', function() {
                var sendNotFoundSpy = sinon.spy(response, 'sendNotFound');

                tagTypeController.getTagTypeById(request, response, next);
                spreadCallback('');
                expect(sendNotFoundSpy).to.have.been.callCount(1);
            });

            it('should call res.sendSuccess when data is not empty', function() {
                var data = {id: 'some'},
                    sendSuccessSpy = sinon.spy(response, 'sendSuccess');

                tagTypeController.getTagTypeById(request, response, next);
                spreadCallback(data);
                expect(sendSuccessSpy).to.have.been.callCount(1);
            });
        });

        describe('catch callback', function() {
            it('should exist', function() {
                tagTypeController.getTagTypeById(request, response, next);
                expect(catchCallbacks[0]).to.be.a('function');
            });

            it('should call next', function() {
                var nextSpy = sinon.spy();

                tagTypeController.getTagTypeById(request, response, nextSpy);
                catchCallbacks[0]();
                expect(nextSpy).to.have.been.callCount(1);
            });
        });
    });

    describe('createTagType method', function() {
        it('should exist', function() {
            expect(tagTypeController.createTagType).to.be.a('function');
        });

        it('should run tagTypeValidator method resolve', function() {
            var resolveSpy = sinon.spy(BluebirdMock, 'resolve');

            tagTypeController.createTagType(request, response, next);

            expect(resolveSpy).to.have.been.callCount(1);
            resolveSpy.restore();
        });

        describe('first then callback', function() {
            it('should exist', function() {
                tagTypeController.createTagType(request, response, next);
                expect(thenCallbacks[0]).to.be.a('function');
            });

            it('should call service.createTagType when data is empty', function() {
                var validateSpy = sinon.spy(tagTypeValidatorMock, 'validate');

                tagTypeController.createTagType(request, response, next);
                thenCallbacks[0]('');
                expect(validateSpy).to.have.been.callCount(1);
                validateSpy.restore();
            });
        });

        describe('second then callback', function() {
            it('should exist', function() {
                tagTypeController.createTagType(request, response, next);
                expect(thenCallbacks[1]).to.be.a('function');
            });

            it('should call service.createTagType when data is empty', function() {
                var createTagTypeSpy = sinon.spy(tagTypeServiceMock, 'createTagType');

                tagTypeController.createTagType(request, response, next);
                thenCallbacks[1]('');
                expect(createTagTypeSpy).to.have.been.callCount(1);
            });
        });

        describe('third then callback', function() {
            it('should exist', function() {
                tagTypeController.createTagType(request, response, next);
                expect(thenCallbacks[2]).to.be.a('function');
            });

            it('should call res.sendCreated when data is empty', function() {
                var sendCreatedSpy = sinon.spy(response, 'sendCreated');

                tagTypeController.createTagType(request, response, next);
                thenCallbacks[2]('');
                expect(sendCreatedSpy).to.have.been.callCount(1);
            });
        });

        describe('first catch callback', function() {
            it('should exist', function() {
                tagTypeController.createTagType(request, response, next);
                expect(catchCallbacks[0]).to.be.a('function');
            });

            it('should call next()', function() {
                var sendConflictSpy = sinon.spy(response, 'sendConflict');

                tagTypeController.createTagType(request, response, next);
                catchCallbacks[0](new errors.DuplicatedTagTypeError());
                expect(sendConflictSpy).to.have.been.callCount(1);
            });
        });

        describe('second catch callback', function() {
            it('should exist', function() {
                tagTypeController.createTagType(request, response, next);
                expect(catchCallbacks[1]).to.be.a('function');
            });

            it('should call res.sendBadRequest for validation error', function() {
                var sendBadRequestSpy = sinon.spy(response, 'sendBadRequest'),
                    err;

                err = {
                    name: 'ValidationError'
                };

                tagTypeController.createTagType(request, response, next);
                catchCallbacks[1](err);
                expect(sendBadRequestSpy).to.have.been.callCount(1);
            });

            it('should call next', function() {
                var nextSpy = sinon.spy();

                tagTypeController.createTagType(request, response, nextSpy);
                catchCallbacks[1]();
                expect(nextSpy).to.have.been.callCount(1);
            });
        });
    });

    describe('updateTagTypeById method', function() {
        it('should exist', function() {
            expect(tagTypeController.updateTagTypeById).to.be.a('function');
        });

        it('should run tagTypeValidator method validate', function() {
            var validateSpy = sinon.spy(tagTypeValidatorMock, 'validate');

            tagTypeController.updateTagTypeById(request, response, next);

            expect(validateSpy).to.have.been.callCount(1);
            validateSpy.restore();
        });

        describe('first then callback', function() {
            it('should exist', function() {
                tagTypeController.updateTagTypeById(request, response, next);
                expect(thenCallbacks[0]).to.be.a('function');
            });

            it('should throw error when checkId returns true', function() {
                var checkIdStub = sinon.stub(commonValidatorMock, 'checkId').returns(true);

                tagTypeController.updateTagTypeById(request, response, next);
                expect(function() {
                    thenCallbacks[0]('');
                }).to.throw();
                checkIdStub.restore();
            });

            it('should call tagTypeServiceMock.updateTagTypeById when data is empty', function() {
                var updateTagTypeByIdSpy = sinon.spy(tagTypeServiceMock, 'updateTagTypeById');

                tagTypeController.updateTagTypeById(request, response, next);
                thenCallbacks[0]('');
                expect(updateTagTypeByIdSpy).to.have.been.callCount(1);
            });
        });

        describe('second then callback', function() {
            it('should exist', function() {
                tagTypeController.updateTagTypeById(request, response, next);
                expect(thenCallbacks[1]).to.be.a('function');
            });

            it('should call res.sendCreated when data is empty', function() {
                var sendCreatedSpy = sinon.spy(response, 'sendCreated');

                tagTypeController.updateTagTypeById(request, response, next);
                thenCallbacks[1]('');
                expect(sendCreatedSpy).to.have.been.callCount(1);
            });
        });

        describe('first catch callback', function() {
            it('should exist', function() {
                tagTypeController.updateTagTypeById(request, response, next);
                expect(catchCallbacks[0]).to.be.a('function');
            });

            it('should call res.sendConflict()', function() {
                var sendConflictSpy = sinon.spy(response, 'sendConflict');

                tagTypeController.updateTagTypeById(request, response, next);
                catchCallbacks[0]();
                expect(sendConflictSpy).to.have.been.callCount(1);
            });
        });

        describe('second catch callback', function() {
            it('should exist', function() {
                tagTypeController.updateTagTypeById(request, response, next);
                expect(catchCallbacks[1]).to.be.a('function');
            });

            it('should call res.sendBadRequest for validation error', function() {
                var sendBadRequestSpy = sinon.spy(response, 'sendBadRequest'),
                    err;

                err = {
                    name: 'ValidationError'
                };

                tagTypeController.updateTagTypeById(request, response, next);
                catchCallbacks[1](err);
                expect(sendBadRequestSpy).to.have.been.callCount(1);
            });

            it('should call next()', function() {
                var nextSpy = sinon.spy();

                tagTypeController.updateTagTypeById(request, response, nextSpy);
                catchCallbacks[1]();
                expect(nextSpy).to.have.been.callCount(1);
            });
        });
    });

    describe('removeTagTypeById method', function() {
        it('should exist', function() {
            expect(tagTypeController.removeTagTypeById).to.be.a('function');
        });

        it('should run service method countTagsByTagTypeId', function() {
            var countTagsByTagTypeIdSpy = sinon.spy(tagServiceMock, 'countTagsByTagTypeId');

            tagTypeController.removeTagTypeById(request, response, next);

            expect(countTagsByTagTypeIdSpy).to.have.been.callCount(1);
        });

        describe('first then callback', function() {
            it('should exist', function() {
                tagTypeController.removeTagTypeById(request, response, next);
                expect(thenCallbacks[0]).to.be.a('function');
            });

            it('should throw NotEmptyTagTypeError for count argument bigger then zero', function() {
                tagTypeController.removeTagTypeById(request, response, next);
                expect(function() {
                    thenCallbacks[0](1);
                }).to.throw();
            });

            it('should call tagTypeService.removeTagTypeById when count is zero', function() {
                var removeTagTypeByIdSpy = sinon.spy(tagTypeServiceMock, 'removeTagTypeById');

                tagTypeController.removeTagTypeById(request, response, next);
                thenCallbacks[0](0);
                expect(removeTagTypeByIdSpy).to.have.been.callCount(1);
            });
        });

        describe('second then callback', function() {
            it('should exist', function() {
                tagTypeController.removeTagTypeById(request, response, next);
                expect(thenCallbacks[1]).to.be.a('function');
            });

            it('should call res.status when count is zero', function() {
                var statusSpy = sinon.spy(response, 'status');

                tagTypeController.removeTagTypeById(request, response, next);
                thenCallbacks[1]([1]);
                expect(statusSpy).to.have.been.callCount(1);
            });

            it('should call res.sendNoContent when count is zero', function() {
                var sendNoContentSpy = sinon.spy(response, 'sendNoContent');

                tagTypeController.removeTagTypeById(request, response, next);
                thenCallbacks[1]([]);
                expect(sendNoContentSpy).to.have.been.callCount(1);
            });
        });

        describe('first catch callback', function() {
            it('should exist', function() {
                tagTypeController.removeTagTypeById(request, response, next);
                expect(catchCallbacks[0]).to.be.a('function');
            });

            it('should call next()', function() {
                var sendConflictSpy = sinon.spy(response, 'sendConflict');

                tagTypeController.removeTagTypeById(request, response, next);
                catchCallbacks[0](new errors.NotEmptyTagTypeError());
                expect(sendConflictSpy).to.have.been.callCount(1);
            });
        });

        describe('second catch callback', function() {
            it('should exist', function() {
                tagTypeController.removeTagTypeById(request, response, next);
                expect(catchCallbacks[1]).to.be.a('function');
            });

            it('should call next()', function() {
                var nextSpy = sinon.spy();

                tagTypeController.removeTagTypeById(request, response, nextSpy);
                catchCallbacks[1]();
                expect(nextSpy).to.have.been.callCount(1);
            });
        });
    });
});
