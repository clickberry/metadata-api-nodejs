# Dockerized Metadata API
Arbitrary JSON metadata API micro-service on Node.js (used for Video Projects).

* [Architecture](#architecture)
* [Technologies](#technologies)
* [Environment Variables](#environment-variables)
* [API](#api)
* [License](#license)

# Architecture
The application is a REST API with database (Redis) dependency.

# Technologies
* Node.js
* Redis/node_redis
* Express.js

# Environment Variables
The service should be properly configured with following environment variables.

Key | Value | Description
:-- | :-- | :-- 
REDIS_ADDRESS | redis.yourdomain.com | Redis server address.
REDIS_PORT | 6379 | Redis server port.
TOKEN_ACCESSSECRET | MDdDRDhBOD*** | Access token secret.
TOKEN_RELATIONSECRET | RkY5MTREMz*** | Relation token secret.
MAX_JSON_SIZE | 10240 | Maximum JSON size in bytes.

# API

## GET /{id}
Gets metadata by id.

### Response
| HTTP       | Value     |
|------------|-----------|
| StatusCode | 200       |
| Body       | { "id": *id*, ... } |

## POST /{id}
Adds metadata for object id.

### Request
| Header   | Value |
|----------|-------------|
| Authorization     | JWT [accessToken] |
| Content-Type      | application/json |

| Query String   | Value |
|----------|-------------|
| relation_token     | JWT [relationToken] with payload: { id: *object_id*, ownerId: *user_id* } |

| Body    | Description |
|----------|-------------|
| JSON | Arbitraty JSON object <= 10KB      |

### Response
| HTTP       | Value     |
|------------|-----------|
| StatusCode | 200       |
| Body       | { "id": *id*, ... } |

## PUT /{id}
Updates metadata.

### Request
| Header   | Value |
|----------|-------------|
| Authorization     | JWT [accessToken] |
| Content-Type      | application/json |

| Query String   | Value |
|----------|-------------|
| relation_token     | JWT [relationToken] with payload: { id: *object_id*, ownerId: *user_id* } |

| Body    | Description |
|----------|-------------|
| JSON | Arbitraty JSON object <= 10KB      |

### Response
| HTTP       |  Value                                                             |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                                |
| Body       | { "id": *id*, ... } |

## DELETE /{id}
Deletes metadata.

### Request
| Header   | Value |
|----------|-------------|
| Authorization     | JWT [accessToken] |

| Query String   | Value |
|----------|-------------|
| relation_token     | JWT [relationToken] with payload: { id: *object_id*, ownerId: *user_id* } |

### Response
| HTTP       |  Value                                                             |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                                |

# License
Source code is under GNU GPL v3 [license](LICENSE).
