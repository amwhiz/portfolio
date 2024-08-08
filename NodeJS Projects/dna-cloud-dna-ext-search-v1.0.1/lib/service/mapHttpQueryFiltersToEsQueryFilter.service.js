'use strict';

var safeAccess = require('safe-access');

module.exports = function(httpQueryFilters) {
    var httpQueryFiltersSafeAccessor = safeAccess(httpQueryFilters),
        filter = {
            and: []
        };

    httpQueryFiltersSafeAccessor('status') && filter.and.push({
        terms: {
            descriptorStatus: httpQueryFiltersSafeAccessor('status')
        }
    });

    httpQueryFiltersSafeAccessor('syllabuses') && filter.and.push({
        nested: {
            path: 'syllabuses',
            filter: {
                terms: {
                    syllabusId: httpQueryFiltersSafeAccessor('syllabuses')
                }
            }
        }
    });

    (httpQueryFiltersSafeAccessor('tags.tags') || []).forEach(function(tagIds) {
        filter.and.push({
            nested: {
                path: 'tags.tags',
                filter: {
                    terms: {
                        tagId: tagIds
                    }
                }
            }
        });
    });

    if (filter.and.length) {
        return filter;
    }
};
