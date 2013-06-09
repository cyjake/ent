module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: [
        "Gruntfile.js", "{src,test}/**/*.js", "build/ent.js",
        '!test/qunit.js', '!src/{0.dawn.js,9.nightfall.js}'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    concat: {
      options: {
        separator: '\n',
        banner: [
          '/**',
          ' * <%= pkg.description %> v<%= pkg.version %>',
          ' * ',
          ' * http://cyj.me/ent',
          ' */',
          '' // for the extra line break
        ].join('\n'),
        footer: '\n'
      },
      dist: {
        src: ['src/**/*.js'],
        dest: 'build/ent.js'
      }
    },
    qunit: {
      all: {
        options: {
          urls: (function() {
            var base = 'http://localhost:4338/'
            var glob = require('glob')

            var urls = glob.sync('test/**/test.*.html').map(function(f) {
              return base + f
            })

            return urls
          })()
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 4338,
          base: '.',
          hostname: '*'
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-qunit')
  grunt.loadNpmTasks('grunt-contrib-connect')
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-concat')

  grunt.registerTask('test', ['build', 'connect', 'qunit'])
  grunt.registerTask('build', ['jshint', 'concat', 'jshint'])
}