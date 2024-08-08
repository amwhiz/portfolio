'use strict';

module.exports = {
    db: 'mongodb://PNPSYLL_Dev_App:BY23qw3Q2REQ3@10.168.196.46:27017/devsyllabustool',
    app: {
        publicResources: [
            '/',
            '/auth/signin',
            '/auth/user'
        ]
    },
    dnaApi: {
        schema: 'http',
        hostname: 'devapi.english.com',
        port: null,
        pathname: '/dna/v1',
        oauth: {
            clientId: 'cZcW3EY5R0iCZc94W9zQEJCe6ZkyuMbr',
            clientSecret: '2EeJXTxExi0e4tdMoislkhGz'
        }
    }
};
