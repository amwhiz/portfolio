'use strict';

module.exports = {
    port: 24504,
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
        hostname: 'testapi.english.com',
        port: null,
        pathname: '/dna/v1',
        oauth: {
            clientId: 'aFpuT4CIt7ElFiNISa27unJpb',
            clientSecret: 'eN7a05ELqpjh'
        }
    }
};
