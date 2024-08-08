'use strict';

var additionalInformationDecorator = require('../../lib/additionalInformationDecorator'),
    expect = require('chai').expect,
    fields = 'tagId tagLabel';

describe('Additional information decorator', function() {
    it('should be defined object', function(done) {
        expect(additionalInformationDecorator).to.be.a('object');
        done();
    });

    describe('method decorate', function() {
        it('should exist', function() {
            expect(additionalInformationDecorator.decorate).to.be.a('function');
        });

        it('should return empty additional information if there is no additional fields', function() {
            var object,
                expectedResult = {};

            object = {
                tagId: 'SKL0001',
                tagLabel: 'Skill'
            };

            additionalInformationDecorator.decorate(object, fields);

            expect(object.additionalInformation).to.be.deep.equal(expectedResult);
        });

        it('should return not empty additional information if there is additional fields', function() {
            var object,
                expectedResult;

            object = {
                tagId: 'SKL0001',
                tagLabel: 'Skill',
                additionalField: 123
            };

            expectedResult = {
                additionalField: 123
            };

            additionalInformationDecorator.decorate(object, fields);

            expect(object.additionalInformation).to.be.deep.equal(expectedResult);
        });
    });
});
