'use strict';

function NotEmptyTagTypeError() {
    this.getMessage = function() {
        return 'Cannot remove TagType which has assigned Tags.';
    };
}

require('util').inherits(NotEmptyTagTypeError, Error);

module.exports = NotEmptyTagTypeError;
