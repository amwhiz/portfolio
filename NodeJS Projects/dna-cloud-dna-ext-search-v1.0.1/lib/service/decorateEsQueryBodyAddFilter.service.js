'use strict';

var mapHttpQueryFiltersToEsQueryFilter = require('./mapHttpQueryFiltersToEsQueryFilter.service');

module.exports = function(esQueryBody, filters) {
    esQueryBody.filter = mapHttpQueryFiltersToEsQueryFilter(filters);

    return esQueryBody;
};
