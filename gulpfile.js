var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify');

gulp.task('styles', function() {
    return gulp.src('app/stylesheets/main.sass')
        .pipe(sass({ style: 'expanded' }))
        .pipe(gulp.dest('public/style'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('public/style'))
        .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('scripts', function() {
    return gulp.src('app/javascripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(concat('beta.js'))
        .pipe(gulp.dest('public/script'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('public/script'))
        .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('scripts_lib', function() {
    return gulp.src(['bower_components/jquery/dist/jquery.min.js', 'bower_components/angular/angular.min.js', 'bower_components/angular-resource/angular-resource.min.js', 'bower_components/angular-ui-router/release/angular-ui-router.min.js', 'bower_components/d3/d3.min.js'])
        .pipe(gulp.dest('public/script/lib'))
        .pipe(notify({ message: 'Vendor scripts task complete' }));
});

gulp.task('templates', function() {
    return gulp.src('app/templates/*.html')
        .pipe(gulp.dest('public/template'))
        .pipe(notify({ message: 'Templates task complete' }));
});

gulp.task('clean', function() {
    return gulp.src(['public/style', 'public/script', 'public/template'], {read: false})
        .pipe(clean());
});

gulp.task('default', function() {
    gulp.start('styles', 'scripts', 'scripts_lib', 'templates');
});

gulp.task('watch', function() {
    gulp.watch('app/stylesheets/**/*.sass', ['styles']);
    gulp.watch('app/javascripts/**/*.js', ['scripts']);
    gulp.watch('app/templates/**/*.html', ['templates']);
});