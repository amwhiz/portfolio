'use strict';

var expect = require('chai').expect,
    activityService = require('../../services/activity.service'),
    params;

describe('Activity Service', function() {
    it('should exist', function() {
        expect(activityService).to.exist();
    });

    it('should be a object', function() {
        expect(activityService).to.be.an('object');
    });

    describe('getActivity', function() {
        it('should exist', function() {
            expect(activityService.getActivity).to.be.an('function');
        });

        it('should return promise', function() {
            params = {
                activityId: 'dsa'
            };

            expect(activityService.getActivity(params).constructor.name).to.be.equal('Promise');
        });
    });
});
