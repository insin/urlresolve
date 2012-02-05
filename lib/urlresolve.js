var is = require('isomorph/lib/is')
  , func = require('isomorph/lib/func')
  , format = require('isomorph/lib/format')
  , re = require('isomorph/lib/re')

var slice = Array.prototype.slice

/**
 * Thrown when a URLResolver fails to resolve a URL against known URL patterns.
 */
function Resolver404(path, tried) {
  this.path = path
  this.tried = tried || null
}
Resolver404.prototype.toString = function() {
  return 'Resolver404 on ' + this.path
}

/**
 * Thrown when a URL can't be reverse matched.
 */
function NoReverseMatch(message) {
  this.message = message
}
NoReverseMatch.prototype.toString = function() {
  return 'NoReverseMatch: ' + this.message
}

/**
 * Holds details of a successful URL resolution.
 */
function ResolverMatch(func, args, urlName) {
  this.func = func
  this.args = args
  this.urlName = urlName
}

var namedParamRE = /:([\w\d]+)/g
  , escapeRE = /[-[\]{}()*+?.,\\^$|#\s]/g

/**
 * Converts a url pattern to source for a RegExp which matches the specified URL
 * fragment, capturing any named parameters.
 *
 * Also stores the names of parameters in the call context object for reference
 * when reversing.
 */
function patternToRE(pattern) {
  pattern = pattern.replace(escapeRE, '\\$&')
  // Store the names of any named parameters
  this.namedParams = re.findAll(namedParamRE, pattern)
  if (this.namedParams.length) {
    // The pattern has some named params, so replace them with appropriate
    // capturing groups.
    pattern = pattern.replace(namedParamRE, '([^\/]*)')
  }
  return pattern
}

/**
 * Associates a URL pattern with a callback function, generating a RegExp which
 * will match the pattern and capture named parameters.
 */
function URLPattern(pattern, callback, name) {
  this.pattern = pattern
  // Only full matches are accepted when resolving, so anchor to start and end
  // of the input.
  this.regex = new RegExp('^' + patternToRE.call(this, pattern) + '$')

  if (is.Function(callback)) {
    this.callback = callback
    this.callbackName = null
  }
  else {
    this.callback = null
    this.callbackName = callback
  }

  this.name = name
}

URLPattern.prototype.toString = function() {
  return format.formatObj('[object URLPattern] <{name} "{pattern}">', this)
}

/**
 * Retrieves a named view function for this pattern from a context object,
 * binding it to the object.
 */
URLPattern.prototype.addContext = function(context) {
  if (!context || !this.callbackName) {
    return
  }
  this.callback = func.bind(context[this.callbackName], context)
}

/**
 * Resolves a URL fragment against this pattern, returning matched details if
 * resolution succeeds.
 */
URLPattern.prototype.resolve = function(path) {
  var match = this.regex.exec(path)
  if (match) {
    return new ResolverMatch(this.callback, match.slice(1), this.name)
  }
}

/**
 * Resolves a list of URL patterns when a root URL pattern is matched.
 */
function URLResolver(pattern, urlPatterns) {
  this.pattern = pattern
  // Resolvers start by matching a prefix, so anchor to start of the input
  this.regex = new RegExp('^' + patternToRE.call(this, pattern))
  this.urlPatterns = urlPatterns || []
  this._reverseLookups = null
}

URLResolver.prototype.toString = function() {
  return format.formatObj('[object URLResolver] <{pattern}>', this)
}

/**
 * Populates expected argument and pattern information for use when reverse
 * URL lookups are requested.
 */
URLResolver.prototype._populate = function() {
  var lookups = {}
    , urlPattern
    , pattern
  for (var i = this.urlPatterns.length - 1; i >= 0; i--) {
    urlPattern = this.urlPatterns[i]
    pattern = urlPattern.pattern
    if (urlPattern instanceof URLResolver) {
      var reverseLookups = urlPattern.getReverseLookups()
      for (var name in reverseLookups) {
        var revLookup = reverseLookups[name]
          , revLookupParams = revLookup[0]
          , revLookupPattern = revLookup[1]
        lookups[name] = [urlPattern.namedParams.concat(revLookupParams),
                         pattern + revLookupPattern]
      }
    }
    else if (urlPattern.name !== null) {
      lookups[urlPattern.name] = [urlPattern.namedParams, pattern]
    }
  }
  this._reverseLookups = lookups
}

/**
 * Getter for reverse lookup information, which populates the first time it's
 * called.
 */
URLResolver.prototype.getReverseLookups = function() {
  if (this._reverseLookups === null) {
    this._populate()
  }
  return this._reverseLookups
}

/**
 * Resolves a view function to handle the given path.
 */
URLResolver.prototype.resolve = function(path) {
  var tried = []
    , match = this.regex.exec(path)
  if (match) {
    var args = match.slice(1)
      , subPath = path.substring(match[0].length)
      , urlPattern
      , subMatch
    for (var i = 0, l = this.urlPatterns.length; i < l; i++) {
      urlPattern = this.urlPatterns[i]
      try {
        subMatch = urlPattern.resolve(subPath)
        if (subMatch) {
          // Add any arguments which were captured by this instance's own path
          // RegExp.
          subMatch.args = args.concat(subMatch.args)
          return subMatch
        }
        tried.push([urlPattern])
      }
      catch (e) {
        if (!(e instanceof Resolver404)) throw e
        var subTried = e.tried
        if (subTried !== null) {
          for (var j = 0, k = subTried.length; j < k; j++) {
            tried.push([urlPattern, subTried[j]])
          }
        }
        else {
          tried.push([urlPattern])
        }
      }
    }
    throw new Resolver404(subPath, tried)
  }
  throw new Resolver404(path)
}

/**
 * Performs a reverse lookup for a named URL pattern with given arguments,
 * constructing a URL fragment if successful.
 */
URLResolver.prototype.reverse = function(name, args) {
  args = args || []
  var lookup = this.getReverseLookups()[name]
  if (lookup) {
    var expectedArgs = lookup[0]
      , pattern = lookup[1]
    if (args.length != expectedArgs.length) {
      throw new NoReverseMatch(format.format(
          'URL pattern named "%s" expects %s argument%s, but got %s: [%s]'
        , name
        , expectedArgs.length
        , expectedArgs.length == 1 ? '' : 's'
        , args.length
        , args.join(', ')
        ))
    }
    return format.formatArr(pattern.replace(namedParamRE, '%s'), args)
  }
  throw new NoReverseMatch(format.format(
      'Reverse for "%s" with arguments [%s] not found.'
    , name
    , args.join(', ')
    ))
}


// -------------------------------------------------------------- Public API ---

/**
 * Creates a list of URL patterns, which can be specified using the url function
 * or an array with the same contents as that function's arguments.
 *
 * View names can be specified as strings to be looked up from a context object
 * (usually a Views instance), which should be passed as the first argument,
 * otherwise, it should be null.
 */
function patterns(context) {
  var args = slice.call(arguments, 1)
    , patternList = []
    , pattern
  for (var i = 0, l = args.length; i < l; i++) {
    pattern = args[i]
    if (is.Array(pattern)) {
      pattern = url.apply(null, pattern)
      pattern.addContext(context)
    }
    else if (pattern instanceof URLPattern) {
      pattern.addContext(context)
    }
    patternList.push(pattern)
  }
  return patternList
}

/**
 * Creates a URL pattern or roots a list of patterns to the given pattern if
 * a list of views.
 */
function url(pattern, view, name) {
  if (is.Array(view)) {
    return new URLResolver(pattern, view)
  }
  else {
    if (is.String(view)) {
      if (!view) {
        throw new Error('Empty URL pattern view name not permitted (for pattern ' + pattern + ')')
      }
    }
    return new URLPattern(pattern, view, name)
  }
}

/**
 * Initialises a URLResolver with the given URL patterns and provides a
 * convenience interface for using it repeatedly.
 */
function getResolver(patterns) {
  var resolver = new URLResolver('/', patterns)
  return {
    patterns: patterns
  , resolver: resolver
    /** Resolves a given URL. */
  , resolve: function(path) {
      return resolver.resolve(path)
    }
    /**
     * Reverse-resolves the URL pattern with the given name and arguments,
     * returning a URL.
     */
  , reverse: function(name, args, prefix) {
      args = args || []
      prefix = prefix || '/'
      return prefix + resolver.reverse(name, args)
    }
  }
}

module.exports = {
  version: '0.0.4'
, url: url
, patterns: patterns
, getResolver: getResolver
, URLPattern: URLPattern
, URLResolver: URLResolver
, ResolverMatch: ResolverMatch
, Resolver404: Resolver404
, NoReverseMatch: NoReverseMatch
}
