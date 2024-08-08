'use strict';

function CannotEditTagTypeIdError() {
    this.getMessage = function() {
        return 'Cannot change tagTypeId';
    };
}

require('util').inherits(CannotEditTagTypeIdError, Error);

module.exports = CannotEditTagTypeIdError;
