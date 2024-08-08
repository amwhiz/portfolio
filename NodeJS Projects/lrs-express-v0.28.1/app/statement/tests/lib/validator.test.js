'use strict';

var expect = require('chai').expect,
    validator = require('../../lib/validator/validator'),
    rules = require('../../lib/validator/rule.collection'),
    messages = require('../../lib/validator/validator.messages'),
    _ = require('lodash'),
    error,
    fieldName = 'name';

describe('Unit tests', function() {
    describe('rules', function() {
        describe('method', function() {
            describe('exist', function() {
                it('should exist', function() {
                    expect(rules.exist).to.exist();
                });

                it('should return error for undefined', function() {
                    var value;

                    error = rules.exist(value, fieldName);
                    expect(error).to.deep.equal(messages.REQUIRED(fieldName));
                });

                it('should return error for null', function() {
                    var value = null;

                    error = rules.exist(value, fieldName);
                    expect(error).to.deep.equal(messages.REQUIRED(fieldName));
                });

                it('should return error for empty string', function() {
                    var value = '';

                    error = rules.exist(value, fieldName);
                    expect(error).to.deep.equal(messages.REQUIRED(fieldName));
                });

                it('should return error for empty object', function() {
                    var value = {};

                    error = rules.exist(value, fieldName);
                    expect(error).to.deep.equal(messages.REQUIRED(fieldName));
                });

                it('should return error for empty array', function() {
                    var value = [];

                    error = rules.exist(value, fieldName);
                    expect(error).to.deep.equal(messages.REQUIRED(fieldName));
                });

                it('should return no error for not empty array', function() {
                    var value = [1];

                    error = rules.exist(value, fieldName);
                    expect(error).to.not.deep.equal(messages.REQUIRED(fieldName));
                });

                it('should return no error for not empty string', function() {
                    var value = '1';

                    error = rules.exist(value, fieldName);
                    expect(error).to.not.deep.equal(messages.REQUIRED(fieldName));
                });

                it('should return no error for not empty object', function() {
                    var value = {1: 1};

                    error = rules.exist(value, fieldName);
                    expect(error).to.not.deep.equal(messages.REQUIRED(fieldName));
                });
            });

            describe('starts', function() {
                it('should exist', function() {
                    expect(rules.startsWith).to.exist();
                });

                it('should return error for no value', function() {
                    var value,
                        options = {};

                    options.substring = '1';
                    error = rules.startsWith(value, fieldName, options);
                    expect(error).to.deep.equal(messages.NOT_STARTS(fieldName, options.substring));
                });

                it('should return no error for no options', function() {
                    var value = 'asd';

                    error = rules.startsWith(value, fieldName);
                    expect(error).to.not.deep.equal(messages.NOT_STARTS(fieldName));
                });

                it('should return no error for invalid substring', function() {
                    var value = '1asd',
                        options = {};

                    options.substring = '1b';
                    error = rules.startsWith(value, fieldName, options);
                    expect(error).to.deep.equal(messages.NOT_STARTS(fieldName, options.substring));
                });

                it('should return no error for valid substring', function() {
                    var value = '1asd',
                        options = {};

                    options.substring = '1a';
                    error = rules.startsWith(value, fieldName, options);
                    expect(error).to.not.deep.equal(messages.NOT_STARTS(fieldName, options.substring));
                });
            });

            describe('notExist', function() {
                it('should exist', function() {
                    expect(rules.notExist).to.exist();
                });

                it('should return error for string', function() {
                    var value = 'asd';

                    error = rules.notExist(value, fieldName);
                    expect(error).to.deep.equal(messages.NOT_EXIST(fieldName));
                });

                it('should return no error for undefined', function() {
                    var value;

                    error = rules.notExist(value, fieldName);
                    expect(error).to.not.deep.equal(messages.NOT_EXIST(fieldName));
                });

                it('should return no error for null', function() {
                    var value = null;

                    error = rules.notExist(value, fieldName);
                    expect(error).to.not.deep.equal(messages.NOT_EXIST(fieldName));
                });

                it('should return no error for empty object', function() {
                    var value = {};

                    error = rules.notExist(value, fieldName);
                    expect(error).to.not.deep.equal(messages.NOT_EXIST(fieldName));
                });

                it('should return no error for empty array', function() {
                    var value = [];

                    error = rules.notExist(value, fieldName);
                    expect(error).to.not.deep.equal(messages.NOT_EXIST(fieldName));
                });
            });

            describe('isString', function() {
                it('should exist', function() {
                    expect(rules.isString).to.exist();
                });

                it('should return no error for string', function() {
                    var value = '';

                    error = rules.isString(value, fieldName);
                    expect(error).to.not.deep.equal(messages.STRING(fieldName));
                });

                it('should return error for array', function() {
                    var value = [];

                    error = rules.isString(value, fieldName);
                    expect(error).to.deep.equal(messages.STRING(fieldName));
                });

                it('should return error for object', function() {
                    var value = {};

                    error = rules.isString(value, fieldName);
                    expect(error).to.deep.equal(messages.STRING(fieldName));
                });

                it('should return error for undefined', function() {
                    var value;

                    error = rules.isString(value, fieldName);
                    expect(error).to.deep.equal(messages.STRING(fieldName));
                });

                it('should return error for null', function() {
                    var value = null;

                    error = rules.isString(value, fieldName);
                    expect(error).to.deep.equal(messages.STRING(fieldName));
                });
            });

            describe('value', function() {
                it('should exist', function() {
                    expect(rules.value).to.exist();
                });

                it('should return error for no options', function() {
                    var value = null;

                    error = rules.value(value, fieldName);
                    expect(error).to.deep.equal(messages.VALUE(fieldName));
                });

                it('should return no error for valid value and options', function() {
                    var value = 123,
                        options = {};

                    options.value = 123;
                    error = rules.value(value, fieldName, options);
                    expect(error).to.not.deep.equal(messages.VALUE(fieldName, options.value));
                });
            });

            describe('isURL', function() {
                it('should exist', function() {
                    expect(rules.isURL).to.exist();
                });

                it('should return error for not url string', function() {
                    var value = 'dsa';

                    error = rules.isURL(value, fieldName);
                    expect(error).to.deep.equal(messages.IRI(fieldName));
                });

                it('should return error for undefined', function() {
                    var value;

                    error = rules.isURL(value, fieldName);
                    expect(error).to.deep.equal(messages.IRI(fieldName));
                });

                it('should return error for null', function() {
                    var value = null;

                    error = rules.isURL(value, fieldName);
                    expect(error).to.deep.equal(messages.IRI(fieldName));
                });

                it('should return error for array', function() {
                    var value = [];

                    error = rules.isURL(value, fieldName);
                    expect(error).to.deep.equal(messages.IRI(fieldName));
                });

                it('should return error for object', function() {
                    var value = {};

                    error = rules.isURL(value, fieldName);
                    expect(error).to.deep.equal(messages.IRI(fieldName));
                });

                it('should return error for wrong URL', function() {
                    var value = 'ahttp://google.com';

                    error = rules.isURL(value, fieldName);
                    expect(error).to.deep.equal(messages.IRI(fieldName));
                });

                it('should return no error for URL', function() {
                    var value = 'http://google.com';

                    error = rules.isURL(value, fieldName);
                    expect(error).to.not.deep.equal(messages.IRI(fieldName));
                });
            });

            describe('isUUID', function() {
                it('should exist', function() {
                    expect(rules.isUUID).to.exist();
                });

                it('should return error for wrong string', function() {
                    var value = 'ahttp://google.com';

                    error = rules.isUUID(value, fieldName);
                    expect(error).to.deep.equal(messages.UUID(fieldName));
                });

                it('should return error for object', function() {
                    var value = {};

                    error = rules.isUUID(value, fieldName);
                    expect(error).to.deep.equal(messages.UUID(fieldName));
                });

                it('should return error for array', function() {
                    var value = [];

                    error = rules.isUUID(value, fieldName);
                    expect(error).to.deep.equal(messages.UUID(fieldName));
                });

                it('should return no error for UUID', function() {
                    var value = '123e4567-e89b-12d3-a456-426655440000';

                    error = rules.isUUID(value, fieldName);
                    expect(error).to.not.deep.equal(messages.UUID(fieldName));
                });
            });

            describe('inArray', function() {
                it('should exist', function() {
                    expect(rules.inArray).to.exist();
                });

                it('should return error for no options', function() {
                    var value = [];

                    error = rules.inArray(value, fieldName);
                    expect(error).to.deep.equal(messages.RANGE(fieldName));
                });

                it('should return error for if array is empty', function() {
                    var value = 1,
                        options = {};

                    options.values = [];
                    error = rules.inArray(value, fieldName, options);
                    expect(error).to.deep.equal(messages.RANGE(fieldName, options.values));
                });

                it('should return error for if array do not contain element', function() {
                    var value = 1,
                        options = {};

                    options.values = [2, 3];
                    error = rules.inArray(value, fieldName, options);
                    expect(error).to.deep.equal(messages.RANGE(fieldName, options.values));
                });

                it('should return no error for if array contains element', function() {
                    var value = 1,
                        options = {};

                    options.values = [1, 2, 3];
                    error = rules.inArray(value, fieldName, options);
                    expect(error).to.not.deep.equal(messages.RANGE(fieldName, options.values));
                });
            });

            describe('isObject', function() {
                it('should exist', function() {
                    expect(rules.isObject).to.exist();
                });

                it('should return error for undefined', function() {
                    var value;

                    error = rules.isObject(value, fieldName);
                    expect(error).to.deep.equal(messages.OBJECT(fieldName));
                });

                it('should return error for null', function() {
                    var value = null;

                    error = rules.isObject(value, fieldName);
                    expect(error).to.deep.equal(messages.OBJECT(fieldName));
                });

                it('should return error for array', function() {
                    var value = [];

                    error = rules.isObject(value, fieldName);
                    expect(error).to.deep.equal(messages.OBJECT(fieldName));
                });

                it('should return error for number', function() {
                    var value = 1;

                    error = rules.isObject(value, fieldName);
                    expect(error).to.deep.equal(messages.OBJECT(fieldName));
                });

                it('should return error for string', function() {
                    var value = '';

                    error = rules.isObject(value, fieldName);
                    expect(error).to.deep.equal(messages.OBJECT(fieldName));
                });

                it('should return no error for object', function() {
                    var value = {};

                    error = rules.isObject(value, fieldName);
                    expect(error).to.not.deep.equal(messages.OBJECT(fieldName));
                });
            });

            describe('isBoolean', function() {
                it('should exist', function() {
                    expect(rules.isBoolean).to.exist();
                });

                it('should return error for string', function() {
                    var value = '';

                    error = rules.isBoolean(value, fieldName);
                    expect(error).to.deep.equal(messages.BOOL(fieldName));
                });

                it('should return error for undefined', function() {
                    var value;

                    error = rules.isBoolean(value, fieldName);
                    expect(error).to.deep.equal(messages.BOOL(fieldName));
                });

                it('should return error for null', function() {
                    var value = null;

                    error = rules.isBoolean(value, fieldName);
                    expect(error).to.deep.equal(messages.BOOL(fieldName));
                });

                it('should return error for object', function() {
                    var value = {};

                    error = rules.isBoolean(value, fieldName);
                    expect(error).to.deep.equal(messages.BOOL(fieldName));
                });

                it('should return error for array', function() {
                    var value = [];

                    error = rules.isBoolean(value, fieldName);
                    expect(error).to.deep.equal(messages.BOOL(fieldName));
                });

                it('should return no error for boolean value', function() {
                    var value = true;

                    error = rules.isBoolean(value, fieldName);
                    expect(error).to.not.deep.equal(messages.BOOL(fieldName));
                });
            });

            describe('isISO8601', function() {
                it('should exist', function() {
                    expect(rules.isISO8601).to.exist();
                });

                it('should return error for string', function() {
                    var value = '';

                    error = rules.isISO8601(value, fieldName);
                    expect(error).to.deep.equal(messages.ISO8601(fieldName));
                });

                it('should return error for undefined', function() {
                    var value;

                    error = rules.isISO8601(value, fieldName);
                    expect(error).to.deep.equal(messages.ISO8601(fieldName));
                });

                it('should return error for null', function() {
                    var value = null;

                    error = rules.isISO8601(value, fieldName);
                    expect(error).to.deep.equal(messages.ISO8601(fieldName));
                });

                it('should return no error for valid timestamp string', function() {
                    var value = '2012-08-03T12:23:12.120Z';

                    error = rules.isISO8601(value, fieldName);
                    expect(error).to.not.deep.equal(messages.ISO8601(fieldName));
                });

                it('should return no error for valid timestamp string', function() {
                    var value = '2014-12-03T14:26:38.882Z';

                    error = rules.isISO8601(value, fieldName);
                    expect(error).to.not.deep.equal(messages.ISO8601(fieldName));
                });

                it('should return error for invalid timestamp string', function() {
                    var value = '2012-12-31T23:59:60.000Z';

                    error = rules.isISO8601(value, fieldName);
                    expect(error).to.deep.equal(messages.ISO8601(fieldName));
                });

                it('should return error for invalid timestamp string', function() {
                    var value = '2012-12-31T23:60:59.000Z';

                    error = rules.isISO8601(value, fieldName);
                    expect(error).to.deep.equal(messages.ISO8601(fieldName));
                });

                it('should return error for invalid timestamp string', function() {
                    var value = '2012-12-31T24:59:59.000Z';

                    error = rules.isISO8601(value, fieldName);
                    expect(error).to.deep.equal(messages.ISO8601(fieldName));
                });
            });

            describe('isNumber', function() {
                it('should exist', function() {
                    expect(rules.isNumber).to.exist();
                });

                it('should return error for empty string', function() {
                    var value = '';

                    error = rules.isNumber(value, fieldName);
                    expect(error).to.deep.equal(messages.NUMBER(fieldName));
                });

                it('should return error for undefined', function() {
                    var value;

                    error = rules.isNumber(value, fieldName);
                    expect(error).to.deep.equal(messages.NUMBER(fieldName));
                });

                it('should return error for null', function() {
                    var value = null;

                    error = rules.isNumber(value, fieldName);
                    expect(error).to.deep.equal(messages.NUMBER(fieldName));
                });

                it('should return error for string', function() {
                    var value = 'asd';

                    error = rules.isNumber(value, fieldName);
                    expect(error).to.deep.equal(messages.NUMBER(fieldName));
                });

                it('should return no error for float', function() {
                    var value = 1.2;

                    error = rules.isNumber(value, fieldName);
                    expect(error).to.not.deep.equal(messages.NUMBER(fieldName));
                });

                it('should return no error for int', function() {
                    var value = 10;

                    error = rules.isNumber(value, fieldName);
                    expect(error).to.not.deep.equal(messages.NUMBER(fieldName));
                });
            });

            describe('isBigger', function() {
                it('should exist', function() {
                    expect(rules.isBigger).to.exist();
                });

                it('should return error if number is lower than min', function() {
                    var value = -2,
                        min = 1;

                    error = rules.isBigger(value, fieldName, min);
                    expect(error).to.deep.equal(messages.BIGGER(fieldName, min));
                });

                it('should return no error if number is bigger than min', function() {
                    var value = 10,
                        min = 1;

                    error = rules.isBigger(value, fieldName, min);
                    expect(error).to.not.deep.equal(messages.BIGGER(fieldName, min));
                });
            });

            describe('isSmaller', function() {
                it('should exist', function() {
                    expect(rules.isSmaller).to.exist();
                });

                it('should return error if number is bigger than max', function() {
                    var value = 2,
                        max = 1;

                    error = rules.isSmaller(value, fieldName, max);
                    expect(error).to.deep.equal(messages.SMALLER(fieldName, max));
                });

                it('should return no error if number is smaller than max', function() {
                    var value = 0,
                        max = 1;

                    error = rules.isSmaller(value, fieldName, max);
                    expect(error).to.not.deep.equal(messages.SMALLER(fieldName, max));
                });
            });

            describe('isBetween', function() {
                it('should exist', function() {
                    expect(rules.isBetween).to.exist();
                });

                it('should return error if number is lower than min', function() {
                    var value = -2,
                        options;

                    options = {
                        min: -1,
                        max: 1
                    };

                    error = rules.isBetween(value, fieldName, options);
                    expect(error).to.deep.equal(messages.BETWEEN(fieldName, options));
                });

                it('should return error if number is bigger than max', function() {
                    var value = 10,
                        options;

                    options = {
                        min: -1,
                        max: 1
                    };

                    error = rules.isBetween(value, fieldName, options);
                    expect(error).to.deep.equal(messages.BETWEEN(fieldName, options));
                });

                it('should return no error if number is from range', function() {
                    var value = 0,
                        options;

                    options = {
                        min: -1,
                        max: 1
                    };

                    error = rules.isBetween(value, fieldName, options);
                    expect(error).to.not.deep.equal(messages.BETWEEN(fieldName, options));
                });
            });

            describe('isInt', function() {
                it('should exist', function() {
                    expect(rules.isInt).to.exist();
                });

                it('should return error for string', function() {
                    var value = 'dsa';

                    error = rules.isInt(value, fieldName);
                    expect(error).to.deep.equal(messages.INTEGER(fieldName));
                });

                it('should return error for float', function() {
                    var value = 1.2;

                    error = rules.isInt(value, fieldName);
                    expect(error).to.deep.equal(messages.INTEGER(fieldName));
                });

                it('should return error for null', function() {
                    var value = null;

                    error = rules.isInt(value, fieldName);
                    expect(error).to.deep.equal(messages.INTEGER(fieldName));
                });

                it('should return error for undefined', function() {
                    var value;

                    error = rules.isInt(value, fieldName);
                    expect(error).to.deep.equal(messages.INTEGER(fieldName));
                });

                it('should return no error for integer', function() {
                    var value = 10;

                    error = rules.isInt(value, fieldName);
                    expect(error).to.not.deep.equal(messages.INTEGER(fieldName));
                });
            });

            describe('isBase64', function() {
                it('should exist', function() {
                    expect(rules.isBase64).to.exist();
                });

                it('should return error for no base64 string', function() {
                    var value = 'dsa';

                    error = rules.isBase64(value, fieldName);
                    expect(error).to.deep.equal(messages.BASE64(fieldName));
                });

                it('should return error for number', function() {
                    var value = 123;

                    error = rules.isBase64(value, fieldName);
                    expect(error).to.deep.equal(messages.BASE64(fieldName));
                });

                it('should return error for null', function() {
                    var value = null;

                    error = rules.isBase64(value, fieldName);
                    expect(error).to.deep.equal(messages.BASE64(fieldName));
                });

                it('should return error for undefined', function() {
                    var value;

                    error = rules.isBase64(value, fieldName);
                    expect(error).to.deep.equal(messages.BASE64(fieldName));
                });

                it('should return no error for proper string', function() {
                    var value = 'ZHNh';

                    error = rules.isBase64(value, fieldName);
                    expect(error).to.not.deep.equal(messages.BASE64(fieldName));
                });

                it('should return no error for another proper string', function() {
                    var value = 'd2llbGthIGR1cGE=';

                    error = rules.isBase64(value, fieldName);
                    expect(error).to.not.deep.equal(messages.BASE64(fieldName));
                });
            });

            describe('isContentType', function() {
                it('should exist', function() {
                    expect(rules.isContentType).to.exist();
                });

                it('should return error for improper string', function() {
                    var value = 'dsa';

                    error = rules.isContentType(value, fieldName);
                    expect(error).to.deep.equal(messages.CONTENT_TYPE(fieldName));
                });

                it('should return no error for proper string', function() {
                    var value = 'text/plain';

                    error = rules.isContentType(value, fieldName);
                    expect(error).to.not.deep.equal(messages.CONTENT_TYPE(fieldName));
                });
            });

            describe('isNot', function() {
                it('should exist', function() {
                    expect(rules.isNot).to.exist();
                });

                it('should return error for improper string', function() {
                    var value = 'dsa',
                        options = {value: 'dsa'};

                    error = rules.isNot(value, fieldName, options);
                    expect(error).to.deep.equal(messages.IS_NOT(fieldName, options.value));
                });

                it('should return no error for proper string', function() {
                    var value = 'dsa',
                        options = {value: 'asd'};

                    error = rules.isNot(value, fieldName, options);
                    expect(error).to.not.deep.equal(messages.IS_NOT(fieldName, options.value));
                });
            });

            describe('isArray', function() {
                it('should exist', function() {
                    expect(rules.isArray).to.exist();
                });

                it('should return error for undefined', function() {
                    var value;

                    error = rules.isArray(value, fieldName);
                    expect(error).to.deep.equal(messages.ARRAY(fieldName));
                });

                it('should return error for null', function() {
                    var value = null;

                    error = rules.isArray(value, fieldName);
                    expect(error).to.deep.equal(messages.ARRAY(fieldName));
                });

                it('should return error for string', function() {
                    var value = 'dsa';

                    error = rules.isArray(value, fieldName);
                    expect(error).to.deep.equal(messages.ARRAY(fieldName));
                });

                it('should return error for object', function() {
                    var value = {};

                    error = rules.isArray(value, fieldName);
                    expect(error).to.deep.equal(messages.ARRAY(fieldName));
                });

                it('should return no error for array', function() {
                    var value = [];

                    error = rules.isArray(value, fieldName);
                    expect(error).to.not.deep.equal(messages.ARRAY(fieldName));
                });
            });

            describe('isJSON', function() {
                it('should exist', function() {
                    expect(rules.isJSON).to.exist();
                });

                it('should return error for undefined', function() {
                    var value;

                    error = rules.isJSON(value, fieldName);
                    expect(error).to.deep.equal(messages.JSON(fieldName));
                });

                it('should return error for string', function() {
                    var value = 'dsa';

                    error = rules.isJSON(value, fieldName);
                    expect(error).to.deep.equal(messages.JSON(fieldName));
                });

                it('should return error for object', function() {
                    var value = {};

                    error = rules.isJSON(value, fieldName);
                    expect(error).to.deep.equal(messages.JSON(fieldName));
                });

                it('should return no error for stringified JSON', function() {
                    var value = '{"account":{"homePage":"http://www.example.com","name":"1625378"}}';

                    error = rules.isJSON(value, fieldName);
                    expect(error).to.not.deep.equal(messages.JSON(fieldName));
                });
            });

            describe('check', function() {
                it('should exist', function() {
                    expect(validator.check).to.exist();
                });
            });
        });
    });
});
