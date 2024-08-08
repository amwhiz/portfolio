'use strict';

function MissingTagTypeError(tagTypeId) {
    this.getMessage = function() {
        return 'There is no TagType with id: ' + tagTypeId;
    };
}

require('util').inherits(MissingTagTypeError, Error);

module.exports = MissingTagTypeError;
