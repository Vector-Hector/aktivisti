# API Endpoints (REST Guideline)

While the word REST API creates a common understanding over some principles, it can mean different things in practice. Some companies or people ignore some requirements or add some to the principle. Instead of arguing what the _True Meaning™_ of a REST-API is we define our API endpoint critereas down on this document.

<!-- TOC -->
- [General](#general)
- [Documentation](#documentation)
- [Responses](#responses)
  - [Results](#results)
  - [Errors](#errors)
  - [Property Naming](#property-naming)
  - [Response Codes](#response-codes)
- [Routing](#routing)
  - [Resource routing](#resource-routing)
  - [Resource Route Naming](#resource-route-naming)
  - [Trailing slashes](#trailing-slashes)
  - [RPC-styled endpoints](#rpc-styled-endpoints)
  - [Versioning](#versioning)
- [Embedding resources](#embedding-resources)
- [Pagination](#pagination)
<!-- /TOC -->

## General

Some general principles that should apply to every endpoint:

* [Statelessness](https://en.wikipedia.org/wiki/Representational_state_transfer#Statelessness)
* [Uniform Interface](https://en.wikipedia.org/wiki/Representational_state_transfer#Uniform_interface), but WITHOUT HATEOAS
* [Respect HTTP Method semantics](https://en.wikipedia.org/wiki/Representational_state_transfer#Relationship_between_URI_and_HTTP_methods)
* Request and response payloads are always and only JSON (application/json), except the implemented endpoint follows a stricter standard

## Documentation

Every endpoint must be fully documented using [OpenAPI / Swagger specification](https://swagger.io/specification/)

## Responses

### Results

The requested resource payload needs to be enveloped into a `data` property. That enables us to carry along metadata.

Example:
```
{
    data: {} or [],
    embedded: {}
    pagination: {}
    [..]
}
```

### Errors

The payload of the message should look like this:
```
{
    code: 'a_constant_without_whitespace',
    message: "A human readable message",
    additional: {
        an optional dictionary of additional error information
    }
}
```

The string in `code` should be a constant of the server code base.

### Property Naming

Property names of the responses payload must be in CamelCase.

Example:
```
{
    data: {
        id: 42,
        mimeType: 'image/jpeg',
    }
}
```

### Response Codes

Each response must have an appropriate [status code](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes).

In particular errors have to return the most specific [status code](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes) and shall not use generic `400 Bad Request` or `500 Internal Server Error` codes.

## Routing

### Resource routing

Nested resources shall not be reflected in Urls

```
❌ /v1/{resourceName}/{:id}/{relatedResource}/{:id}
```

Instead relations are described in the payload with a `primary key`

```
✅ GET /v1/{resourceName}/42
{
    data: {
        id: 42,
        nestedResourceId: 65,
        [..]
    }
}
✅ GET /v1/{relatedResource}/65
{
    data: {
        id: 65,
        [..]
    }
}
```

If for perfomance reasons multiple HTTP calls to resolve relations are unfeasable refer to [embedding](#embedding-resources)

### Resource Route Naming

Resource route names must use the plural form of the resource.
Resource route names must use lowercase separate words with hyphens for path Segments.

Example:
```
/v1/photos/1
/v1/photo-collections/31
```

### Trailing slashes

Routes should generally _never_ have a required trailing slash.
```
❌ GET /v1/{resourceName}/
❌ GET /v1/{resourceName}/{:id}/
✅ GET /v1/{resourceName}
✅ GET /v1/{resourceName}/{:id}
```

### RPC-styled endpoints

Sometimes we need HTTP calls, that do something not strictly REST related, like an action. Good example is a email verification link.
In this case it is allowed to break the rest pattern, but be sure to choose a route which is not conflicting with an actual REST route.

### Versioning

API endpoints should be versioned with an URI prefix like `/v1/`. This is not necessary if the front and the backend are tightly coupled and deployed together.

API versioning is a must if third-party clients are expected or already involved.

## Embedding resources

Sometimes you need to request related resources. If they are a lot and especially if the transport protocol needs a whole TCP roundtrip for a connection (<=HTTP/1.1) it makes sense to request all of them in one call. For performance upgrade you should embed these resources. Under all circumstances resources need to remain consistent, so embedding them directly into the related resource is bad.

```
❌ GET /v1/photos/42
{
    data: {
        id: 42,
        author: {
            id: 23,
            name: 'Jochen'
        }
    }
}
```

You should instead add a `embed` query parameter making the related resource available in the `embedded` property of the response.
The P
```
✅ GET /v1/photos/42?embed=author
{
    data: {
        id: 42,
        author: 23
    },
    embedded: {
        author: [
            {
                id: 23,
                name: "Jochen"
            }
        ]
    }
}
```

## Pagination

To limit the results to a reasonable amount per request we use pagination. Pagination should be enabled for every list endpoint per default, with a reasonable default limit depending on the payload size per resource item.

The query params `offset` and `limit` should control the pagination mechanism.

Example:

```
✅ GET /v1/photos?offset=10&limit=10
{
    data: [
        { ten items },
    ],
    pagination: {
        offset: 10,
        limit: 10,
        total: 242
    }
}
```

Note that the order of the response needs to be _consistent_. The endpoint is _never_ allowed to order the result randomly. If there is no ordering options on client side, at least a default ordering needs to be in place.

The offset defines the number of items skipped, the limit the amount of items returned. Total count of items are in `total`.

Pagination parameters exceeding the total should result in an _empty list_ not an error!

```
✅ GET /v1/photos?offset=243&limit=20
{
    data: [],
    pagination: {
        offset: 243,
        limit: 20,
        total: 242
    }
}
```
```
✅ GET /v1/photos?offset=243&limit=20
{
    data: [{
        only one item   
    }],
    pagination: {
        offset: 241,
        limit: 20,
        total: 242
    }
}
```

Exceeding the allowed `limit` should result in an error. The allowed limit is dependent on the endpoint and needs to be set to a reasonable value. This limit needs to be documented in the OpenAPI documentation.

```
// assuming maximum limit ist 100
✅ GET /v1/photos?offset=10&limit=101
// response code is 400
{
    code: 'request_limit_exceeded',
    message: "Requested limit of 101 is not allowed, maximum item limit is 100"
}
```
