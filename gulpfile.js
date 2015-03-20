var gulp = require('gulp');
var widgets = require('./');
var $ = require('gulp-load-plugins')();


gulp.task('lint', function () {
    var src = sources('/**/*.js').concat(['!**/*.test.js']);

    gulp.src(src)
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jscs());
});

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
