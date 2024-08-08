'use strict';

var expect = require('chai').expect,
    decorateEsQueryBodyAddHighlight = require('../../../lib/service/decorateEsQueryBodyAddHighlight.service');

describe('decorateEsQueryBodyAddHighlight', function() {
    it('should be a function', function() {
        expect(decorateEsQueryBodyAddHighlight).to.be.a('function');
    });

    it('should add highlight key to esQueryBody', function() {
        var esQueryBody = {};

        decorateEsQueryBodyAddHighlight(esQueryBody);

        expect(esQueryBody).to.have.property('highlight');
        expect(esQueryBody.highlight).to.have.property('fields');
        expect(esQueryBody.highlight.fields).to.have.property('descriptor');
        expect(esQueryBody.highlight.fields.descriptor).to.be.an.empty('object');
        expect(esQueryBody.highlight.fields).to.have.property('descriptiveId');
        expect(esQueryBody.highlight.fields.descriptiveId).to.be.an.empty('object');
    });
});
