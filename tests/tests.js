var path = require('path')

var qqunit = require('qqunit')

global.urlresolve = require('../lib/urlresolve')

var tests = [path.join(__dirname, 'urlresolve.js')]

qqunit.Runner.run(tests, function(stats) {
  process.exit(stats.failed)
})
