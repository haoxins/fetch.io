
'use strict'

module.exports = function(config) {
  config.set({
    basePath: '..',

    files: [
      'test/browser-build.js'
    ],

    preprocessors: {
      'index.js': 'coverage'
    },

    autoWatch: true,

    frameworks: ['mocha'],

    browsers: ['Safari'],

    plugins: [
      'karma-mocha',
      'karma-coverage',
      'karma-safari-launcher'
    ],

    reporters: ['progress', 'coverage'],

    coverageReporter: {
      type: 'html',
      dir: 'coverage'
    },

    log: 'debug'
  })
}
