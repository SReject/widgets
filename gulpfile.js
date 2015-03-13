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

gulp.task('test', ['lint', 'mocha']);

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
