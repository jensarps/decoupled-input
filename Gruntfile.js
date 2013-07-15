/*global module:false*/
module.exports = function(grunt) {

  'use strict';

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: ['Gruntfile.js', 'src/*'],
      options: {
        // enforce:
        bitwise: true,
        camelcase: true,
        curly: true,
        latedef: true,
        newcap: true,
        noarg: true,
        noempty: true,
        nonew: true,
        quotmark: 'single',
        undef: true,
        unused: true,
        strict: true,
        trailing: true,
        indent: 2,
        // relax:
        loopfunc: true
      }
    },

    requirejs: {
      compile: {
        options: {
          baseUrl: 'src',
          optimize: 'uglify',
          useStrict: true,
          name: 'bundle-all',
          out: 'build/input-controller.js'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('default', ['jshint', 'requirejs']);

};
