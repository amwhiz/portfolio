'use strict';

var expect = require('chai').expect,
    express = require('express'),
    descriptorStatusRoute = require('../../routes/descriptor-status.server.route'),
    descriptorStatusController = require('../../controllers/descriptor-status.server.controller');

describe('Descriptor status router', function() {
    it('should be a function', function() {
        expect(descriptorStatusRoute).to.be.instanceOf(Function);
    });

    it('should add routes', function() {
        var router = express.Router();

        descriptorStatusRoute(router);

        expect(router.stack).to.have.length(2);

        expect(router.stack[0]).to.have.property('route');
        expect(router.stack[0].route).to.have.property('path');
        expect(router.stack[0].route.path).to.equal('/descriptorStatus');

        expect(router.stack[0].route).to.have.property('stack');
        expect(router.stack[0].route.stack).to.have.length(1);
        expect(router.stack[0].route.stack[0]).to.have.property('handle');
        expect(router.stack[0].route.stack[0].handle).to.equal(descriptorStatusController.list);

        expect(router.stack[1]).to.have.property('route');
        expect(router.stack[1].route).to.have.property('path');
        expect(router.stack[1].route.path).to.equal('/defaultDescriptorStatuses');

        expect(router.stack[1].route).to.have.property('stack');
        expect(router.stack[1].route.stack).to.have.length(1);
        expect(router.stack[1].route.stack[0]).to.have.property('handle');
        expect(router.stack[1].route.stack[0].handle).to.equal(descriptorStatusController.defaultStatuses);
    });
});
