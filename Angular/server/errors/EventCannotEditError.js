'use strict';

function EventCannotEditError() {
  this.getMessage = function() {
    return 'This event can\'t be edited' ;
  };
}

require('util').inherits(EventCannotEditError, Error);

module.exports = EventCannotEditError;
