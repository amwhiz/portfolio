'use strict';

function DuplicatedTagError(tagId) {
    this.getMessage = function() {
        return 'Duplicated Tag with id: ' + tagId;
    };
}

require('util').inherits(DuplicatedTagError, Error);

module.exports = DuplicatedTagError;
