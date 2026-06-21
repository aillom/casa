# API Endpoint Spec: <Endpoint Name>

## Goal

Describe the API behavior and consumer need.

## Route

- Method: GET | POST | PUT | PATCH | DELETE
- Path: `/api/v1/<resource>`
- Auth: public | authenticated | privileged

## Request

- Params:
- Query:
- Body:
- Validation:

## Response

- Success status:
- Response DTO:
- Error model:
- Pagination:

## Contract

- OpenAPI file:
- Generated clients affected:
- Backward compatibility notes:

## Acceptance Criteria

> EARS format with stable ids. Contract and integration tests reference them as `(AC1)`.

- AC1: WHEN a valid request hits the endpoint THE SYSTEM SHALL return the documented success response
- AC2: IF the request is unauthorized THEN THE SYSTEM SHALL return the documented error model
- AC3: WHEN the request fails validation THE SYSTEM SHALL reject it without side effects

## Tests

- Contract tests:
- Integration tests:
- Authorization tests:

## Risks and Questions

- Risk or unknown 1
- Risk or unknown 2
