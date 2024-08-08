'use strict';

var tagTypeOutputDecorator,
    expect = require('chai').expect,
    sharedBehaviors = require('../sharedBehaviors'),
    tagResponseMapperMock,
    mockery = require('mockery'),
    tagTypeResponseMapperMock;

describe('Tag type output decorator', function() {
    sharedBehaviors.mockery();

    before(function() {
        tagTypeResponseMapperMock = {
            mapTagTypeForGet: function(tagType) {
                return tagType;
            }
        };

        tagResponseMapperMock = {
            mapTagForGet: function(tag) {
                return tag;
            }
        };

        mockery.registerMock('./tagResponseMapper', tagResponseMapperMock);
        mockery.registerMock('./tagTypeResponseMapper', tagTypeResponseMapperMock);

        tagTypeOutputDecorator = require('../../lib/tagTypeOutputDecorator');
    });

    it('should be defined object', function() {
        expect(tagTypeOutputDecorator).to.be.a('object');
    });

    describe('method decorateWithTags', function() {
        it('should exist', function() {
            expect(tagTypeOutputDecorator.decorateWithTags).to.be.a('function');
        });

        it('should return empty collection of tags in tagType for empty collection', function() {
            var expectedResult = {
                tags: []
            };

            expect(tagTypeOutputDecorator.decorateWithTags({}, [])).to.be.deep.equal(expectedResult);
        });

        it('should return collection of tagIds for no empty collection', function() {
            var tags,
                expectedResult;

            tags = [
                {
                    tagTypeId: 'SKLA',
                    tagLabel: 'Skill',
                    tagId: 'SKL0001'
                },
                {
                    tagTypeId: 'SKLA',
                    tagLabel: 'Reading',
                    tagId: 'HWD0003'
                }
            ];

            expectedResult = {
                tags: ['SKL0001', 'HWD0003']
            };

            expect(tagTypeOutputDecorator.decorateWithTags({}, tags)).to.be.deep.equal(expectedResult);
        });

        it('should return collection of tags for no empty collection with expand param', function() {
            var tags,
                expectedResult;

            tags = [
                {
                    tagTypeId: 'SKLA',
                    tagLabel: 'Skill',
                    tagId: 'SKL0001'
                },
                {
                    tagTypeId: 'SKLA',
                    tagLabel: 'Reading',
                    tagId: 'HWD0003'
                }
            ];

            expectedResult = {
                tags: tags
            };

            expect(tagTypeOutputDecorator.decorateWithTags({}, tags, true)).to.be.deep.equal(expectedResult);
        });
    });

    describe('method decorateWithCount', function() {
        it('should exist', function() {
            expect(tagTypeOutputDecorator.decorateWithCount).to.be.a('function');
        });

        it('should return empty collection of tags in tagType for empty collection', function() {
            var expectedResult,
                tagType;

            expectedResult = {
                tagCount: 60
            };

            tagType = {
                toJSON: function() {
                    return {};
                }
            };

            expect(tagTypeOutputDecorator.decorateWithCount(tagType, 60)).to.be.deep.equal(expectedResult);
        });
    });
});
