'use strict';

var decorateEsQueryBodyAddFilter = require('./decorateEsQueryBodyAddFilter.service'),
    decorateEsQueryBodyAddHighlight = require('./decorateEsQueryBodyAddHighlight.service'),
    decorateEsQueryBodyAddLimitOffset = require('./decorateEsQueryBodyAddLimitOffset.service'),
    decorateEsQueryBodyAddQuery = require('./decorateEsQueryBodyAddQuery.service'),
    decorateEsQueryBodyAddSort = require('./decorateEsQueryBodyAddSort.service');

module.exports = function(esQueryBody, query, filters, sortBy) {
    decorateEsQueryBodyAddFilter(esQueryBody, filters);
    decorateEsQueryBodyAddHighlight(esQueryBody);
    decorateEsQueryBodyAddLimitOffset(esQueryBody, query.limit, query.offset);
    decorateEsQueryBodyAddQuery(esQueryBody, query.q);
    decorateEsQueryBodyAddSort(esQueryBody, sortBy);

    return esQueryBody;
};
