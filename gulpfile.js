var widgets = require('./');
var gulp = require('gulp');
var fs = require('fs');
var _ = require('lodash');
var $ = require('gulp-load-plugins')();

/**
 * Lint runs a linting and code style check on all the widget sources,
 * exclusing test sources.
 */
gulp.task('lint', function () {
    var src = sources('/**/*.js').concat(['!**/*.test.js']);

    gulp.src(src)
        .pipe($.eslint())
        .pipe($.eslint.format())
        // todo(connor4312): update widgets to new code standards
        //.pipe($.eslint.failAfterError());
});

/**
 * Mocha runs the mocha test running on all test/*.js files contained
 * in widget subdirectories.
 */
gulp.task('mocha', function () {
    var src = sources('/test/**/*.js').concat(['test/**/*.js']);
    gulp.src(src, { read: false }).pipe($.mocha());
});

gulp.task('cover', function (done) {
    var testSrc = sources('/test/**/*.js').concat(['test/**/*.js']);
    var widgetSrc = sources('/chat/**/*.js').concat(['!**/chat/index.js']);

    gulp.src(widgetSrc)
        .pipe($.istanbul({ includeUntested: true }))
        .pipe($.istanbul.hookRequire())
        .on('finish', function () {
            gulp.src(testSrc, { read: false })
                .pipe($.mocha())
                .pipe($.istanbul.writeReports())
                .on('end', done);;
        });
});

gulp.task('test', ['lint', 'mocha']);
// Runs test on sources and, if they pass, compiles a manifest.
gulp.task('compile', ['test', 'buildmanifest']);

/**
 * Gets a list of paths for each widget directory, appended with the fragment.
 * @param  {String} fragment
 * @return {Array}
 */
function sources (fragment) {
    return widgets.map(function (source) {
        return source.path + fragment;
    });
}
