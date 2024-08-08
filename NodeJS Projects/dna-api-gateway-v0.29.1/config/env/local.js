'use strict';

module.exports = {
    db: 'mongodb://localhost:27017/dna-api-gateway',
    app: {
        publicResources: [
            '/',
            '/auth/signin',
            '/auth/user'
        ]
    },
    dnaApi: {
        schema: 'http',
        hostname: 'localhost',
        port: 4500,
        pathname: '/dna/v1',
        oauth: {
            clientId: 'cZcW3EY5R0iCZc94W9zQEJCe6ZkyuMbr',
            clientSecret: '2EeJXTxExi0e4tdMoislkhGz'
        }
    }
};
