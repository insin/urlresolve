var path = require('path')

var buildumb = require('buildumb')

buildumb.build({
  root: path.normalize(path.join(__dirname, '..'))
, modules: {
    'node_modules/isomorph/lib/is.js'     : ['isomorph/lib/is', './is']
  , 'node_modules/isomorph/lib/func.js'   : 'isomorph/lib/func'
  , 'node_modules/isomorph/lib/format.js' : 'isomorph/lib/format'
  , 'node_modules/isomorph/lib/re.js'     : 'isomorph/lib/re'
  , 'lib/urlresolve.js'                   : 'urlresolve'
  }
, exports: {
    'urlresolve': 'urlresolve'
  }
, output: 'urlresolve.js'
, compress: 'urlresolve.min.js'
, header: buildumb.formatTemplate(path.join(__dirname, 'header.js'),
                                  require('../package.json').version)
})
