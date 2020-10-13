## Description

An HTTP server exposing an API endpoint (`/` path) for validating fibonacci sequence data.

The main component providing the logic of this service is the [fibonacci-stream-validator](libs/fibonacci-stream-validator) library. It is a [Transform stream](https://nodejs.org/docs/latest/api/stream.html#stream_class_stream_transform) initialized with the previous 2 values from the Fibonacci sequence, it uses them as a base to validate an incoming sequence.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Usage

```bash
$ curl http://localhost:3000/ \
	-X POST \
	-H 'content-type: application/json' \
	-H 'accept: application/json' \
	-d '[{ "n": 1 }, { "n": 1 }, { "n": 2 }, { "n": 3 }, { "n": 5 }]'

# Output:
# [
# 	{ "n": 1, "valid": true },
# 	{ "n": 1, "valid": true },
# 	{ "n": 2, "valid": true },
# 	{ "n": 3, "valid": true },
# 	{ "n": 5, "valid": true }
# ]

$ curl http://localhost:3000/?prev=1\&prev=1 \
	-X POST \
	-H 'content-type: application/json' \
	-H 'accept: application/json' \
	-d '[{ "n": 2 }, { "n": 3 }, { "n": 5 }]'

# Output:
# [
# 	{ "n": 2, "valid": true },
# 	{ "n": 3, "valid": true },
# 	{ "n": 5, "valid": true }
# ]

$ curl http://localhost:3000/?prev=1\&prev=2 \
	-X POST \
	-H 'content-type: application/json' \
	-H 'accept: application/json' \
	-d '[{ "n": 2 }, { "n": 3 }, { "n": 5 }]'

# Output:
# [
# 	{ "n": 2, "valid": false },
# 	{ "n": 3, "valid": false },
# 	{ "n": 5, "valid": false }
# ]
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
