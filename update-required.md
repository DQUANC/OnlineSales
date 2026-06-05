# Update Required

This project was created in **2022**. As of 2026, several dependencies and patterns are deprecated, abandoned, or carry security risks. This document lists everything that needs attention before the application is production-ready.

Items are grouped by severity: 🔴 Critical → 🟠 High → 🟡 Medium → 🟢 Low.

---

## 🔴 Critical — fix before any production deploy

### 1. `bcrypt-nodejs` is abandoned (backend)
- **Package**: `bcrypt-nodejs` (`backend/package.json`)
- **Problem**: No releases since 2015. The maintainer explicitly marks it as unmaintained. Uses synchronous hashing in async functions, blocking the event loop.
- **Fix**: Replace with `bcryptjs` (pure JS, drop-in API) or `bcrypt` (native bindings, faster).
- **Files affected**: `backend/src/utils/validate.js` (encrypt, checkPassword)

```bash
# backend/
npm uninstall bcrypt-nodejs
npm install bcryptjs
```
```js
// validate.js — replace require
const bcrypt = require('bcryptjs');
// bcryptjs.hashSync / compareSync are identical APIs
```

---

### 2. Hardcoded JWT secret key
- **Files**: `backend/src/services/jwt.js:5`, `backend/src/services/authenticated.js:5`
- **Problem**: `const secretKey = 'SecretKeyToExample'` — a static, public, weak secret means any attacker can forge tokens.
- **Fix**: Move to an environment variable and generate a cryptographically strong key.

```js
const secretKey = process.env.JWT_SECRET;
if (!secretKey) throw new Error('JWT_SECRET env var is required');
```

Add `JWT_SECRET=<64-char random hex>` to `.env` (and to the deployment environment).

---

### 3. Hardcoded MongoDB connection URI
- **File**: `backend/configs/mongoConfig.js:7`
- **Problem**: `'mongodb://127.0.0.1:27017/ventaOnline'` is hardcoded. No way to point the app at a different DB (staging, production, Atlas) without editing source code.
- **Fix**:
```js
const uriMongo = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ventaOnline';
```

---

