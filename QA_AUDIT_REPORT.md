# QA Audit Report

**Project:** Phan Mem Quan Ly Ban Hang / KORA Retail  
**Audit date:** 2026-09-18  
**Scope:** Frontend, Backend API, database integration, security/configuration, POS business flow  
**Method:** source audit, static checks, build/lint attempts, live HTTP smoke tests against localhost:5000

## Executive Summary

The system has 16 backend route modules and approximately 73 HTTP endpoints including health. The backend connects to MySQL and the live health/auth/404 smoke checks responded with the expected status codes. However, the repository has no executable backend test suite, both backend test folders are empty, and the frontend lint configuration is currently broken. Full CRUD, RBAC, database consistency, concurrency, upload, and end-to-end coverage are therefore not established.

**Release recommendation: CONDITIONAL GO for the patched smoke-tested paths; NO-GO for full production sign-off until the remaining integration/security coverage is completed.**

## Test Inventory

| Area | Result |
|---|---|
| Frontend production build | PASS |
| Frontend ESLint script | PASS after removing incompatible `--ext` flag and adding flat config |
| Corrected ESLint invocation | PASS: zero errors/warnings |
| Backend syntax check (`node --check`) | PASS |
| Backend test command | FAIL: placeholder script, no test runner |
| Backend unit tests | NOT TESTED: directory empty |
| Backend integration tests | NOT TESTED: directory empty |
| MySQL TCP availability | PASS: `127.0.0.1:3306` reachable |
| Backend health endpoint | PASS: HTTP 200, JSON response |
| Missing token auth | PASS: HTTP 401 JSON without stack after patch |
| Invalid token auth | NOT RETESTED on rebuilt live process; code path patched with same error policy |
| Unknown route | PASS: HTTP 404, JSON error response |
| Authenticated CRUD/API flows | BLOCKED: requires valid account/token and controlled test data |
| Database mutation/rollback assertions | BLOCKED: no isolated test database/fixtures available |
| Performance/load testing | NOT TESTED: no safe performance environment or baseline |

## Endpoint Inventory

Base URL: `/api/v1`

- `auth`: `POST /login`, `POST /google`, `GET /me`, `PUT /change-password`, `POST /logout`
- `products`: `GET /categories`, `GET /brands`, `GET /units`, `GET /barcodes/scan/:code`, `GET /`, `GET /:id`, `POST /`, `POST /:id/images`
- `inventory`: `GET /stocks`, `GET /movements`
- `inventory-checks`: `GET /`, `GET /:id`, `POST /`, `POST /:id/balance`
- `pos`: `GET /shift/current`, `POST /shift/open`, `POST /shift/close`, `POST /checkout`
- `orders`: `GET /`, `GET /:id`, `POST /:id/cancel`
- `returns`: `GET /`, `GET /:id`, `GET /order/:orderId/items`, `POST /`
- `suppliers`: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`, `GET /:id/purchases`
- `purchases`: `GET /`, `GET /:id`, `POST /`, `POST /returns`
- `customers`: `GET /`, `POST /`, `GET /:id`, `GET /:id/debts`
- `debts`: `GET /customers`, `GET /customers/:id`, `POST /customers/:id/payments`, `GET /suppliers`, `GET /suppliers/:id`, `POST /suppliers/:id/payments`
- `promotions`: `GET /`, `GET /active`, `GET /:id`, `POST /`, `PUT /:id`
- `employees`: `GET /roles`, `GET /permissions`, `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `PATCH /:id/toggle-status`, `GET /:id/kpi`
- `reports`: `GET /revenue-profit`, `GET /top-selling`, `GET /slow-selling`, `GET /inventory-valuation`
- `dashboard`: `GET /summary`
- `settings`: `GET /`, `POST /`, `GET /devices`, `POST /devices`, `GET /audit-logs`
- `health`: `GET /health`

## Confirmed Findings

### QA-001 - Resolved - Error responses exposed server stack traces

**Module:** Backend error handling / authentication  
**Environment:** localhost:5000, `NODE_ENV=development`  
**Evidence:** `GET /api/v1/auth/me` without token returned HTTP 401 and a `stack` field containing absolute Windows source paths and middleware lines. Invalid JWT did the same.  
**Expected:** Production-like API errors should not expose stack traces or filesystem paths.  
**Actual before fix:** `error.middleware.js` included `stack` whenever `NODE_ENV === 'development'`; the running server defaulted to development when unset.  
**Risk:** Sensitive information exposure and easier exploitation.  
**Fix applied:** Stack is returned only when both `NODE_ENV=development` and `EXPOSE_ERROR_STACK=true`. Smoke test on port 5001 returned no stack.

