const gulp = require('gulp');
const pug = require('gulp-pug');
const stylus = require('gulp-stylus');
const autoprefixer = require('gulp-autoprefixer');
const minifyCSS = require('gulp-minify-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

// *** Tasks ***

// Pug
gulp.task('pug', function() {
    gulp.src('dev/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('prod/'));
});

// CSS bundle
gulp.task('stylus', function() {
    
    var stylusStream = gulp.src('dev/styles/*.styl')
        .pipe(concat('stylus-files.styl'))
        .pipe(stylus())
        .pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: true
        }))
        .pipe(minifyCSS())
        .pipe(rename('bundle.min.css'))
        .pipe(gulp.dest('prod/assets/styles'));

});

// JS bundle
gulp.task('bundle_js', function() {
    gulp.src([
            'node_modules/jquery/dist/jquery.js',
            'node_modules/what-input/src/what-input.js',
            'node_modules/selectric/src/jquery.selectric.js',
            'node_modules/jquery.maskedinput/src/jquery.maskedinput.js',
            'node_modules/masonry-layout/dist/masonry.pkgd.js'
        ])
        .pipe(concat('bundle.min.js'))
        .pipe(uglify({
            mangle: true,
            compress: true,
            preserveComments: 'false'
        }))
        .pipe(gulp.dest('prod/assets/js'));
});

// JS main
gulp.task('main_js', function() {
    gulp.src('dev/js/*.js')
        // .pipe(rename('main.min.js'))
        // .pipe(uglify({
        //     mangle: false,
        //     compress: false,
        //     preserveComments: 'true'
        // }))
        .pipe(gulp.dest('prod/assets/js'));
});

// Gulp-Image - content images
gulp.task('imageOpt', function() {
    gulp.src([
            'dev/img/*',
            'dev/img/**/*'
        ])
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({ plugins: [{ removeViewBox: true }] })
        ]))
        .pipe(gulp.dest('prod/assets/img'));
});

// Gulp-Image - favicons
gulp.task('favicon', function() {
    gulp.src([
            'dev/favicon/*',
            'dev/favicon/**/*'
        ])
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({ plugins: [{ removeViewBox: true }] })
        ]))
        .pipe(gulp.dest('prod/'));
});

// Slick Slider resources
// gulp.task('slickResources', function() {
//     // fonts
//     gulp.src([
//             'node_modules/slick-carousel/slick/fonts/**',
//         ])
//         .pipe(gulp.dest('prod/assets/styles/fonts'));
//     // ajax-loader.gif
//     gulp.src([
//             'node_modules/slick-carousel/slick/ajax-loader.gif'
//         ])
//         .pipe(gulp.dest('prod/assets/styles'));
// });

// // Fonts
// gulp.task('fonts', function() {
//     // fonts
//     gulp.src([
//             'dev/fonts/*',
//             'dev/fonts/**/*',
//         ])
//         .pipe(gulp.dest('prod/assets/fonts'));
// });

// BrowserSync server
gulp.task('browser_sync', function () {
    browserSync.init({
        server: {
            baseDir: './prod'
        },
        ghostMode: {
            clicks: false,
            forms: false,
            scroll: false
        }
    });
});

// WATCH task
gulp.task('watch', function() {
    gulp.watch('dev/*.pug', ['pug']);
    gulp.watch('dev/**/*.pug', ['pug']);
    gulp.watch('dev/templates/*.pug', ['pug']);
    gulp.watch('dev/styles/*.styl', ['stylus']);
    gulp.watch('dev/js/*.js', ['bundle_js', 'main_js']);
    gulp.watch('dev/img/*', ['imageOpt']);
    gulp.watch('dev/img/**/*', ['imageOpt']);
    gulp.watch('prod/*.html').on('change', browserSync.reload);
    gulp.watch('prod/assets/styles/*.css').on('change', browserSync.reload);
});
gulp.task('default', ['pug', 'stylus', 'bundle_js', 'main_js', 'imageOpt', 'favicon', 'browser_sync', 'watch']);