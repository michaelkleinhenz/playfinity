'use strict';

module.exports = function (grunt) {

  // Disables annoying terminal icon bounces on OSX.
  grunt.option('color', false);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // load tasks for wait-server
  grunt.loadNpmTasks('grunt-wait-server');
  grunt.loadNpmTasks('grunt-shell');

  // Configurable paths for the application
  var appConfig = {
    dist: 'dist',
    src: 'src'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    appConfig: appConfig,

    shell: {
      options: {
        stdout: true
      },
      npmInstall: {
        command: 'npm install'
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= appConfig.src %>/{,*/}*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= appConfig.dist %>/{,*/}*',
            '!<%= appConfig.dist %>/.git{,*/}*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: './',
          src: [
              'service/**/*',
              'node_modules/**/*',
              'playfinity.js',
              'Dockerfile',
              'README.md',
              'LICENSE'
          ],
          dest: '<%= appConfig.dist %>'
        }]
      }
    },

    // compress final dist
    compress: {
        main: {
            options: {
                archive: 'builds/playfinity-git-' + new Date().getTime() + '.zip'
            },
            files: [
                {expand: true, cwd: 'dist/', src: '**/*', dest: '/'}
            ]
        }
    }

  });

  grunt.registerTask('test', [
    'clean:server',
    'test'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'update',
    'copy:dist',
    'compress'
  ]);

  grunt.registerTask('update', [
    'shell:npmInstall'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);

};
