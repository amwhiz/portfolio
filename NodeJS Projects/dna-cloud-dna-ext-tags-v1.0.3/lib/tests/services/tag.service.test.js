'use strict';

var tagService,
    chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    mockery = require('mockery'),
    sharedBehaviors = require('../sharedBehaviors'),
    dbStorage = {},
    dnaMocks = require('dna-cloud-dna-ext-mocks'),
    promiseMock,
    mapCallback,
    spreadCallback,
    thenCallback,
    bluebirdMock,
    additionalInformationDecoratorMock;

chai.use(sinonChai);

function modelMock() {
}

describe('Tag service', function() {
    sharedBehaviors.mockery();

    before(function() {
        promiseMock = {
            map: function(cb) {
                mapCallback = cb;

                return promiseMock;
            },
            then: function(cb) {
                thenCallback = cb;

                return promiseMock;
            },
            spread: function(cb) {
                spreadCallback = cb;

                return promiseMock;
            }
        };

        modelMock.schema = {paths: '_id'};

        modelMock.findAsync = function() {
            return promiseMock;
        };

        modelMock.countAsync = function() {
            return promiseMock;
        };

        modelMock.findOneAsync = function() {
            return promiseMock;
        };

        modelMock.findOneAndUpdateAsync = function() {
            return promiseMock;
        };

        modelMock.prototype.saveAsync = function() {
            return promiseMock;
        };

        modelMock.removeAsync = function() {
            return promiseMock;
        };

        modelMock.getAncestorsAsync = function() {
            return promiseMock;
        };

        dnaMocks.cloudDnaDb.model = function() {
            return modelMock;
        };

        dbStorage.getDb = function() {
            return dnaMocks.cloudDnaDb;
        };

        bluebirdMock = {
            all: function() {
                return promiseMock;
            }
        };

        additionalInformationDecoratorMock = {
            decorate: function() {
            }
        };

        mockery.registerMock('bluebird', bluebirdMock);
        mockery.registerMock('../lib/additionalInformationDecorator', additionalInformationDecoratorMock);
        mockery.registerMock('../lib/dbStorage', dbStorage);

        tagService = require('../../services/tag.service');
    });

    it('should be defined object', function() {
        expect(tagService).to.be.a('object');
    });

    describe('checkTagLabel method', function() {
        it('should exist', function() {
            expect(tagService.checkTagLabel).to.be.a('function');
        });

        it('should run model findAsync method', function() {
            var spy = sinon.spy(modelMock, 'findAsync');

            tagService.checkTagLabel();
            expect(spy).to.have.been.callCount(1);
            spy.restore();
        });

        describe('map callback', function() {
            it('should exist', function() {
                expect(mapCallback).to.be.a('function');
            });

            it('should run model findAsync method', function() {
                var spy = sinon.spy(bluebirdMock, 'all');

                tagService.checkTagLabel();
                mapCallback(modelMock);
                expect(spy).to.have.been.callCount(1);
            });
        });
    });

    describe('getTagTypes method', function() {
        it('should exist', function() {
            expect(tagService.getTagsWithCount).to.be.a('function');
        });

        it('should run model findAsync method', function() {
            var spy = sinon.spy(modelMock, 'findAsync');

            tagService.getTagsWithCount();
            expect(spy).to.have.been.callCount(1);
        });

        it('should run model countAsync method', function() {
            var spy = sinon.spy(modelMock, 'countAsync');

            tagService.getTagsWithCount();
            expect(spy).to.have.been.callCount(1);
        });

        it('should return promise', function() {
            expect(tagService.getTagsWithCount()).to.deep.equal(promiseMock);
        });

        after(function() {
            modelMock.countAsync.restore();
            modelMock.findAsync.restore();
        });
    });

    describe('getTagById method', function() {
        it('should exist', function() {
            expect(tagService.getTagById).to.be.a('function');
        });

        it('should run model findOneAsync method', function() {
            var spy = sinon.spy(modelMock, 'findOneAsync');

            tagService.getTagById();
            expect(spy).to.have.been.callCount(1);
        });

        it('should return promise', function() {
            expect(tagService.getTagById()).to.deep.equal(promiseMock);
        });

        describe('then callback', function() {
            it('should exist', function() {
                expect(thenCallback).to.be.a('function');
            });

            it('should run model getChildrenTreeAsync method', function() {
                var spy,
                    tagMock;

                tagMock = {
                    getChildrenTreeAsync: function() {
                    }
                };

                spy = sinon.spy(tagMock, 'getChildrenTreeAsync')

                thenCallback(tagMock);
                expect(spy).to.have.been.callCount(1);
            });
        });

        describe('spread callback callback', function() {
            it('should exist', function() {
                expect(spreadCallback).to.be.a('function');
            });

            it('should run model getChildrenTreeAsync method', function() {
                var spy,
                    tagMock;

                tagMock = {
                    toJSON: function() {
                        return {};
                    }
                };

                spy = sinon.spy(tagMock, 'toJSON')

                spreadCallback(tagMock, []);
                expect(spy).to.have.been.callCount(1);
            });
        });

        after(function() {
            modelMock.findOneAsync.restore();
        });
    });

    describe('getTagsByTagTypeId method', function() {
        it('should exist', function() {
            expect(tagService.getTagsByTagTypeId).to.be.a('function');
        });

        it('should run model findAsync method', function() {
            var spy = sinon.spy(modelMock, 'findAsync');

            tagService.getTagsByTagTypeId({});
            expect(spy).to.have.been.callCount(1);
        });

        it('should return promise', function() {
            expect(tagService.getTagsByTagTypeId({})).to.deep.equal(promiseMock);
        });
    });

    describe('countTagsByTagTypeId method', function() {
        it('should exist', function() {
            expect(tagService.countTagsByTagTypeId).to.be.a('function');
        });

        it('should run model countAsync method', function() {
            var spy = sinon.spy(modelMock, 'countAsync');

            tagService.countTagsByTagTypeId({});
            expect(spy).to.have.been.callCount(1);
        });

        it('should return promise', function() {
            expect(tagService.countTagsByTagTypeId({})).to.deep.equal(promiseMock);
        });

        after(function() {
            modelMock.countAsync.restore();
        });
    });

    describe('findParent method', function() {
        it('should exist', function() {
            expect(tagService.findParent).to.be.a('function');
        });

        it('should run model findOneAsync method', function() {
            var spy = sinon.spy(modelMock, 'findOneAsync');

            tagService.findParent({});
            expect(spy).to.have.been.callCount(1);
            spy.restore();
        });
    });

    describe('createTag method', function() {
        it('should exist', function() {
            expect(tagService.createTag).to.be.a('function');
        });

        it('should run additionalInformationDecoratorMock decorate', function() {
            var spy = sinon.spy(additionalInformationDecoratorMock, 'decorate');

            tagService.createTag({}, {});
            expect(spy).to.have.been.callCount(1);
            spy.restore();
        });
    });

    describe('updateTagById method', function() {
        it('should exist', function() {
            expect(tagService.updateTagById).to.be.a('function');
        });

        it('should run model findOneAndUpdateAsync method', function() {
            var spy = sinon.spy(modelMock, 'findOneAndUpdateAsync');

            tagService.updateTagById();
            expect(spy).to.have.been.callCount(1);
        });

        it('should return promise', function() {
            expect(tagService.updateTagById()).to.deep.equal(promiseMock);
        });
    });

    describe('removeTagById method', function() {
        it('should exist', function() {
            expect(tagService.removeTagById).to.be.a('function');
        });

        it('should run model removeAsync method', function() {
            var spy = sinon.spy(tagService, 'getTagById');

            tagService.removeTagById();
            expect(spy).to.have.been.callCount(1);
            spy.restore();
        });

        it('should return promise', function() {
            expect(tagService.removeTagById()).to.deep.equal(promiseMock);
        });

        it('should throw exception for non-empty children', function() {
            var stub = sinon.stub(tagService, 'removeTagById').returns(promiseMock);

            tagService.removeTagById();
            expect(function() {
                thenCallback({
                    children: [1, 2]
                });
            }).to.throw();

            stub.restore();
        });

        it('should call removeAsync for empty children', function() {
            var stub = sinon.stub(tagService, 'removeTagById').returns(promiseMock),
                spy = sinon.spy(modelMock, 'removeAsync');

            tagService.removeTagById();
            thenCallback({});
            expect(spy).to.have.been.callCount(1);

            stub.restore();
            spy.restore();
        });
    });

    describe('getLastId method', function() {
        it('should exist', function() {
            expect(tagService.getLastId).to.be.a('function');
        });

        it('should run model findOneAsync method', function() {
            var spy = sinon.spy(modelMock, 'findOneAsync');

            tagService.getLastId();
            expect(spy).to.have.been.callCount(1);
            spy.restore();
        });
    });
});
