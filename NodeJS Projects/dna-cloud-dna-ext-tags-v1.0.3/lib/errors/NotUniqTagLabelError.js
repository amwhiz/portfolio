'use strict';

function NotUniqTagLabelError(parentTagId, tagLabel) {
    this.getMessage = function() {
        return 'Tag label "' + tagLabel + '" is not unique in parent: ' + parentTagId;
    };
}

require('util').inherits(NotUniqTagLabelError, Error);

module.exports = NotUniqTagLabelError;
