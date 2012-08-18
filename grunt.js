module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-less');

  // Project configuration.
  grunt.initConfig({
    test: {
      files: ["test/**/*.js"]
    },

    lint: {
      files: ["app.js", "test/**/*.js", "app/**/*.js"]
    },

    less: {
      index: {
        src: ['static/less/index.less'],
        dest: 'static/css/index.css',
        options: {
          yuicompress: true
        }
      },
      login: {
        src: ['static/less/login.less'],
        dest: 'static/css/login.css',
        options: {
          yuicompress: true
        }
      }
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true
      },
      globals: {}
    }
  });

  // Default task.
  grunt.registerTask("default", "lint test less");

};