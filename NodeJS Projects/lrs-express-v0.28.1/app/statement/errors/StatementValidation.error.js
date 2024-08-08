'use strict';

function StatementValidationError(message) {
    this.name = 'StatementValidationError';
    this.message = message;
}

StatementValidationError.prototype = Object.create(Error.prototype);

module.exports = StatementValidationError;
