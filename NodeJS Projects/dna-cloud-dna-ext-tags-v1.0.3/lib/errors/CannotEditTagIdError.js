'use strict';

function CannotEditTagIdError() {
    this.getMessage = function() {
        return 'Cannot change tagId';
    };
}

require('util').inherits(CannotEditTagIdError, Error);

module.exports = CannotEditTagIdError;
