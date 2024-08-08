'use strict';

function NoStatementToVoidError() {
    this.name = 'NoStatementToVoidError';
    this.message = 'Statement to void not found';
}

NoStatementToVoidError.prototype = Object.create(Error.prototype);

module.exports = NoStatementToVoidError;
