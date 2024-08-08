'use strict';

module.exports = {
    port: process.env.PORT || 14504,
    sessionSecret: 'MEAN',
    sessionCollection: 'sessions',
    roles: {
        editRoles: ['owner', 'edit'],
        viewRoles: ['owner', 'edit', 'view']
    }
};
