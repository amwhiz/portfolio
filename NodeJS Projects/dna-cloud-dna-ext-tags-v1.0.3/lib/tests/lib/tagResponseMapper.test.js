'use strict';

var tagData = require('../data/tagResponseMapperData'),
    tagResponseMapper,
    mockery = require('mockery'),
    sharedBehaviors = require('../sharedBehaviors'),
    dbStorage = {},
    modelMock = {},
    dnaMocks = require('dna-cloud-dna-ext-mocks'),
    expect = require('chai').expect;

describe('Tag Response Mapper', function() {
    sharedBehaviors.mockery();

    before(function() {
        modelMock.schema = {paths: tagData.paths};

        dnaMocks.cloudDnaDb.model = function() {
            return modelMock;
        };

        dbStorage.getDb = function() {
            return dnaMocks.cloudDnaDb;
        };

        mockery.registerMock('./dbStorage', dbStorage);

        tagResponseMapper = require('../../lib/tagResponseMapper');
    });

    it('should be defined object', function() {
        expect(tagResponseMapper).to.be.an('object');
    });

    describe('method mapTagForGet', function() {
        it('should exist', function() {
            expect(tagResponseMapper.mapTagForGet).to.be.a('function');
        });

        it('should map tag', function() {
            expect(tagResponseMapper.mapTagForGet(tagData.data)).to.deep.equal(tagData.expectedResult);
        });
    });

    describe('method mapTagsForFlatList', function() {
        it('should exist', function() {
            expect(tagResponseMapper.mapTagsForFlatList).to.be.a('function');
        });

        it('should map tag list', function() {
            expect(tagResponseMapper.mapTagsForFlatList(tagData.data2)).to.deep.equal(tagData.expectedResult2);
        });
    });
});
