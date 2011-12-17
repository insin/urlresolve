var qunit = require('qunit')
  , path = require('path')

qunit.run({ code: {path: path.join(__dirname, '../urlresolve.js'), namespace: 'urlresolve'}
          , tests: [path.join(__dirname, 'urlresolve.js')]
          })
