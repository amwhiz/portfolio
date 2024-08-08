'use strict';

function MissingTagLabelError() {
    this.getMessage = function() {
        return 'Missing tagLabel';
    };
}

require('util').inherits(MissingTagLabelError, Error);

module.exports = MissingTagLabelError;
