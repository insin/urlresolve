==========
urlresolve
==========

Django-style URL resolver for browsers and `Node.js`_ - resolves a path
against a list of patterns, gives you back the handler you configured and
any captured parameters, then backs away slowly.

Browsers:

* `urlresolve.js`_ (depends on the ``is``, ``func``, ``format`` and
  ``re`` components of `isomorph`_)

Node.js::

   npm install urlresolve

.. _`Node.js`: http://nodejs.org
.. _`urlresolve.js`: https://raw.github.com/insin/urlresolve/master/urlresolve.js
.. _`isomorph`: https://github.com/insin/isomorph

Basic Usage
===========

Declare some URL patterns::

   var url = urlresolve.url

   var Views = {
     index: function() { }
   , list: function() { }
   , detail: function(id) { }
   }

   var urlpatterns = urlresolve.patterns(Views
   , url('',             'index',  'index')
   , url('things/',      'list',   'thing_list')
   , url('things/:id/'), 'detail', 'thing_detail')
   )

Create a resolver to make use them::

   var resolver = urlresolve.getResolver(urlpatterns)

Resolve some paths::

   var match = resolver.resolve('/')
   // match.func is Views.index, bound to Views
   // match.urlName is 'index'

   match = resolver.resolve('/things/123/')
   // match.func is Views.detail, bound to Views
   // match.args is ['123']
   // match.urlName is 'thing_detail'

   try {
     resolver.resolve('/notthere/')
   }
   catch (e) {
     // e is a urlresolve.Resolver404 and contains details of the patterns
     // it tried to match against
   }

Decouple your URLs by naming them and constructing URLs names and
arguments::

   resolver.reverse('index')               // '/'
   resolver.reverse('thing_list')          // '/things/'
   resolver.reverse('thing_detail', [123]) // '/things/123/'

   try {
     resolver.reverse('blah')
   }
   catch (e) {
     // e is a urlresolve.NoReverseMatch
   }

Creating URL Patterns
=====================

``urlresolve.patterns(context, pattern1[, pattern2, ...])``
-----------------------------------------------------------

Creates a list of URL patterns, which can be specified using the ``url``
function or a list of [pattern, handler, urlName].

Handler properties can be specified as strings to be looked up from a
context object, which should be passed as the first argument in that case,
otherwise it should be ``null`` or falsy.

``urlresolve.url(pattern, view, urlName)``
------------------------------------------

Creates a URL pattern or roots a list of patterns to the given pattern if
``view`` is a list of URL patterns.

The URL name is used in reverse URL lookups and should be unique.

Patterns:

* Should not start with a leading slash, but should end with a trailing slash
  if being used to root other patterns, otherwise to your own taste.

* Can identify named parameters to be extracted from resolved URLS using a
  leading ``":"``, e.g.::

     widgets/:id/edit/

Using URL Patterns
==================

``urlresolve.getResolver(patterns)``
------------------------------------

Creates a ``urlresolve.URLResolver`` with the given URL patterns and
provides an interface for using it repeatedly.

Returns an Object with the following API:

``patterns``
   The URL patterns which were passed into ``getResolver``.

``resolver``
   The root URLResolver created with the given URL patterns.

``resolve(path)``
   Resolves the given URL path, returning an object with ``func``, ``args``
   and ``urlName`` properties if successful, otherwise throwing a
   ``Resolver404`` error.

``reverse(urlName[, args])``
   Reverse-resolves the given named URL, with the given Array of args if
   provided, returning a URL string if successful, otherwise throwing a
   ``NoReverseMatch`` error.

MIT License
===========

Copyright (c) 2011, Jonathan Buchanan

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
