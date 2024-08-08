'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        mocha_istanbul: {
            coverage: {
                src: ['./test/', './test/lib/**'],
                options: {
                    coverageFolder: 'coverage/mocha',
                    mask: '*.js',
                    excludes: ['Gruntfile.js', 'wallaby.js'],
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
                        statements: 98,
                        branches: 90,
                        functions: 96,
                        lines: 98
                    }
                }
            }
        },
        githooks: {
            all: {
                'pre-push': 'check'
            }
        },
        jshint: {
            all: {
                src: ['lib', 'test'],
                options: {
                    jshintrc: true
                }
            }
        },
        jscs: {
            all: {
                files: {
                    src: ['lib', 'test']
                },
                options: {
                    config: '.jscsrc'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-githooks');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('cover', ['mocha_istanbul']);
    grunt.registerTask('lint', ['jshint', 'jscs']);
    grunt.registerTask('check', ['cover', 'istanbul_check_coverage', 'lint']);
};
