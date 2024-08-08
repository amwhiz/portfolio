'use strict';

require('string.prototype.endswith');

var isAdvancedQuery = require('./isAdvancedQuery.service');

function decorateAdvancedQuery(esQueryBody, q) {
    var needsWildcard = ['AND', 'OR', 'NOT']
        .some(function(op) {
            return q.endsWith(op);
        });

    if (needsWildcard) {
        q += ' *';
    }

    esQueryBody.query = {
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

    return esQueryBody;
}

function decorateRegularQuery(esQueryBody, q) {
    esQueryBody.query = {
        //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        multi_match: {
            //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
            query: q,
            type: 'phrase_prefix',
            fields: ['descriptor', 'descriptiveId']
        }
    };

    return esQueryBody;
}

module.exports = function(esQueryBody, q) {
    q = q || '*';

    return isAdvancedQuery(q) ? decorateAdvancedQuery(esQueryBody, q) : decorateRegularQuery(esQueryBody, q);
};
