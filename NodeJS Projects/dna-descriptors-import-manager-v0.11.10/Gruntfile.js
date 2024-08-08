'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        complexity: {
            generic: {
                src: ['app/**/*.js'],
                options: {
                    errorsOnly: false,
                    cyclometric: 6,       // default is 3
                    halstead: 16,         // default is 8
                    maintainability: 100  // default is 100
                }
            }
        },
        env: {
            test: {
                NODE_ENV: 'test'
            },
            dev: {
                NODE_ENV: 'development'
            }
        },
        jshint: {
            all: [
                'Gruntfile.js',
                'lib/**/*.js',
                'test/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            }
        },
        jscs: {
            src: ['index.js', 'lib/**', 'test/lib/**'],
            options: {
                config: '.jscsrc'
            }
        },
        githooks: {
            all: {
                'pre-push': 'check'
            }
        },
        mocha_istanbul: {
            coverage: {
                src: ['./test/'],
                options: {
                    excludes: ['*.csv', '*.base64'],
                    recursive: true
                }
            }
        },
        istanbul_check_coverage: {
            mocha: {
                options: {
                    coverageFolder: 'coverage',
                    check: {
                        statements: 98,
                        branches: 90,
                        functions: 99,
                        lines: 98
                    }
                }
            }
        },
        watch: {
            js: {
                files: ['**/*.js', '!node_modules/**/*.js'],
                tasks: ['default'],
                options: {
                    nospawn: true
                }
            }
        },
        nodemon: {
            dev: {
                script: 'index.js',
                options: {
                    ignore: ['*']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.loadNpmTasks('grunt-complexity');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-githooks');

    grunt.registerTask('check', ['lint', 'test', 'istanbul_check_coverage']);
    grunt.registerTask('lint', ['jshint', 'jscs']);

    grunt.registerTask('test', ['githooks', 'env:test', 'complexity', 'coverage']);
    grunt.registerTask('ci', ['test', 'watch']);
    grunt.registerTask('default', ['githooks', 'env:dev', 'nodemon']);
    grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
};
