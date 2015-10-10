{ normalize } = require 'path'

module.exports = (grunt) ->
  require('load-grunt-tasks') grunt
  
  grunt.initConfig

    dist: normalize "#{__dirname}/dist"

    clean:
      dist: src: [ '<%= dist %>' ]

    coffee:
      wcjs: 
        options: 
          bare: true
          join: true
        files: 'build/wcjs-angular.core.js': ['src/*.coffee', 'src/**/**.coffee']

    # https://www.npmjs.com/package/grunt-angular-templates
    ngtemplates:
      'wcjs-angular': 
        cwd: 'src/'
        src: ['**/*.html']
        dest: 'build/wcjs-angular.templates.js'

    # https://www.npmjs.com/package/grunt-ng-annotate
    ngAnnotate:
      build: 
        files: 'build/wcjs-angular.bundle.js': [ 'build/wcjs-angular.bundle.js' ]
  
    concat:
      js:
        src: [
          'build/wcjs-angular.core.js'
          'build/wcjs-angular.templates.js'
        ]
        dest: 'build/wcjs-angular.bundle.js'

    stylus:
      build:
        options:
          'resolve url': true
          use: [ 'nib' ]
          compress: false
          paths: [ '/styl' ]
        
        expand: true
        join: true
        files: 'build/wcjs-angular.css': ['src/**/*.styl', 'src/**/**.styl']

  grunt.registerTask 'default', [ 'clean', 'coffee', 'ngtemplates', 'concat', 'ngAnnotate', 'stylus' ]
 