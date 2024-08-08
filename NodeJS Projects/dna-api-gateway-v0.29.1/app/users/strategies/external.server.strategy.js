'use strict';

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    userApiClient = require('../../dnaApiClient').dnaUsersApiClient,
    access = require('safe-access');

module.exports = function() {
    passport.use(new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password'
        },
        function(username, password, done) {
            function handleError(response) {
                return done({
                    message: access(response, 'error_description') || access(response, 'message') || response
                }, false, null);
            }

            userApiClient
                .authenticate(username, password)
                .error(handleError)
                .catch(handleError)
                .done(function(response) {
                    response = response || {};
                    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                    if (response.user_details) {
                        var user = {},
                        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                            safeData = access(response.user_details);

                        user.accessToken = response.access_token;
                        user.refreshToken = response.refresh_token;
                        user.provider = 'external';
                        user.displayName = safeData('profile.firstName') + ' ' + safeData('profile.lastName');
                        user.userStatus = safeData('identity.status');
                        user.userId = safeData('identity.userId');
                        user.emailAddress = safeData('profile.emails.map()', function(element) {
                            return element.emailAddress;
                        });
                        user.language = safeData('profile.preference.language');
                        user.timeZone = safeData('profile.preference.timeZone');
                        user.userId = safeData('identity.userId');
                        user.roles = safeData('roles.map()', function(element) {
                            return element.role;
                        });

                        return done(null, user);
                    }
                });
        }
    ));
};
