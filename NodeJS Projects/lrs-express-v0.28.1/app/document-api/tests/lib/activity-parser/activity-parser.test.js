// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
'use strict';

var expect = require('chai').expect,
    activityParser = require('../../../lib/activity-parser/activity-parser'),
    params,
    expectedResult,
    result,
    lrsId = '54997a42aa3bddfe258b456b';

describe('Unit tests', function() {
    describe('Activity Parser', function() {
        it('should exist', function() {
            expect(activityParser).to.exist();
        });

        it('should be a object', function() {
            expect(activityParser).to.be.an('object');
        });

        describe('parseGetParams', function() {
            it('should exist', function() {
                expect(activityParser.parseGetParams).to.be.an('function');
            });

            it('should parse properly', function() {
                params = {
                    activityId: 'dsa',
                    since: '2015-01-06 11:11:39.960Z'
                };

                expectedResult = {
                    lrs: lrsId,
                    documentType: 'activity',
                    activityId: 'dsa',
                    createdAt: {
                        $gt: new Date('2015-01-06 11:11:39.960Z')
                    }
                };

                result = activityParser.parseGetParams(lrsId, params);
                expect(result).to.be.deep.equal(expectedResult);
            });
        });

        describe('parsePostParams', function() {
            it('should exist', function() {
                expect(activityParser.parsePostParams).to.be.an('function');
            });

            it('should parse properly', function() {
                params = {
                    activityId: 'dsa',
                    profileId: '321'
                };

                expectedResult = {
                    lrs: lrsId,
                    documentType: 'activity',
                    activityId: 'dsa',
                    profileId: '321'
                };

                result = activityParser.parsePostParams(lrsId, params);
                expect(result).to.be.deep.equal(expectedResult);
            });
        });
    });
});
