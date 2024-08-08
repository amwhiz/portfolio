'use strict';

module.exports = {
    exist: require('./rules/exist.rule'),
    startsWith: require('./rules/starts.with.rule'),
    notExist: require('./rules/not.exist.rule'),
    isString: require('./rules/is.string.rule'),
    value: require('./rules/value.rule'),
    isURL: require('./rules/is.url.rule'),
    isUUID: require('./rules/is.uuid.rule'),
    inArray: require('./rules/in.array.rule'),
    isISO8601: require('./rules/is.iso8601.rule'),
    isNumber: require('./rules/is.number.rule'),
    isBetween: require('./rules/is.between.rule'),
    isObject: require('./rules/is.object.rule'),
    isBoolean: require('./rules/is.boolean.rule'),
    isBigger: require('./rules/is.bigger.rule'),
    isNot: require('./rules/is.not.rule'),
    isArray: require('./rules/is.array.rule'),
    isBase64: require('./rules/is.base64.rule'),
    isContentType: require('./rules/is.contentType.rule'),
    isInt: require('./rules/is.integer.rule'),
    isSmaller: require('./rules/is.smaller.rule'),
    isJSON: require('./rules/is.JSON.rule')
};
