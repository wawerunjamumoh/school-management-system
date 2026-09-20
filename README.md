# School Management System API

A multi-school NestJS API for school verification, role-aware dashboards, and secure student-result access. The platform supports a global super admin and school-scoped members: `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`, and `GUARDIAN`. A school must be verified before its members can sign in.

## Getting started

```bash
npm install
npm run start:dev
```

The API listens on `http://localhost:3000` by default.

The local database connection is configured in `src/app.module.ts`. Before deployment, move credentials to environment variables, set strong `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` values, use migrations, and set TypeORM `synchronize` to `false`.

## Authentication

Protected routes require an access token:

```http
Authorization: Bearer <accessToken>
```

Access tokens last 15 minutes; refresh tokens last 7 days.

### School member login

`POST /auth/login`

Members sign in using their school code, school-specific identifier, and password. The school must be `VERIFIED` and the membership must be active.

```bash
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"schoolCode":"GREENHILL","identifier":"STU-0001","password":"your-password"}'
```

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "membership": {
    "id": "membership-uuid",
    "schoolId": "school-uuid",
    "role": "STUDENT"
  }
}
```

### Super-admin login

`POST /auth/super-admin/login`

```bash
curl -X POST http://localhost:3000/auth/super-admin/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

The account must have the `SUPER_ADMIN` platform role.

### Refresh a session

`POST /auth/refresh`

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"<refresh-token>"}'
```

## Super-admin school management

All routes in this section require a super-admin access token.

### List schools

`GET /admin/schools`

```bash
curl http://localhost:3000/admin/schools \
  -H 'Authorization: Bearer <super-admin-access-token>'
```

### Register a school

`POST /admin/schools`

New schools are created as `PENDING` and must be verified before member login is permitted.

```bash
curl -X POST http://localhost:3000/admin/schools \
  -H 'Authorization: Bearer <super-admin-access-token>' \
  -H 'Content-Type: application/json' \
  -d '{"schoolName":"Greenhill Academy","schoolCode":"GREENHILL","location":"Nairobi","schoolPhone":"+254700000000","schoolEmail":"office@greenhill.example"}'
```

### Verify or suspend a school

`PATCH /admin/schools/:schoolId/verification`

```bash
curl -X PATCH http://localhost:3000/admin/schools/<school-id>/verification \
  -H 'Authorization: Bearer <super-admin-access-token>' \
  -H 'Content-Type: application/json' \
  -d '{"status":"VERIFIED"}'
```

Use `SUSPENDED` to prevent future school-member logins.

## Dashboard and results

These routes require a school-member access token. Results are returned only when their exam is published.

### Role-aware dashboard

`GET /dashboard`

```bash
curl http://localhost:3000/dashboard \
  -H 'Authorization: Bearer <access-token>'
```

The response is role-specific:

- `STUDENT`: student profile and published results.
- `GUARDIAN`: linked children and each child’s published results.
- School staff: school student, enrollment, and published-exam counts.

### Student results

`GET /students/:studentId/results`

```bash
curl http://localhost:3000/students/<student-id>/results \
  -H 'Authorization: Bearer <access-token>'
```

Students can access only their own results. Guardians can access results only for students with an active guardian-student link. Staff access is constrained to their authenticated school.

## Errors and validation

All request bodies are validated. Unknown fields are rejected.

| Status | Meaning |
| --- | --- |
| `400` | Invalid or missing request data. |
| `401` | Missing, expired, malformed, or invalid credentials/token. |
| `403` | Authenticated user lacks the required role, school scope, or guardian/student relationship. |
| `404` | Requested school, student, profile, or resource was not found. |

## Current API status

The authentication, super-admin school, dashboard, and published-result APIs above are implemented. Other generated CRUD controllers under `src/modules` are scaffolding and should not yet be treated as production-ready persistence endpoints.

## Checks

```bash
npm run build
npm run lint
npm run test
```

## HTTP request collection

Use [test/api.http](test/api.http) with the JetBrains HTTP Client or VS Code REST Client to exercise every implemented endpoint documented above. Update the variables at the top of the file with seeded user credentials and resource UUIDs before sending requests. The named login requests pass their returned tokens automatically to subsequent requests.
