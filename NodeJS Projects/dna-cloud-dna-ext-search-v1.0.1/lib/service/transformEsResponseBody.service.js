'use strict';

var safeAccess = require('safe-access');

module.exports = function(esResponseBody, isAdvanced) {
    var hitsObj = safeAccess(esResponseBody, 'hits') || {},
        total = hitsObj.total || 0,
        hits = safeAccess(hitsObj, 'hits') || [];

    hits = hits.map(function(hit) {
        return {
            source: hit._source,
            highlight: hit.highlight
        };
    });

    return {
        count: total,
        data: hits,
        isAdvanced: !!isAdvanced
    };
};
