var gulp = require('gulp'),
    sass = require('gulp-sass'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    neat = require('node-neat').includePaths;

gulp.task('styles', function() {
    return gulp.src('app/stylesheets/main.scss')
        .pipe(sass({
            style: 'expanded',
            includePaths: ['styles'].concat(neat),
            errLogToConsole: true
        }))
        .pipe(gulp.dest('public/style'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('public/style'));
});

gulp.task('scripts', function() {
    return gulp.src('app/javascripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(concat('beta.js'))
        .pipe(gulp.dest('public/script'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('public/script'));
});

gulp.task('scripts_lib', function() {
    return gulp.src(['bower_components/jquery/dist/jquery.min.js', 'bower_components/angular/angular.min.js', 'bower_components/angular-resource/angular-resource.min.js', 'bower_components/angular-ui-router/release/angular-ui-router.min.js', 'bower_components/angular-translate/angular-translate.min.js', 'bower_components/d3/d3.min.js'])
        .pipe(gulp.dest('public/script/lib'));
});

gulp.task('templates', function() {
    return gulp.src('app/templates/*.html')
        .pipe(gulp.dest('public/template'));
});

gulp.task('default', function() {
    gulp.start('styles', 'scripts', 'scripts_lib', 'templates');
});

gulp.task('watch', function() {
    gulp.watch('app/stylesheets/**/*.scss', ['styles']);
    gulp.watch('app/javascripts/**/*.js', ['scripts']);
    gulp.watch('app/templates/**/*.html', ['templates']);
});