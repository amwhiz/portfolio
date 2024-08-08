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
        hostname: 'stageapi.english.com',
        port: null,
        pathname: '/dna/v1',
        oauth: {
            clientId: 'eWQWGmMMaAbTc9wGmd9mCFTbG',
            clientSecret: 'SRgzRUQM9fcO'
        }
    }
};