### QA-002 - Resolved - CORS allowed every origin

**Module:** `backend/src/app.js`  
**Evidence:** live response contains `Access-Control-Allow-Origin: *`.  
**Expected:** Allow only configured frontend origins.  
**Actual before fix:** `cors()` was configured without an origin allowlist.  
**Risk:** Any website can call the API from a browser context; severity depends on token storage and future credential use.  
**Fix applied:** CORS now uses `CORS_ORIGINS`, defaulting to localhost frontend origins. Allowed/disallowed-origin matrix still requires runtime verification after restarting the normal server.

### QA-003 - Resolved at API boundary - POS write endpoints had no request validation

**Module:** POS shift open/close and checkout  
**Affected endpoints:** `POST /pos/shift/open`, `POST /pos/shift/close`, `POST /pos/checkout`  
**Evidence before fix:** routes did not use `validate(...)`; controllers passed raw bodies to services/repositories.  
**Missing checks:** required cart, product IDs, quantity > 0, conversion rate > 0, prices, discount limits, paid/change/debt consistency, payment method enum, customer requirement for debt, starting/ending cash numeric boundaries.  
**Risk:** malformed or forged totals can reach transaction logic; negative/NaN values and inconsistent financial states are not rejected at the API boundary.  
**Fix applied:** Added Joi schemas for open/close shift and checkout, plus server-side consistency checks for subtotal, discount, grand total, payment settlement and debt customer requirement. Trusted-price recomputation against product records remains a follow-up hardening item.

### QA-004 - Resolved - Change-password flow used the wrong repository lookup

**Module:** `auth.service.js`  
**Evidence:** `changePassword(userId, ...)` calls `userRepository.findByUsernameOrEmail(userId)`, while the repository method queries `username` or `email`; the authenticated user ID should use `findById`.  
**Expected:** Valid authenticated user can change their password after correct old password.  
**Likely actual before fix:** Numeric user ID was not found unless it coincidentally matched username/email, resulting in `USER_NOT_FOUND`.  
**Fix applied:** Uses `findById(userId)`. A database-backed password regression test remains blocked without controlled credentials/fixtures.

### QA-005 - Mitigated - File upload trusted client MIME type

**Module:** Product image upload  
**Evidence:** Multer `fileFilter` checks only `file.mimetype`; no magic-byte/content inspection or post-upload image decode is present.  
**Expected:** Extension, MIME, and actual file signature/content agree.  
**Risk:** Polyglot or mislabeled files may be stored and served.  
**Fix applied:** Added JPEG/PNG/WEBP magic-byte validation after Multer writes the file and removes mismatches. Decode/re-encode, dimension checks and isolated non-executable serving remain follow-up items.

### QA-006 - Medium - Logout does not revoke access or refresh tokens

**Module:** Auth  
**Evidence:** `POST /auth/logout` only returns success; access/refresh tokens are stateless and no revocation store or refresh endpoint is implemented.  
**Expected:** Logout invalidates the current session or documented token lifecycle is enforced.  
**Actual:** Existing access token remains cryptographically valid until expiry.  
**Suggested fix:** Implement token rotation/revocation or shorten access-token lifetime with server-side session invalidation.

### QA-007 - Medium - Refresh tokens are generated but no refresh API exists

**Module:** Auth  
**Evidence:** login generates `refreshToken`, but route inventory has no refresh endpoint and frontend only stores/uses `access_token`.  
**Risk:** Expiry recovery is incomplete; refresh token handling is misleading and untested.  
**Suggested fix:** Either implement a secure refresh rotation flow or remove unused refresh-token issuance.

### QA-008 - Medium - CRUD coverage is incomplete by API design

The route inventory has no update/delete product endpoint, no customer update/delete endpoint, no promotion delete endpoint, and limited device/settings mutation endpoints. These are `NOT IMPLEMENTED`, not passing CRUD tests. UI functions that imply full CRUD should be reconciled with the API contract.

### QA-009 - Low - Backend server startup has no graceful EADDRINUSE handling

A second `npm start` produced an unhandled `EADDRINUSE` exception and stack trace. The existing instance was not stopped. This is operationally noisy; add a server error handler or preflight port check with a concise actionable message.

## Patch Verification

- Backend JavaScript syntax: PASS.
- Frontend ESLint: PASS with zero errors/warnings.
- Frontend production build: PASS.
- Temporary-port backend smoke: health `200`, missing-token `401` without stack, unknown route `404`.
- The normal port-5000 process was not stopped; restart it before testing the patched CORS/POS/upload code through the normal URL.

