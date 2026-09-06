# API Testing Fundamentals (Postman / RestAssured)

## Core checks for every endpoint

- Status code correctness (2xx success, 4xx client error, 5xx server error)
- Response schema validation (required fields, types, nullability)
- Response time thresholds (flag anything regressing past a baseline, e.g. p95 > 500ms)
- Idempotency for GET/PUT/DELETE; correct behavior on repeated calls

## Common edge cases

- Missing/expired auth token → expect 401, not 500
- Malformed JSON body → expect 400 with a useful error message
- Pagination boundaries (page 0, last page, page beyond range)
- Rate limiting behavior (429 with `Retry-After` header)

## RestAssured example

```java
given()
  .header("Authorization", "Bearer " + token)
.when()
  .get("/api/users/42")
.then()
  .statusCode(200)
  .body("id", equalTo(42))
  .time(lessThan(500L));
```
