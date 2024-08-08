'use strict';

function BothIdError() {
    this.name = 'BothIdError';
    this.message = 'You can\'t request based on both statementId and voidedStatementId';
}

BothIdError.prototype = Object.create(Error.prototype);

module.exports = BothIdError;
