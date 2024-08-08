'use strict';

module.exports = function(esQueryBody, limit, offset) {
    esQueryBody.size = limit || 10;
    esQueryBody.from = offset || 0;

    return esQueryBody;
};
