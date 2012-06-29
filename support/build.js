var path = require('path')

var buildumb = require('buildumb')

buildumb.build({
  root: path.normalize(path.join(__dirname, '..'))
, modules: {
    'node_modules/isomorph/is.js'     : ['isomorph/is', './is']
  , 'node_modules/isomorph/func.js'   : 'isomorph/func'
  , 'node_modules/isomorph/format.js' : 'isomorph/format'
  , 'node_modules/isomorph/re.js'     : 'isomorph/re'
  , 'lib/urlresolve.js'               : 'urlresolve'
  }
, exports: {
    'urlresolve': 'urlresolve'
  }
, output: 'urlresolve.js'
, compress: 'urlresolve.min.js'
, header: buildumb.formatTemplate(path.join(__dirname, 'header.js'),
                                  require('../package.json').version)
})
