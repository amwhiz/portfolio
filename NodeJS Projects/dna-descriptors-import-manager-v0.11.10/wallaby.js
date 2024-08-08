'use strict';

/**
 * There still are some problems with socket test. We will fix them in the future.
 * For now we can use wallaby for every other test.
 */
module.exports = function() {
    return {
        files: [
            'lib/**',
            'index.js'
        ],
        tests: [
            'test/**'
        ],
        env: {
            runner: 'node',
            type: 'node',
            params: {
                runner: '',
                env: 'NODE_ENV=test'
            }
        },
        testFramework: 'mocha@2.1.0',
        debug: true
    };
};
