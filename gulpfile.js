'use strict';
// Generated on 2015-09-14 using generator-leaflet 0.0.17

var gulp = require('gulp');
// var open = require('open');
var wiredep = require('wiredep').stream;
var merge = require('merge-stream');

// Load plugins
var $ = require('gulp-load-plugins')();

// Styles
gulp.task('styles', function () {
    return $.rubySass('public_html/scss/main.scss',{sourcemap : true})
        .on('error', $.rubySass.logError)
        .pipe($.autoprefixer('last 1 version'))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('public_html/styles'))
        .pipe($.livereload())
        .pipe($.size());
});


// Scripts
gulp.task('scripts', function () {
    return gulp.src(['public_html/scripts/**/*.js'])
        .pipe($.jshint('.jshintrc'))
        .pipe($.jshint.reporter('default'))
        .pipe($.livereload())
        .pipe($.size());
});

// HTML
gulp.task('html', ['styles', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    return gulp.src('public_html/*.html')
        .pipe($.useref.assets())
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.rev())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(gulp.dest('dist'))
        .pipe($.livereload())
        .pipe($.size());
});

// Images
gulp.task('images', function () {
    return gulp.src([
    		'public_html/images/**/*',
    		'public_html/lib/images/*'])
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

gulp.task('svg', function () {
    return gulp.src('svg/**/*.svg')
        .pipe($.svgmin())
        .pipe(gulp.dest('public_html/images'));
});


// Copy other frontend files
gulp.task('copy', function () {

    var root = gulp.src([
            'public_html/.htaccess',
            'public_html/robots.txt',
            'public_html/index.php'])
        .pipe(gulp.dest('dist'))
        .pipe($.size());

    var data = gulp.src([
            'public_html/data/*'])
        .pipe(gulp.dest('dist/data'))
        .pipe($.size());

    var fonts = gulp.src([
            'public_html/fonts/*'])
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.size());

    return merge(root, data, fonts);
});


// Clean
gulp.task('clean', function () {
    // return gulp.src(['dist/styles', 'dist/scripts', 'dist/images', 'dist/index.html'], { read: false }).pipe($.clean());
    return gulp.src(['dist'], { read: false }).pipe($.clean());
});


// Build
gulp.task('build', ['html', 'images', 'copy']);

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

// Connect
// gulp.task('connect', function(){
//     $.connect.server({
//         root: 'app',
//         port: 9000,
//         livereload: true
//     });
// });

//ConnectDist
// gulp.task('connectDist', function () {
//   $.connect.server({
//     root: 'dist',
//     port: 8001,
//   });
// });

// Open
// gulp.task('serve', ['connect'], function() {
//   open('http://localhost:9000');
// });

// Open dist
// gulp.task('serveDist', ['connectDist'], function() {
//   open('http://localhost:8001');
// });

// Inject Bower components
gulp.task('wiredep', function () {
    gulp.src('public_html/styles/*.css')
        .pipe(wiredep({
            directory: 'public_html/bower_components',
            ignorePath: 'public_html/bower_components/'
        }))
        .pipe(gulp.dest('public_html/styles'));

    gulp.src('public_html/*.html')
        .pipe(wiredep({
            directory: 'public_html/bower_components',
            ignorePath: 'public_html/'
        }))
        .pipe(gulp.dest('public_html'));
});

// Watch

// gulp.task('watch', function () {
//     // Watch for changes in `public_html` folder
//     gulp.watch([
//         'public_html/*.html',
// //        'public_html/components/*.html',
//         'public_html/styles/**/*.css',
//         'public_html/scripts/**/*.js',
//         'public_html/images/**/*'
//     ], function (event) {
//         return gulp.src(event.path)
//             .pipe($.connect.reload());
//     });

// watch
gulp.task('watch', function() {
  $.livereload.listen();

    // Watch .scss files
    gulp.watch('public_html/scss/**/*.scss', ['styles']);

    // Watch .js files
    gulp.watch('public_html/scripts/**/*.js', ['scripts']);

    // Watch image files
    gulp.watch('public_html/images/**/*', ['images']);

    // Watch bower files
    gulp.watch('bower.json', ['wiredep']);
});