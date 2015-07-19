'use strict'

module.exports = function(config) {
  config.set({
    basePath: '..',

    files: [
      'lib/fetch.js',
      'test-browser/index.js'
    ],

    preprocessors: {
      'index.js': 'coverage'
    },

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: ['Chrome'],

    plugins: [
      'karma-jasmine',
      'karma-coverage',
      'karma-chrome-launcher'
    ],

    reporters: ['progress', 'coverage'],

    coverageReporter: {
      type: 'html',
      dir: 'coverage'
    },

    log: 'debug'
  })
}
