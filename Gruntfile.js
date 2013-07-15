/*global module:false*/
module.exports = function(grunt) {


  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: ['src/*'],
      options: {
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

        loopfunc: true
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint']);

};
