/*
http://corner.squareup.com/2013/08/small-grunts.html
example usage:
$> npm install -g grunt-cli
$> npm install
$> grunt watch
*/

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
                mangle: true,
                compress: true
            },
            dist: {
                files: {
                'js/sitecontent.min.js': ['js/src/sitecontent.js'],
                'js/jquery.knob.min.js': ['js/src/jquery.knob.js']
                }
            }
        },
        autoprefixer: {
            multiple_files: {
                expand: true,
                flatten: true,
                src: 'css/src/*.css',
                dest: 'css/' 
            }
        },
        watch: {
            styles: {
                files: ['css/src/*.css', 'js/src/*.js'],
                tasks: ['autoprefixer', 'uglify'],
            }
        }
    });
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
};