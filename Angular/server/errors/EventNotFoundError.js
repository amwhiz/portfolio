'use strict';

function EventNotFoundError() {
  this.getMessage = function() {
    return 'The requested event not found' ;
  };
}

require('util').inherits(EventNotFoundError, Error);

module.exports = EventNotFoundError;
