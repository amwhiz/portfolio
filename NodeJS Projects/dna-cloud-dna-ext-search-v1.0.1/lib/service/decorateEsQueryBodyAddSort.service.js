'use strict';

module.exports = function(esQueryBody, sortBy) {
    var sort = {};

    sortBy = sortBy || {
        property: 'gse',
        order: 'asc'
    };

    if (sortBy.property === 'gse') {
        sort = {
            'tags.tags.tagName': {
                //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                nested_filter: {
                    //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
                    terms: {
                        'tags.tagTypeName': ['GSE Value', 'GSE Band']
                    }
                },
                order: sortBy.order,
                mode: 'min',
                missing: '_last'
            }
        };
    } else if (sortBy.property === 'skill') {
        sort = {
            'tags.tags.tagName': {
                //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                nested_filter: {
                    //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
                    terms: {
                        'tags.tagTypeName': ['Skill']
                    }
                },
                order: sortBy.order,
                mode: 'min',
                missing: '_last'
            }
        };
    } else {
        sort[sortBy.property] = sortBy.order;
    }

    esQueryBody.sort = [sort];

    return esQueryBody;
};
