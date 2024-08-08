'use strict';

module.exports = function(grunt) {
    // Unified Watch Object
    var watchFiles = {
            serverJS: ['gruntfile.js', 'server.js', 'config/**/*.js', 'app/**/**/*.js'],
            mochaTests: ['app/*/tests/**/*.test.js']
        },
        init = require('./config/init')(),
        config = require('./config/config');

    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        mkdir: {
            all: {
                options: {
                    create: [config.uploadDir]
                }
            }
        },
        exec: {
            start: 'pm2 start server.js --name lrsms-server',
            newman: 'newman -c ./postman_collection/xapi.json -s',
            stop: 'pm2 stop lrsms-server'
        },
        easy_mongo_fixture: {
            loadTest: {
                options: {
                    database: 'pearson-lrs-test',
                    dir: './fixtures',
                    override: true
                },
                collections: ['lrs', 'users'],
                action: 'load'
            },
            loadDev: {
                options: {
                    database: 'pearson-lrs-dev',
                    dir: './fixtures',
                    override: true
                },
                collections: ['lrs', 'users'],
                action: 'load'
            },
            save: {
                options: {
                    database: 'll',
                    dir: './fixtures',
                    override: true
                },
                collections: ['lrs', 'users'],
                action: 'save'
            }
        },
        watch: {
            serverJS: {
                files: watchFiles.serverJS,
                tasks: [],
                options: {
                    livereload: true
                }
            }
        },
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    nodeArgs: ['--debug'],
                    ext: 'js',
                    watch: watchFiles.serverJS
                }
            }
        },
        'node-inspector': {
            custom: {
                options: {
                    'web-port': 1337,
                    'web-host': 'localhost',
                    'debug-port': 5858,
                    'save-live-edit': true,
                    'no-preload': true,
                    'stack-trace-limit': 50,
                    'hidden': []
                }
            }
        },
        concurrent: {
            default: ['jscs', 'nodemon', 'watch', 'mkdir'],
            debug: ['nodemon', 'watch', 'node-inspector'],
            options: {
                logConcurrentOutput: true
            }
        },
        env: {
            test: {
                NODE_ENV: 'test'
            }
        },
        mochaTest: {
            src: watchFiles.mochaTests,
            options: {
                reporter: 'spec',
                require: 'server.js'
            }
        },
        'mongo-drop': {
            options: {
                dbname: 'pearson-lrs-test'
            }
        },
        mocha_istanbul: {
            coverage: {
                src: watchFiles.mochaTests,
                options: {
                    mask: '*.js',
                    require: 'server.js',
                    root: './app/',
                    excludes: ['**/vendor/**', '**/public/**', '**/build/**'],
                    istanbulOptions: [
                        '--include-all-sources',
                        '--default-excludes'
                    ]
                }
            }
        },
        jscs: {
            src: ["server.js", "app/**/*.js", "config/**/*.js"],
            options: {
                config: '.jscsrc',
                requireCurlyBraces: ['if'],
                reporter: 'text',
                reporterOutput: 'jscs.report'
            }
        },
        jscpd: {
            app: {
                options: {
                    'languages': ['javascript'],
                    'min-lines': 3,
                    'min-tokens': 70
                },
                path: './app',
                output: './cpd_report/app.xml',
                exclude: ['**/*test.js']
            }
        },
    });

    // Load NPM tasks
    require('load-grunt-tasks')(grunt);

    // Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    // A Task for loading the configuration object
    grunt.task.registerTask('loadConfig', 'Task that loads the config into a grunt option.', function() {
        var init = require('./config/init')();
        var config = require('./config/config');

        grunt.config.set('applicationJavaScriptFiles', config.assets.js);
    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-easy-mongo-fixture');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-jscpd');

    // Default task(s).
    grunt.registerTask('default', ['concurrent:default']);

    // Mongo drop db custom task.
    grunt.loadTasks('./tasks/grunt-drop-mongodb');

    // Debug task.
    grunt.registerTask('debug', ['concurrent:debug']);

    // Fixtures
    grunt.registerTask('fixtures:loadDev', ['easy_mongo_fixture:loadDev']);
    grunt.registerTask('fixtures:loadTest', ['mongo-drop', 'easy_mongo_fixture:loadTest']);
    grunt.registerTask('fixtures:save', ['easy_mongo_fixture:save']);

    // Build task(s).
    grunt.registerTask('build', ['loadConfig']);

    // Test task.
    grunt.registerTask('test', ['fixtures:loadTest', 'jscs', 'env:test', 'mocha_istanbul:coverage']);
    grunt.registerTask('postman', ['mkdir', 'fixtures:loadTest', 'env:test','exec:stop', 'exec:start', 'exec:newman', 'exec:stop']);
};