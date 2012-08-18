module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    test: {
      files: ["test/**/*.js"]
    },

    lint: {
      files: ["app.js", "test/**/*.js", "app/**/*.js"]
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
  grunt.registerTask("default", "lint test");

};