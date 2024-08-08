'use strict';

var expect = require('chai').expect,
    decorateEsQueryBodyAddQuery = require('../../../lib/service/decorateEsQueryBodyAddQuery.service');

describe('decorateEsQueryBodyAddQuery', function() {
    it('should be a function', function() {
        expect(decorateEsQueryBodyAddQuery).to.be.a('function');
    });

    it('should add query key to esQueryBody', function() {
        var esQueryBody = {};

        decorateEsQueryBodyAddQuery(esQueryBody);

        expect(esQueryBody).to.have.property('query');
        expect(esQueryBody.query).to.have.property('query_string');
        //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        expect(esQueryBody.query.query_string).to.have.property('query');
        expect(esQueryBody.query.query_string).to.have.property('fields');
        expect(esQueryBody.query.query_string.query).to.equal('*');
        expect(esQueryBody.query.query_string.fields).to.eql(['descriptor', 'descriptiveId']);
        //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    });

    it('should use multi_match if \'q\' argument in query doesn\'t contain any of: AND, OR, THEN, *, (, )', function() {
        var esQueryBody = {},
            q = 'this-is-q',
            multiMatchMock;

        multiMatchMock = {
            //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            multi_match: {
                //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
                query: q,
                type: 'phrase_prefix',
                fields: ['descriptor', 'descriptiveId']
            }
        };

        decorateEsQueryBodyAddQuery(esQueryBody, q);
        expect(esQueryBody.query).to.eql(multiMatchMock);
    });

    describe('for query.q containing one of: AND, OR, THEN, *, (, )', function() {
        var qs = [];

        qs.push('this AND that');
        qs.push('this OR that');
        qs.push('this NOT that');
        qs.push('th*');
        qs.push('this (that)');
        qs.push('((this AND that) OR these AND NOT those)');

        qs.forEach(function(q) {
            it('should use query_string for phrase: "' + q + '"', function() {
                var esQueryBody = {},
                    queryStringMock;

                queryStringMock = {
                    //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                    query_string: {
                        default_operator: 'AND',
                        allow_leading_wildcard: true,
                        auto_generate_phrase_queries: false,

                        //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
                        query: q,
                        fuzziness: 0,
                        fields: ['descriptor', 'descriptiveId']
                    }
                };

                decorateEsQueryBodyAddQuery(esQueryBody, q);
                expect(esQueryBody.query).to.eql(queryStringMock);
            });
        });
    });

    describe('for query.q ending with one of: AND, OR, NOT', function() {
        var qs = [];

        qs.push('this AND');
        qs.push('this OR');
        qs.push('this NOT');

        qs.forEach(function(q) {
            it('should decorate q with \' *\' for phrase: "' + q + '"', function() {
                var esQueryBody = {},
                    queryStringMock;

                queryStringMock = {
                    //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                    query_string: {
                        default_operator: 'AND',
                        allow_leading_wildcard: true,
                        auto_generate_phrase_queries: false,

                        //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
                        query: q + ' *',
                        fuzziness: 0,
                        fields: ['descriptor', 'descriptiveId']
                    }
                };

                decorateEsQueryBodyAddQuery(esQueryBody, q);
                expect(esQueryBody.query).to.eql(queryStringMock);
            });
        });
    });
});