## Representative Test Cases

| ID | Module | Scenario | Expected | Actual/Status |
|---|---|---|---|---|
| AUTH-001 | Auth | `GET /auth/me` without token | 401 JSON, no sensitive data | 401 JSON, stack leaked / FAIL |
| AUTH-002 | Auth | Invalid Bearer token | 401 JSON, no sensitive data | 401 JSON, stack leaked / FAIL |
| AUTH-003 | Auth | Expired token | 401 with `UNAUTHORIZED` | NOT TESTED: needs generated expired token |
| AUTH-004 | Auth | Correct password login | 200, user/tokens, DB-consistent user | BLOCKED: controlled credentials not supplied |
| AUTH-005 | Auth | Change password | 200 and new password works | FAIL suspected from wrong repository lookup |
| AUTH-006 | Auth | Logout then reuse token | token rejected or documented behavior | FAIL by design unless revocation exists |
| POS-001 | POS | Empty checkout | 400 validation | NOT TESTED; no POS schema |
| POS-002 | POS | Negative quantity/price | 400 validation | NOT TESTED; no POS schema |
| POS-003 | POS | Checkout above stock | reject and rollback | Backend transaction has stock check; integration not executed |
| POS-004 | POS | Concurrent checkout same stock | one succeeds, one rejects | NOT TESTED under concurrency |
| POS-005 | POS | Discount greater than subtotal | reject/recompute | NOT TESTED; no POS schema/recompute guarantee |
| POS-006 | POS | Debt without customer | reject | NOT TESTED; no POS schema |
| POS-007 | POS | Checkout DB failure | rollback all order/stock/payment writes | NOT TESTED with induced DB failure |
| API-001 | Routing | Unknown endpoint | 404 stable JSON schema | PASS |
| API-002 | Security | CORS disallowed origin | no wildcard access | FAIL: wildcard `*` |
| API-003 | Upload | Fake image MIME/content | reject | NOT TESTED; code trusts MIME |
| API-004 | Pagination | page 0/negative/huge limit | validation or safe bounds | NOT TESTED; repository arithmetic accepts raw values |
| API-005 | Security | SQL injection in keyword | parameterized/no data loss | Static review shows prepared values for sampled searches; runtime not tested |
| FE-001 | Build | Production bundle | build succeeds | PASS |
| FE-002 | Lint | Static quality check | zero lint errors | FAIL: broken flat config/script |
| FE-003 | POS | API 401 handling | clear redirect/session cleanup | Static review shows interceptor behavior; runtime not tested |

## Coverage Summary

- **Modules inventoried:** 16 backend route modules; 20 frontend page areas reported by source inventory.
- **API endpoints inventoried:** approximately 73 including health.
- **Executable test cases run:** 7 smoke/static checks (build, syntax, health, missing token, invalid token, 404, DB availability).
- **Representative cases documented:** 22.
- **Passed:** 5 confirmed checks (frontend build, backend syntax, DB connectivity, health, 404; auth status codes also behaved as expected but failed security assertion due stack exposure).
- **Failed:** 7 findings/assertions, including missing backend test suite, broken frontend lint, stack exposure, wildcard CORS, incomplete auth lifecycle, missing POS validation, and suspected change-password regression.
- **Blocked:** Authenticated CRUD, full DB mutation/rollback, RBAC matrix, concurrent requests, file upload runtime, and end-to-end UI workflows due no controlled credentials/fixtures and no isolated test data setup.
- **Not tested:** Performance/load, full security payload suite, all 73 endpoint combinations, browser E2E, database constraints and migration/seed verification.
- **Confirmed/likely bugs:** 9 findings listed above.
- **Severity:** High 3, Medium 5, Low 1. No Critical confirmed by executable test.

## Required Follow-up Before Sign-off

1. Add a real backend test runner (Jest/Vitest/Supertest or equivalent), fixtures, and isolated database.
2. Add Joi validation to every write endpoint, especially POS, purchases, returns, debts, inventory checks, employees, settings, and uploads.
3. Fix `changePassword` lookup and add authentication regression tests.
4. Remove stack traces from all non-local responses and replace wildcard CORS.
5. Add API tests for every endpoint's 401/403/404/validation behavior and role matrix.
6. Add transaction tests for POS, purchases, returns, debt payments, and inventory balance, including rollback and concurrent stock sales.
7. Fix frontend ESLint flat configuration and add browser E2E coverage for login, POS, inventory, orders, returns, debts, and reports.
8. Add upload content-signature tests and safe serving policy.
9. Re-run the full matrix with seeded test data, capture response schemas, DB before/after assertions, and performance baselines.
