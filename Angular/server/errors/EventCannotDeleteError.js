'use strict';

function EventCannotDeleteError() {
  this.getMessage = function() {
    return 'This event can\'t be deleted' ;
  };
}

require('util').inherits(EventCannotDeleteError, Error);

module.exports = EventCannotDeleteError;
