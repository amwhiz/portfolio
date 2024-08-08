'use strict';

function InvalidContentError(content) {
    this.getContent = function() {
        return content || '';
    };
    this.name = 'InvalidContentError';
    this.message = 'Can not create document which id exists and can not merge its content which is not JSON';
}

InvalidContentError.prototype = Object.create(Error.prototype);

module.exports = InvalidContentError;
