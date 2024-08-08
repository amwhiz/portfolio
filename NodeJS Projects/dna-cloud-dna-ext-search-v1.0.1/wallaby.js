'use strict';

module.exports = function() {
    return {
        files: [
            'index.js',
            'lib/**/*.js'
        ],
        tests: [
            'test/**/*.js'
        ],
        env: {
            runner: 'node',
            type: 'node',
            params: {
                runner: '',
                env: ''
            }
        },
        testFramework: 'mocha@2.1.0',
        debug: true
    };
};