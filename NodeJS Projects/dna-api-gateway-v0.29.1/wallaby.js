'use strict';

module.exports = function() {
    return {
        files: [
            'app.js',
            'app/dnaApiClient.js',
            'app/users/strategies/external.server.strategy.js',
            'app/tests/**/*.js',
            'app/**/*.lib.js',
            'app/**/*.controller.js',
            'app/**/*.route.js',
            'config/**/*.js'
        ],
        tests: [
            'app/**/*.test.js'
        ],
        env: {
            runner: 'node',
            type: 'node',
            params: {
                runner: '',
                env: 'NODE_ENV=localTest'
            }
        },
        testFramework: 'mocha@2.1.0',
        debug: true
    };
};