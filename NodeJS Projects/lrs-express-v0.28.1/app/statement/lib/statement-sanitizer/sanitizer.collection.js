'use strict';

module.exports = [
    require('./sanitizers/id.sanitizer'),
    require('./sanitizers/version.sanitizer'),
    require('./sanitizers/stored.sanitizer'),
    require('./sanitizers/timestamp.sanitizer'),
    require('./sanitizers/object.sanitizer'),
    require('./sanitizers/context.sanitizer')
];
