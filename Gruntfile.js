/*global module:false*/
module.exports = function (grunt) {

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
    },

    'closure-compiler': {
      all: {
        closurePath: 'lib/closure',
        jsOutputFile: 'build/input-controller-all.js',
        js: [
          'src/InputController.js',
          'src/KeyboardHandler.js',
          'src/MouseHandler.js',
          'src/GamepadHandler.js',
          'src/SpeechHandler.js',
          'src/bundle-all.js'
        ],
        maxBuffer: 500,
        options: {
          'language_in': 'ECMASCRIPT5_STRICT',
          'process_common_js_modules': null,
          'transform_amd_modules': null,
          'common_js_entry_module': 'src/bundle-all.js'
        }
      },

      debug: {
        closurePath: 'lib/closure',
        jsOutputFile: 'build/input-controller-debug.js',
        js: [
          'src/InputController.js',
          'src/KeyboardHandler.js',
          'src/MouseHandler.js',
          'src/GamepadHandler.js',
          'src/SpeechHandler.js',
          'src/bundle-all.js'
        ],
        maxBuffer: 500,
        options: {
          debug: true,
          formatting: 'PRETTY_PRINT',
          'language_in': 'ECMASCRIPT5_STRICT',
          'process_common_js_modules': null,
          'transform_amd_modules': null,
          'common_js_entry_module': 'src/bundle-all.js'
        }
      }
    },

    wrap: {
      'all': {
        src: ['build/input-controller-all.js'],
        dest: './',
        wrapper: [
          '(function (name, definition, global) {if (typeof define === \'function\') {define(definition);} else if (typeof module !== \'undefined\' && module.exports) {module.exports = definition();} else {global[name] = definition();}})(\'inputController\', function () {',
          'return module$src$bundle_all; });\n'
        ]
      },

      'debug': {
        src: ['build/input-controller-debug.js'],
        dest: './',
        wrapper: [
          '(function (name, definition, global) {if (typeof define === \'function\') {define(definition);} else if (typeof module !== \'undefined\' && module.exports) {module.exports = definition();} else {global[name] = definition();}})(\'inputController\', function () {',
          'return module$src$bundle_all; });\n'
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-closure-compiler');
  grunt.loadNpmTasks('grunt-wrap');

  grunt.registerTask('default', ['jshint', 'closure-compiler:all', 'wrap:all']);
  grunt.registerTask('debug', ['jshint', 'closure-compiler:debug', 'wrap:debug']);
};
