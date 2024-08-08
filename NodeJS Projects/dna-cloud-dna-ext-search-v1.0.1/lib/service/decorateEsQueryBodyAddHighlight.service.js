'use strict';

module.exports = function(esQueryBody) {
    esQueryBody.highlight = {
        fields: {
            descriptor: {},
            descriptiveId: {}
        }
    };

    return esQueryBody;
};
