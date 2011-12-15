==========
urlresolve
==========

Django-style URLResolvers for browsers and `Node.js`_.

Browsers:

   * `urlresolve.js`_ (depends on the is, func, format and re components of `isomorph`_)

Node.js::

   npm install urlresolve

URL patterns can be configuredto map URLs to handlers, capturing named
parameters in the process, and to reverse-resolve a URL name and parameters
to obtain a URL.

.. _`Node.js`: http://nodejs.org
.. _`urlresolve.js`: https://raw.github.com/insin/urlresolve/master/urlresolve.js
.. _`isomorph`: https://github.com/insin/isomorph

Creating URL Patterns
=====================

``patterns(context, patterns...)``
----------------------------------

   Creates a list of URL patterns, which can be specified using the ``url``
   function or a list of [pattern, handler, urlName].

   Handler propertyies can be specified as strings to be looked up from a
   context object, which should be passed as the first argument in that case,
   otherwise it should be ``null`` or falsy.

``url(pattern, view, urlName)``
-------------------------------

   Creates a URL pattern or roots a list of patterns to the given pattern if
   a list of views. The URL name is used in reverse URL lookups and should be
   unique.

   Patterns:

   * Should not start with a leading slash, but should end with a trailing slash
     if being used to root other patterns, otherwise to your own taste.

   * Can identify named parameters to be extracted from resolved URLS using a
     leading ``:``, e.g.::

        widgets/:id/edit/

Using URL Patterns
==================

``getResolver(patterns)``
-------------------------

   Initialises a URLResolver with the given URL patterns and provides a
   convenience interface for using it repeatedly.

   Returns an Object with the following API:

   ``patterns``

      The URL patterns which were passed into ``getResover``.

   ``resolver``

      The root URLResolver created with the given URL patterns.

   ``resolve(path)``

      Resolves the given URL path, returning an object with ``func``, ``args`` and
      ``urlName`` properties if successful, otherwise throwing a ``Resolver404``
      error.

   ``reverse(urlName, args)``

      Reverse-resolves the given named URL with the given args (if applicable),
      returning a URL string if successful, otherwise throwing a ``NoReverseMatch``
      error.

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
