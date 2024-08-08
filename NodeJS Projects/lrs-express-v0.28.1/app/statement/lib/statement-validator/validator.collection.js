'use strict';

module.exports = [
    require('./validators/id.validator'),
    require('./validators/actor.validator'),
    require('./validators/verb.validator'),
    require('./validators/object.validator'),
    require('./validators/result.validator'),
    require('./validators/context.validator'),
    require('./validators/timestamp.validator'),
    require('./validators/version.validator'),
    require('./validators/attachments.validator')
];
