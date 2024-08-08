'use strict';

function CannotRemoveTagWithChildrenError() {
    this.getMessage = function() {
        return 'Cannot remove tag which has children';
    };
}

require('util').inherits(CannotRemoveTagWithChildrenError, Error);

module.exports = CannotRemoveTagWithChildrenError;
