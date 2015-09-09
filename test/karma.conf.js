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

    browsers: ['Chrome'],

    plugins: [
      'karma-mocha',
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
