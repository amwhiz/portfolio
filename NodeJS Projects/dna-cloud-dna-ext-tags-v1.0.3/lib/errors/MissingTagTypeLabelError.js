'use strict';

function MissingTagTypeLabelError() {
    this.getMessage = function() {
        return 'Missing tagTypeLabel';
    };
}

require('util').inherits(MissingTagTypeLabelError, Error);

module.exports = MissingTagTypeLabelError;
