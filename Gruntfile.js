'use strict';
module.exports = function (grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    clean: {
      build: {
        files: [{
          dot: true,
          src: [
            'dist/*',
            '!dist/.git'
          ]
        }]
      }
    },
    useminPrepare: {
      options: {
        dest: 'dist'
      },
      dist: 'public/index.html'
    },
    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          removeRedundantAttributes: true,
          removeEmptyAttributes: true
        },
        files: [{
          cwd: 'public',
          expand: true,
          src: '{,*/}*.html',
          dest: 'dist'
        }]
      }
    },
    filerev: {
      js: {
        src: ['dist/js/{,*/}*.js'],
        dest: 'dist/js'
      },
      css: {
        src: ['dist/style/{,*/}*.css'],
        dest: 'dist/style'
      }
    },
    usemin: {
      html: 'dist/index.html'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['{,*/}*.js', 'bin/www']
    },
    watch: {
      test: {
        files: ['{,*/}*.js', 'bin/www'],
        tasks: ['test']
      },
      compass: {
        files: ['public/style/sass/{,*/}*.{scss,sass}'],
        tasks: ['compass:server']
      }
    },
    compass: {
      options: {
        sassDir: 'public/style/sass',
        cssDir: 'public/styles',
        importPath: 'public/vendor/bower_components',
        relativeAssets: false
      },
      dist: {},
      server: {}
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    }
  });
  grunt.registerTask('build', [
    'clean',
    'useminPrepare',
    'concat:generated',
    'htmlmin',
    'cssmin:generated',
    'uglify:generated',
    'filerev', 'usemin']);
  grunt.registerTask('test', ['jshint', 'mochaTest']);
};
