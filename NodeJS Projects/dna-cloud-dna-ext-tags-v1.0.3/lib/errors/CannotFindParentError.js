'use strict';

function CannotFindParentError() {
    this.getMessage = function() {
        return 'Cannot find parent tag';
    };
}

require('util').inherits(CannotFindParentError, Error);

module.exports = CannotFindParentError;