### 4. `frontend/package.json` is missing — frontend cannot be installed
- **Problem**: When the two repos were merged, the Angular project's `package.json` (and `package-lock.json`) was not carried over into `frontend/`. Running `npm install` inside `frontend/` will fail immediately.
- **Fix**: Restore the original Angular 13 `package.json` into `frontend/`, or — preferably — upgrade Angular to the current version and regenerate it (see item #9 below). At minimum, the key deps were:

```json
{
  "dependencies": {
    "@angular/animations": "~13.x",
    "@angular/common": "~13.x",
    "@angular/compiler": "~13.x",
    "@angular/core": "~13.x",
    "@angular/forms": "~13.x",
    "@angular/platform-browser": "~13.x",
    "@angular/platform-browser-dynamic": "~13.x",
    "@angular/router": "~13.x",
    "rxjs": "~7.4.0",
    "sweetalert2": "*",
    "tslib": "^2.3.0",
    "zone.js": "~0.11.4"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "~13.x",
    "@angular/cli": "~13.x",
    "@angular/compiler-cli": "~13.x",
    "typescript": "~4.5.2"
  }
}
```

---

## 🟠 High — security or significant breakage risk

### 5. `jwt-simple` — minimal and potentially unsafe (backend)
- **Package**: `jwt-simple ^0.5.6`
- **Problem**: Last release in 2019. Does not enforce algorithm validation — a client can change the `alg` header to `none` and the library will accept the token (historic JWT none-algorithm attack).
- **Fix**: Replace with `jsonwebtoken` (the community standard, actively maintained).

```bash
npm uninstall jwt-simple
npm install jsonwebtoken
```
```js
// jwt.js
const jwt = require('jsonwebtoken');
exports.createToken = (user) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });

// authenticated.js
const payload = jwt.verify(token, process.env.JWT_SECRET); // throws on invalid/expired
```

---

### 6. `moment.js` — deprecated, large bundle (backend)
- **Package**: `moment ^2.29.1`
- **Problem**: The Moment.js team officially considers it a legacy project in maintenance mode. It is mutable, large (~230 KB), and not tree-shakeable. Used only for `unix()` timestamps in jwt.js and authenticated.js.
- **Fix**: Use native `Date`:
```js
// Replace moment().unix()  →  Math.floor(Date.now() / 1000)
// Replace moment().add(3, 'hour').unix()  →  Math.floor(Date.now() / 1000) + 3 * 3600
```

---

### 7. `body-parser` — standalone use is obsolete (backend)
- **Package**: `body-parser ^1.19.2`
- **Problem**: Since Express 4.16 (2017), `express.json()` and `express.urlencoded()` are built-in. Adding `body-parser` as a separate dependency is redundant.
- **File**: `backend/configs/app.js`
- **Fix**:
```js
// Remove: const bodyParser = require('body-parser');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
```

---

### 8. Deprecated Mongoose connection options (backend)
- **File**: `backend/configs/mongoConfig.js:33`
- **Problem**: `useNewUrlParser: true` has been removed in Mongoose 7+ and passing it throws a warning (or error in strict mode). `mongoose.Promise = global.Promise` is also a no-op since Mongoose 5.
- **Fix**: Remove both deprecated options:
```js
mongoose.connect(uriMongo, {
  connectTimeoutMS: 2500,
  maxPoolSize: 50
});
```

---

## 🟡 Medium — technical debt, outdated patterns

### 9. Angular ~v13 → current is v19 (frontend)
- **Problem**: Angular v13 is from late 2021. As of 2026, Angular is at v19. There are ~6 major versions of migrations, each with breaking changes. Key changes since v13:
  - **v14**: Standalone components (no NgModule required)
  - **v15**: `CanActivateFn` functional guards (class-based `CanActivate` deprecated), `polyfills.ts` removed
  - **v16**: Signals introduced, RxJS interop, Jest support added
  - **v17**: `@if` / `@for` template control flow (replaces `*ngIf`, `*ngFor`), `provideHttpClient()` replaces `HttpClientModule`
  - **v18/v19**: Zoneless change detection, further signal APIs
- **Recommendation**: Use the Angular Update Guide (`update.angular.io`) and migrate one major version at a time. Prioritize at least v16 to get modern patterns.

---

### 10. `HttpClientModule` deprecated (frontend)
- **File**: `frontend/src/app/app.module.ts`
- **Problem**: `HttpClientModule` is deprecated since Angular 17 in favor of `provideHttpClient()` in the application config.
- **Fix** (Angular 17+):
```ts
// app.config.ts
import { provideHttpClient } from '@angular/common/http';
export const appConfig = { providers: [provideHttpClient()] };
```

---

### 11. Class-based `CanActivate` guard deprecated (frontend)
- **File**: `frontend/src/app/guards/user.guard.ts`
- **Problem**: The `CanActivate` interface was deprecated in Angular 15.4 and removed in v16. Modern Angular uses functional route guards.
- **Fix** (Angular 15+):
```ts
// user.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserRestService } from '../services/userRest/user-rest.service';

export const userGuard = () => {
  const userRest = inject(UserRestService);
  const router = inject(Router);
  const identity = userRest.getIdentity();
  if (identity?.role === 'CLIENT' || identity?.role === 'ADMIN') return true;
  return router.parseUrl('/login');
};
```

---

### 12. `nodemon` v2 is outdated (backend)
- **Package**: `nodemon ^2.0.15`
- **Problem**: Nodemon v3 was released in 2023 with Node.js ESM support and bug fixes.
- **Fix**: `npm install -D nodemon@latest` (currently v3.x)

---

### 13. `polyfills.ts` — removed in Angular 15+ (frontend)
- **File**: `frontend/src/polyfills.ts`
- **Problem**: Angular 15 removed `polyfills.ts` and inlined the necessary polyfills in `angular.json`. Having this file causes build confusion.
- **Fix**: When migrating to Angular 15+, delete this file and follow the migration guide to configure polyfills via `angular.json`.

---

### 14. `karma.conf.js` — replaced by Jest in modern Angular (frontend)
- **File**: `frontend/karma.conf.js`
- **Problem**: Karma is officially deprecated as the default Angular test runner since Angular 16. The Angular team recommends Jest.
- **Fix**: When upgrading Angular, use `ng add @angular-devkit/build-angular` or `ng add @angular/build` to switch to Jest-based configuration.

---

### 15. JWT stored in `localStorage` (frontend)
- **Files**: `frontend/src/app/components/login/login.component.ts`, `user-rest.service.ts`
- **Problem**: `localStorage` is accessible by any JavaScript on the page. If the app ever introduces a dependency with an XSS vulnerability, tokens are exposed.
- **Recommendation**: Consider using `httpOnly` cookies for token storage, or at minimum document the XSS mitigation strategy (CSP headers, sanitized inputs).

---

## 🟢 Low — housekeeping

### 16. Typo in `authenticated.js:1`
- `'use strcit'` → `'use strict'` (does not cause a runtime error but the strict mode directive is silently ignored)

### 17. Typo in `jwt.js:14`
- `user.emai` → `user.email` (the `email` field in JWT payload is always `undefined`)

### 18. `cors()` allows all origins (backend)
- **File**: `backend/configs/app.js`
- Using `cors()` with no options allows any origin. For production, lock it down:
```js
app.use(cors({ origin: process.env.ALLOWED_ORIGIN }));
```

### 19. Missing `.env` / `.env.example` for backend
- The backend has no `.env` file or example. Developers have no guide to what environment variables are expected. Create a `backend/.env.example` listing `MONGO_URI`, `JWT_SECRET`, `PORT`.

### 20. Invoice model has no controller or routes
- `backend/src/models/invoice.model.js` exists but there is no controller or route for it. Invoice functionality is incomplete.

### 21. `ShoppingCart` — `addToShoppingCart` is the only endpoint
- No route for viewing or clearing the cart. Frontend does not appear to surface a cart UI yet.

---

## Upgrade order recommendation

1. **Immediately**: Fix items 1–4 (security/critical blockers)
2. **Before first deploy**: Fix items 5–8 (security hygiene)
3. **Sprint 1**: Restore `frontend/package.json`, verify Angular 13 builds and runs
4. **Sprint 2–N**: Angular version migration (one major version per sprint via `ng update`)
5. **Ongoing**: Address medium/low items as sprints allow
