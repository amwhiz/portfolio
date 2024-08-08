'use strict';

function EventAlreadyExistsError() {
  this.getMessage = function() {
    return 'This event already exists.' ;
  };
}

require('util').inherits(EventAlreadyExistsError, Error);

module.exports = EventAlreadyExistsError;

