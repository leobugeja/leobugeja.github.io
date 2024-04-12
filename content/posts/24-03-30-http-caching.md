---
title: "HTTP Cacheability: Why POST and PATCH Can, but PUT Can’t"
subtitle: ""
date: 2024-03-30
slug: http-method-cacheability
thumbnail: /images/browser_cache_mini.png
headerimage: /images/browser_cache.png
---

When learning about HTTP caching, it was unclear to me how POST or PATCH methods could be cached given that they modify the state of the server, what was meant that they are "only cacheable if response contains explicit freshness information and matching content-location" and why other similar methods such as PUT aren't cacheable. Hopefully this article will bring some light on these questions.

## What is HTTP Cacheability?
A HTTP method is considered cacheable when a response to the request can be stored and used to fulfil future requests instead of making the request to the server again.

The caching of a response depends on several factors, including the type of cache (private or shared), the way the cache is implemented (such as browser-specific behaviour), the HTTP request method, the response’s status code, and the response’s headers. The response may be stored in a private cache that is tied to the client (e.g. in the browser) or in a shared cache located between the client and server (e.g. a Proxy or CDN).

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

A response is considered to contain explicit freshness information if it includes either the `Expires` header field or the `Cache-Control` header with the `max-age` directive.[^c][^d] If both `Expires` and `max-age` are included, the `max-age` directive will take precedence.

The `Expires` header value specifies the date and time when the cached response would no longer be fresh or in other words become stale.

```http
Expires: Wed, 30 Mar 2024 08:32:00 GMT
```

The `max-age` value as part of the `Cache-Control` header, specifies the duration in seconds for which the response will be considered fresh, starting from the time of the initial request.

```http
Cache-Control: max-age=3600
```

The second part of the specification states that the `Content-Location` must match the request URI indicating that the response body is a resource representation. The `Content-Location` is a header in the HTTP response which refers to the location of the created/updated resource.

A response body being a *resource representation* means that it would be returned for a
GET request made to the same target resource. Therefore this response body can be cached against the `Content-Location` to satisfy future GET requests.

A response to a POST request creating a new resource could resemble the following:

```HTTP
HTTP/1.1 201 Created
Content-Location: /my-new-blog-post
Content-Type: application/json
{
    "title": "New Blog Post",
    "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
}
```

For security reasons, the `Content-Location` must match the request URI to avoid a response from one resource poisoning the cache of another resource.

One last note is that resources created or modified by a POST request are often located in a different location to the request URI. This means that in many cases, POST and PATCH responses are not cached.

## How is the Cached Response Used?

When a POST or PATCH response is cached, it can **only** be used for subsequent GET or HEAD requests and not for subsequent POST or PATCH requests. A GET request with the same path as the cached response in `Content-Location` will use the cached resource, provided it is still fresh and that the request doesn't have the `no-cache` directive.

```HTTP
Cache-Control: no-cache
```

POST and PATCH requests cannot use cached resources because these methods are unsafe and non-idempotent. This means that the request must always be sent to the server to ensure that modifications are applied.

This is in contrast to GET which is a safe and idempotent method. Therefore, assuming that the target resource has not changed since it was cached, there is no need to request the resource from the server.

## Why is PUT not cacheable?

Like the POST and PATCH methods, PUT is unsafe. This means that it must always send the request to the origin server. However, there is still the question of why a PUT response couldn't be used to satisfy a future GET request to the same resource, as implemented for POST and PATCH responses.

The most obvious reason is that PUT responses do not return a representation of the resource in the response body (though this could be added to the spec). Alternatively, the *request* body seems like it could be cached as a representation of the resource. However, the server can modify the contents sent by a PUT request, so the request body may not be an accurate representation of the resource.

While PUT responses are not cacheable, a successful PUT request will invalidate existing cached resources for the same target URI.[^e] This means that when a subsequent GET request is made for the same target URI, it will have to be sent to the server to retrieve the newly modified resource.

## Summary

To summarize, when a POST or PATCH response includes freshness information and the `Content-Location` matches its URI, the response will get cached. However, these cached responses can only be used for future GET or HEAD requests. Lastly though the PUT method is not cacheable, it can still invalidate other cached responses.

[^a]: https://www.rfc-editor.org/rfc/rfc5789#section-2
[^b]: https://www.rfc-editor.org/rfc/rfc9110#section-9.3
[^c]: https://www.rfc-editor.org/rfc/rfc9111#section-4.2
[^d]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
[^e]: https://www.rfc-editor.org/rfc/rfc9110#section-9.3.4

