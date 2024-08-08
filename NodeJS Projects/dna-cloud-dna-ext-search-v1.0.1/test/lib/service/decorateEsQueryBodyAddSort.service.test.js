'use strict';

var expect = require('chai').expect,
    decorateEsQueryBodyAddSort = require('../../../lib/service/decorateEsQueryBodyAddSort.service');

describe('decorateEsQueryBodyAddSort', function() {
    it('should be a function', function() {
        expect(decorateEsQueryBodyAddSort).to.be.a('function');
    });

    it('should add sort to esQueryBody', function() {
        var esQueryBody = {};

        decorateEsQueryBodyAddSort(esQueryBody);

        expect(esQueryBody).to.have.property('sort');
        expect(esQueryBody.sort).to.be.an('array');
        expect(esQueryBody.sort.length).to.equal(1);

    });

    it('should add default gse sort if non is passed', function() {
        var esQueryBody = {},
            gseSortMock;

        gseSortMock = {
            'tags.tags.tagName': {
                //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                nested_filter: {
                    //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
                    terms: {
                        'tags.tagTypeName': ['GSE Value', 'GSE Band']
                    }
                },
                order: 'asc',
                mode: 'min',
                missing: '_last'
            }
        };

        decorateEsQueryBodyAddSort(esQueryBody);

        expect(esQueryBody.sort).to.eql([gseSortMock]);
    });

    it('should handle \'skill\' sort', function() {
        var esQueryBody = {},
            skillSortMock,
            skillSortBy;

        skillSortBy = {
            property: 'skill',
            order: 'asc'
        };

        skillSortMock = {
            'tags.tags.tagName': {
                //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                nested_filter: {
                    //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
                    terms: {
                        'tags.tagTypeName': ['Skill']
                    }
                },
                order: 'asc',
                mode: 'min',
                missing: '_last'
            }
        };

        decorateEsQueryBodyAddSort(esQueryBody, skillSortBy);

        expect(esQueryBody.sort).to.eql([skillSortMock]);
    });

    it('should use passed sortBy', function() {
        var esQueryBody = {},
            sortBy = {};

        sortBy.property = 'descriptiveId';
        sortBy.order = 'desc';

        decorateEsQueryBodyAddSort(esQueryBody, sortBy);

        expect(esQueryBody.sort[0]).to.eql({
            descriptiveId: 'desc'
        });
    });
});
