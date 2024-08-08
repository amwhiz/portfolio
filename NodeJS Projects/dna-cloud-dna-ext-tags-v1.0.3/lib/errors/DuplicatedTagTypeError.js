'use strict';

function DuplicatedTagTypeError(tagTypeId) {
    this.getMessage = function(){
        return 'Duplicated TagType with id: ' + tagTypeId;
    };
}

require('util').inherits(DuplicatedTagTypeError, Error);

module.exports = DuplicatedTagTypeError;
