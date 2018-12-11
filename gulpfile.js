// Gulp.js configuration
var
    // modules
    gulp = require('gulp'),

    // development mode?
    devBuild = (process.env.NODE_ENV !== 'production'),

    // folders
    folder = {
        src: 'src/',
        build: 'build/'
    }
;
