'use strict';

module.exports = {
    api: {
        schema: 'http',
        hostname: 'foo_testapi.english.com',
        port: null,
        pathname: '/foo/dna/v0.10.0',
        oauth: {
            clientId: 'foo_foo_foo',
            clientSecret: 'bar_bar_bar'
        }
    },
    db: 'mongodb://localhost/dna-descriptors-import-manager-test'
};
