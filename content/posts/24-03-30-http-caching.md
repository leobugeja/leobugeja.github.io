---
title: "HTTP Cacheability: POST and PATCH Can, PUT Can’t"
subtitle: ""
date: 2024-03-30
slug: http-method-cacheability
thumbnail: /images/browser_cache_drawing.png
headerimage: /images/browser_cache_drawing.png
---

When learning about HTTP caching, it was unclear to me how POST or PATCH methods could be cached given that they modify the state of the server, what was meant that they are "only cacheable if response contains explicit freshness information and matching content-location" and why other similar methods such as PUT aren't cacheable. Hopefully this article will bring some light on these questions.

## What is HTTP Cacheability?
A HTTP method is considered cacheable when a response to the request can be stored and used to fulfill future requests rather than make the request to the server again.

The caching of a response depends on serval factors, including the type of cache (private or shared), the way the cache is implemented (such as browser-specific behaviour), the HTTP request method, the response’s status code, and the response’s headers. The response may be stored in a private cache that is tied to the client (e.g. in the browser) or in a shared cache located between the client and server (e.g. a Proxy or CDN).

## Method Cacheability Comparison
Given that we will be discussing the HTTP methods GET, PUT, POST and PATCH, it is helpful to outline an overview of their properties:


| HTTP Method 	| Meaning                                  	| Cacheable                                                                                         | Idempotent    | Safe 	|
|-------------	|------------------------------------------	|---------------------------------------------------------------------	                            |------------   |------	|
| GET         	| Reads a resource                         	| Yes                                                                                              	| Yes           | Yes  	|
| PUT         	| Replaces or creates a resource           	| No                                                                  	                            | Yes           | No   	|
| POST        	| Creates a resource or triggers an action 	| Only cacheable if response contains explicit freshness information and matching content-location 	| No         	| No   	|
| PATCH       	| Partially updates a resource             	| Only cacheable if response contains explicit freshness information and matching content-location  | No         	| No   	|

**Idempotent** - Making the same request multiple times has the same effect as making the request once.\
**Safe** - A request will not result in any modification to the server.

## When is a POST or PATCH Response Cached?

The conditions for caching a response to a PATCH request are specified in RFC5789 as follows (and similarly in RFC9110 for POST):[^a][^b]

> A response to this method is only cacheable if it contains explicit freshness information (such as an Expires header or "Cache-Control: max-age" directive) as well as the Content-Location header matching the Request-URI, indicating that the PATCH response body is a resource representation

A response is considered to contain explicit freshness information if it includes either the Expires header field or the `Cache-Control` header with the `max-age` directive.[^c][^d] If both `Expires` and `max-age` are included, the `max-age` directive will take precedence.

The `Expires` header value specifies the date and time when the cached response would no longer be fresh, becoming stale.

```http
Expires: Wed, 30 Mar 2024 08:32:00 GMT
```

The `max-age` value specifies the duration in seconds for which the response will be considered fresh, starting from the time of the initial request.

```http
Cache-Control: max-age=3600
```

TODO: Why does the freshness information bee needed?

The second part of the specification states that the `Content-Location` must match the Request-URI, indicating that the response body is a resource representation. First of all, the `Content-Location` is a header in the response which refers to the location of the created/updated resource and indicates that the body will contain the new resource. A response to a POST request creating a new resource could look like the following example:
```HTTP
HTTP/1.1 201 Created
Content-Location: /my-new-resource
Content-Type: application/json
{
    "title": "New Blog Post",
    "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
}
```
TODO: what is meant that the response body is a resource representation. Why does this need to be the case

The response body is then cached against the `Content-Location` to satisfy future requests. The `Content-Location` must match the Request-URI to prevent the security risk of a response from a mulit-tenant server poisoning the cache of a resource belonging to another owner. In most cases a PUT or POST request’s response isn’t a representation of its URI and so for the majority of the time POST or PUT wouldn't get cached.


## How is a Cached POST and PATCH Response Used?

A cached POST or PATCH response will **only** be used for subsequent GET (or HEAD) requests and notibly not another POST or PATCH. The reason that future POST or PATCH requests cannot use the previously cached response is that these methods are potentially ‘unsafe’ and non-idempotent which means that the request must always be ‘written’ through to the server. In contrast, GET is safe and idempotent so assuming the target resource doesn’t change between making the next request or that having the most uptodate version isn’t necessary, then using the cached response may makes sense.

## Why is PUT not cacheable?

On the surface, PUT seems a better canditate for caching compared to POST and PATCH. It is an idempotent operation, the request contains the contents of the resource and the target URI directly identifies the resource. However, the server can modify the content sent and so the request body may not be what gets stored on the server and there’d also need to be signal from the server to indicate that the request body can be used to cache future GETs or PUTs. Additionally caches betweent the client and server would need to change implementation to buffer PUT request bodies with the chance that a response is received telling it to cache and it needs the response body to form the cache. Therefore the above points make it challenging to implement.

An alternative implementation of HTTP could include the resultant target resouce in the PUT response that could get cached but this consumes extra bandwidth.


In summary, a PUT or PATCH response which contains freshness information and Content-Location equal to its URI will end up being cached and the cached response will only be used for future GET or HEAD requests.

[^a]: https://www.rfc-editor.org/rfc/rfc5789#section-2
[^b]: https://www.rfc-editor.org/rfc/rfc9110#section-9.3
[^c]: https://www.rfc-editor.org/rfc/rfc9111#section-4.2
[^d]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control

