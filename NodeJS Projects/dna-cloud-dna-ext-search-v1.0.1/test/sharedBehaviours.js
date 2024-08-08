'use strict';

var nock = require('nock');

module.exports = {
    nock: function() {
        afterEach(function() {
            nock.cleanAll();
        });

        before(function() {
            nock.disableNetConnect();
        });

        after(function() {
            nock.enableNetConnect(/.*/);
        });
    },

    nockRec: function() {
        before(function() {
            nock.recorder.rec({
                //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                output_objects: true
                //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
            });
        });

        after(function() {
            var nockCallObjects = nock.recorder.play();

            console.log(
                '\n\n-----------\nNOCK RECORD\n',
                nockCallObjects,
                '\n\n-----------\n'
            );
        });
    },

    sinonChai: function() {
        require('chai').use(require('sinon-chai'));
    }
};
