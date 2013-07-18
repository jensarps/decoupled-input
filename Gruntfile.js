/*global module:false*/
module.exports = function (grunt) {

  'use strict';

  var UMDWrapper = {
    /*jshint indent: false */
    before: [
      '(function (name, definition, global) {',
        'if (typeof define === \'function\') {',
          'define(definition);',
        '} else if (typeof module !== \'undefined\' && module.exports) {',
          'module.exports = definition();',
        '} else {',
          'global[name] = definition();',
        '}',
      '})(\'inputController\', function () {'
    ],
    after: [
        'return module$src$bundle_all; ',
      '}, this);\n'
    ]
  };

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
        jsOutputFile: 'build/input-controller.js',
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
        src: ['build/input-controller.js'],
        dest: './',
        wrapper: [
          UMDWrapper.before.join(' '),
          UMDWrapper.after.join(' ')
        ]
      },

      'debug': {
        src: ['build/input-controller-debug.js'],
        dest: './',
        wrapper: [
          UMDWrapper.before.join('\n'),
          UMDWrapper.after.join('\n')
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

  grunt.registerTask('configure', 'A task to select specific handlers', function() {

    if (arguments.length === 0) {
      grunt.log.writeln(this.name + ', no args');
    } else {
      var handlerNames = [].slice.call(arguments);
      var handlerClassNames = handlerNames.map(function(name){
        return name.slice(0,1).toUpperCase() + name.slice(1, name.length) + 'Handler';
      });
      var handlerModuleNames = handlerClassNames.map(function(name){
        return '"../src/' + name + '"';
      });

      var bundleFileContents = [
        '/*global define:false*/',
        'define([',
        '"../src/InputController",',
        handlerModuleNames.join(',\n'),
        '], function (InputController, ' + handlerClassNames.join(', ') + ') {',
        '"use strict";',
        'var bundle = new InputController();',
        'bundle.registerDeviceHandlers([' + handlerClassNames.join(', ') + ']);',
        'return bundle;',
        '});\n'
      ].join('\n').replace(/"/g, '\'');

      grunt.file.write('build/bundle.js', bundleFileContents);
      grunt.log.ok('Bundle file written. Configured to include the following device handlers:');
      grunt.log.writeln(handlerClassNames.join('\n'));
    }
  });
};
