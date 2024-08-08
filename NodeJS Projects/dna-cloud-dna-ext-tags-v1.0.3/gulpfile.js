var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    symlink = require("gulp-sym"),
    istanbul = require('gulp-istanbul'),
    testSrc = './lib/tests/**/*.test.js',
    coverSrc;

coverSrc = [
    'lib/controllers/*',
    'lib/lib/*',
    'lib/services/*'
];

gulp
    .task('test', function(done) {
        gulp.src(coverSrc)
            .pipe(istanbul())
            .pipe(istanbul.hookRequire())
            .on('finish', function() {
                gulp.src(testSrc)
                    .pipe(mocha())
                    .pipe(istanbul.writeReports())
                    .on('end', done);
            });
    })
    .task('hooks', function() {
        return gulp.src([ ".git-hooks/pre-push"])
            .pipe(symlink([ ".git/hooks/pre-push"], {
                relative: true,
                force: true
            }));
    });