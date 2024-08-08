'use strict';

var expect = require('chai').expect,
    decorateEsQueryBodyAddLimitOffset = require('../../../lib/service/decorateEsQueryBodyAddLimitOffset.service');

describe('decorateEsQueryBodyAddLimitOffset', function() {
    it('should be a function', function() {
        expect(decorateEsQueryBodyAddLimitOffset).to.be.a('function');
    });

    it('should add size and from properties in esQueryBody', function() {
        var esQueryBody = {};

        decorateEsQueryBodyAddLimitOffset(esQueryBody);

        expect(esQueryBody).to.have.property('size');
        expect(esQueryBody).to.have.property('from');
    });

    it('should add default from or size', function() {
        var esQueryBody = {};

        decorateEsQueryBodyAddLimitOffset(esQueryBody);

        expect(esQueryBody.size).to.equal(10);
        expect(esQueryBody.from).to.equal(0);
    });

    it('should set from or size depending on limit and offset passed', function() {
        var esQueryBody = {},
            limit = 13,
            offset = 20;

        decorateEsQueryBodyAddLimitOffset(esQueryBody, limit, offset);

        expect(esQueryBody.size).to.equal(limit);
        expect(esQueryBody.from).to.equal(offset);
    });
});
