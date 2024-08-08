'use strict';

function SurveyAlreadyExistsError() {
  this.getMessage = function() {
    return 'This survey already exists.' ;
  };
}

require('util').inherits(SurveyAlreadyExistsError, Error);

module.exports = SurveyAlreadyExistsError;
