'use strict';

var tagTypeService,
    chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    mockery = require('mockery'),
    sharedBehaviors = require('../sharedBehaviors'),
    dbStorage = {},
    dnaMocks = require('dna-cloud-dna-ext-mocks'),
    promiseMock,
    modelMock;

chai.use(sinonChai);

describe('Tag Type service', function() {
    sharedBehaviors.mockery();

    before(function() {
        promiseMock = {};

        modelMock = {
            schema: {
                paths: '_id'
            },
            findAsync: function() {
                return promiseMock;
            },
            findOneAsync: function() {
                return promiseMock;
            },
            findOneAndUpdateAsync: function() {
                return promiseMock;
            },
            createAsync: function() {
                return promiseMock;
            },
            removeAsync: function() {
                return promiseMock;
            }
        };

        dnaMocks.cloudDnaDb.model = function() {
            return modelMock;
        };

        dbStorage.getDb = function() {
            return dnaMocks.cloudDnaDb;
        };

        mockery.registerMock('../lib/dbStorage', dbStorage);

        tagTypeService = require('../../services/tagType.service');
    });

    it('should be defined object', function(done) {
        expect(tagTypeService).to.be.a('object');
        done();
    });

    describe('getTagTypes method', function() {
        it('should exist', function(done) {
            expect(tagTypeService.getTagTypes).to.be.a('function');
            done();
        });

        it('should run model findAsync method', function() {
            var spy = sinon.spy(modelMock, 'findAsync');

            tagTypeService.getTagTypes();
            expect(spy).to.have.been.callCount(1);
        });

        it('should return promise', function() {
            expect(tagTypeService.getTagTypes()).to.deep.equal(promiseMock);
        });
    });

    describe('getTagTypeById method', function() {
        it('should exist', function(done) {
            expect(tagTypeService.getTagTypeById).to.be.a('function');
            done();
        });

        it('should run model findOneAsync method', function() {
            var spy = sinon.spy(modelMock, 'findOneAsync');

            tagTypeService.getTagTypeById();
            expect(spy).to.have.been.callCount(1);
        });

        it('should return promise', function() {
            expect(tagTypeService.getTagTypeById()).to.deep.equal(promiseMock);
        });
    });

    describe('createTagType method', function() {
        it('should exist', function(done) {
            expect(tagTypeService.createTagType).to.be.a('function');
            done();
        });

        it('should run model createAsync method', function() {
            var spy = sinon.spy(modelMock, 'createAsync');

            tagTypeService.createTagType({});
            expect(spy).to.have.been.callCount(1);
        });

        it('should return promise', function() {
            expect(tagTypeService.createTagType({})).to.deep.equal(promiseMock);
        });
    });

    describe('updateTagTypeById method', function() {
        it('should exist', function(done) {
            expect(tagTypeService.updateTagTypeById).to.be.a('function');
            done();
        });

        it('should run model findOneAndUpdateAsync method', function() {
            var spy = sinon.spy(modelMock, 'findOneAndUpdateAsync');

            tagTypeService.updateTagTypeById();
            expect(spy).to.have.been.callCount(1);
        });

        it('should return promise', function() {
            expect(tagTypeService.updateTagTypeById()).to.deep.equal(promiseMock);
        });
    });

    describe('removeTagTypeById method', function() {
        it('should exist', function(done) {
            expect(tagTypeService.removeTagTypeById).to.be.a('function');
            done();
        });

        it('should run model removeAsync method', function() {
            var spy = sinon.spy(modelMock, 'removeAsync');

            tagTypeService.removeTagTypeById();
            expect(spy).to.have.been.callCount(1);
        });

        it('should return promise', function() {
            expect(tagTypeService.removeTagTypeById()).to.deep.equal(promiseMock);
        });
    });
});
