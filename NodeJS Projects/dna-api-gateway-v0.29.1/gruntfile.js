'use strict';

module.exports = function(grunt) {
    var watchFiles;

    // Unified Watch Object
    watchFiles = {
        serverJS: ['gruntfile.js', 'app.js', 'config/**/*.js', 'app/**/*.js'],
        mochaTests: ['app/**/*.test.js']
    };

    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: {
                src: watchFiles.serverJS,
                options: {
                    jshintrc: true
                }
            }
        },
        jscs: {
            src: ['app.js', 'config/**/*.js', 'app/**/*.js', 'app/*/tests/**/*.test.js'],
            options: {
                config: '.jscsrc',
                requireCurlyBraces: ['if']
            }
        },
        uglify: {
            production: {
                options: {
                    mangle: false
                },
                files: {
                    'public/dist/application.min.js': 'public/dist/application.js'
                }
            }
        },
        nodemon: {
            local: {
                script: 'app.js',
                options: {
                    ext: 'js',
                    watch: watchFiles.serverJS,
                    ignore: 'node_modules/**'
                }
            }
        },
        concurrent: {
            local: ['nodemon:local'],
            options: {
                logConcurrentOutput: true
            }
        },
        env: {
            dev: {
                NODE_ENV: 'dev'
            },
            local: {
                NODE_ENV: 'local'
            },
            localTest: {
                NODE_ENV: 'localTest'
            },
            stage: {
                NODE_ENV: 'stage'
            },
            prod: {
                NODE_ENV: 'prod'
            },
            test: {
                NODE_ENV: 'test'
            }
        },
        mochaTest: {
            src: watchFiles.mochaTests,
            options: {
                reporter: 'spec',
                require: 'app.js'
            }
        },
        mocha_istanbul: {
            coverage: {
                src: ['app/*/tests/*'],
                options: {
                    coverageFolder: 'coverage/mocha',
                    mask: '*.js',
                    require: 'app.js',
                    root: './app/',
                    istanbulOptions: [
                        '--include-all-sources',
                        '--default-excludes'
                    ]
                }
            }
        },
        istanbul_check_coverage: {
            mocha: {
                options: {
                    coverageFolder: 'coverage/mocha',
                    check: {
                        statements: 89,
                        branches: 100,
                        functions: 84,
                        lines: 89
                    }
                }
            }
        },
        shell: {
            startDnaApiGateway: {
                command: '(' + [
                    'pm2 stop dna-api-gateway',
                    'pm2 start ./app.js --name=dna-api-gateway'
                ].join('; ') + ')'
            }
        },
        githooks: {
            all: {
                'pre-push': 'check'
            }
        },
        jscpd: {
            backend: {
                options: {
                    'languages': ['javascript'],
                    'min-lines': 3,
                    'min-tokens': 70
                },
                path: './app',
                output: './cpd_report/backend.xml',
                exclude: ['**/*test.js']
            }
        },
        code_quality_report: {
            options: {
                dir: 'test/results',
                file: 'result.json'
            },
            target: {
                junit: {
                    results: {
                        file: 'test/test-results.xml',
                        details: false / true
                    },
                    coverage: {
                        file: 'test/coverage.json'
                    }
                },
                e2e: {
                    results: {
                        file: 'test/e2e.xml',
                        details: false / true
                    },
                    coverage: {
                        file: 'test/coverage.json'
                    }
                },
                jshint: {
                    file: 'path/to/jshint/div/result-file.xml',
                    details: false / true
                }
            }
        }
    });

    // Load NPM tasks
    require('load-grunt-tasks')(grunt);

    // A Task for loading the configuration object
    grunt.task.registerTask('loadConfig', 'Task that loads the config into a grunt option.', function() {
        var init = require('./config/init'),
            config;

        init();
        config = require('./config/config');

        grunt.config.set('applicationJavaScriptFiles', config.assets.js);
    });
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-jscpd');

    grunt.registerTask('build-dev', ['env:dev', 'githooks']);
    grunt.registerTask('build-stage', ['env:stage', 'githooks']);
    grunt.registerTask('build-test', ['env:test', 'githooks']);
    grunt.registerTask('build-prod', ['env:prod', 'githooks']);
    grunt.registerTask('build-local', ['env:local', 'githooks']);

    grunt.registerTask('dev', ['build-dev', 'shell']);
    grunt.registerTask('stage', ['build-stage', 'shell']);
    grunt.registerTask('prod', ['build-prod', 'shell']);
    grunt.registerTask('test', ['build-test', 'shell']);
    grunt.registerTask('local', ['build-local', 'shell']);

    grunt.registerTask('local-debug', ['env:local', 'githooks', 'concurrent:local']);
    grunt.registerTask('lint', ['jshint', 'jscs']);

    grunt.registerTask('testUnit', ['env:localTest', 'mocha_istanbul:coverage']);
    grunt.registerTask('check-coverage', ['testUnit', 'istanbul_check_coverage:mocha']);
    grunt.registerTask('check', ['lint', 'check-coverage']);
    grunt.registerTask('cpd', ['jscpd']);
    grunt.registerTask('default', ['local-debug']);
};
