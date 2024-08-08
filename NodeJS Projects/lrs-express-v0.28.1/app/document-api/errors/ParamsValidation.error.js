'use strict';

function ParamsValidationError() {
    this.name = 'ParamsValidationError';
    this.message = 'Invalid parameters';
}

ParamsValidationError.prototype = Object.create(Error.prototype);

module.exports = ParamsValidationError;
