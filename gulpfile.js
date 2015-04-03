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
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jscs());
});

/**
 * Mocha runs the mocha test running on all test/*.js files contained
 * in widget subdirectories.
 */
gulp.task('mocha', function () {
    var src = sources('/test/**/*.js').concat(['test/**/*.js']);
    gulp.src(src, { read: false }).pipe($.mocha());
});

/**
 * Cover generates a code coverage report for widgets, using
 * istanbul.
 */
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

/**
 * Buildmanifest pulls out widget metadata into a single external file. This
 * allows us to include relevant widget data in frontend (Browserify)
 * Javascript without having to include all the application logic.
 */
gulp.task('buildmanifest', function (done) {
    var data = _.values(widgets).map(function (widget) {
        return _.pick(widget, ['name', 'default', 'authors', 'description', 'permissions']);
    });

    fs.writeFile('./manifest.json', JSON.stringify(data), done);
});

// Runs tests on sources.
gulp.task('test', ['lint', 'mocha']);
// Runs test on sources and, if they pass, compiles a manifest.
gulp.task('compile', ['test', 'buildmanifest']);

/**
 * Gets a list of paths for each widget directory, appended with the fragment.
 * @param  {String} fragment
 * @return {Array}
 */
function sources (fragment) {
    var sources = [];
    for (var key in widgets) {
        sources.push(widgets[key].path + fragment);
    }

    return sources;
}
