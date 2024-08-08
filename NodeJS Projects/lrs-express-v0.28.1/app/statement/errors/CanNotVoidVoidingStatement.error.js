'use strict';

function CanNotVoidVoidingStatementError() {
    this.name = 'CanNotVoidVoidingStatementError';
    this.message = 'Can not void statement, which voiding another statement';
}

CanNotVoidVoidingStatementError.prototype = Object.create(Error.prototype);

module.exports = CanNotVoidVoidingStatementError;
