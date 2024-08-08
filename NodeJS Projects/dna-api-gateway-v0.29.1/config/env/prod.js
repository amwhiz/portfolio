'use strict';

module.exports = {
    db: 'mongodb://localhost:27018/dna-api-gateway',
    app: {
        publicResources: [
            '/',
            '/auth/signin',
            '/auth/user'
        ]
    },
    dnaApi: {
        schema: 'http',
        hostname: 'api.english.com',
        port: null,
        pathname: '/dna/v1',
        oauth: {
            clientId: 'mwnuJPrkIkzAlixJEyGbcWdCu',
            clientSecret: 'iP5e41Oo9J0S'
        }
    }
};
