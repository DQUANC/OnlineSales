# Changes Log

Tracks all implementation work done from `update-required.md`. Items are referenced by their number from that file.

---

## 2026-06-05

### 🔴 Critical — Items 1–4

#### Item 1 — Replace `bcrypt-nodejs` with `bcryptjs`
- **File**: `backend/src/utils/validate.js`
- `require('bcrypt-nodejs')` → `require('bcryptjs')`
- Switched from `bcrypt.hashSync(password)` to `bcryptjs.hashSync(password, 10)` (explicit salt rounds)
- `bcrypt.compareSync` → `bcryptjs.compareSync` (identical API)
- Removed: `bcrypt-nodejs` from `backend/package.json`
- Added: `bcryptjs ^2.4.3` to `backend/package.json`
- Status: ✅ Done

#### Item 2 — JWT secret moved to environment variable
- **Files**: `backend/src/services/jwt.js`, `backend/src/services/authenticated.js`
- Hardcoded `'SecretKeyToExample'` removed from both files
- Secret now read from `process.env.JWT_SECRET`
- App throws at startup if `JWT_SECRET` is not set (fail-fast)
- Status: ✅ Done

#### Item 3 — MongoDB URI moved to environment variable
- **File**: `backend/configs/mongoConfig.js`
- Hardcoded `'mongodb://127.0.0.1:27017/ventaOnline'` replaced with `process.env.MONGO_URI`
- App throws at startup if `MONGO_URI` is not set
- Removed deprecated `mongoose.Promise = global.Promise` (no-op since Mongoose 5)
- Removed deprecated `useNewUrlParser: true` option (removed in Mongoose 7)
- Status: ✅ Done

#### Item 4 — Restore `frontend/package.json`
- **File**: `frontend/package.json` (created)
- Restored Angular 13 package.json so the frontend can be installed and built
- Includes `sweetalert2` (used in products.component.ts)
- Status: ✅ Done

---

### 🟠 High — Items 5–8

#### Item 5 — Replace `jwt-simple` with `jsonwebtoken`
- **Files**: `backend/src/services/jwt.js`, `backend/src/services/authenticated.js`
- `jwt-simple` removed; `jsonwebtoken ^9.0.2` added
- `jwt.encode(payload, secret)` → `jwt.sign(payload, secret, { expiresIn: '3h' })`
- Manual `moment().unix()` expiry check removed — `jsonwebtoken.verify()` handles it
- `jwt.decode(token, secret)` → `jwt.verify(token, secret)` (validates signature + expiry)
- Error handling updated to distinguish `TokenExpiredError` (401) from invalid token (403)
- Status: ✅ Done

#### Item 6 — Remove `moment.js`
- **Files**: `backend/src/services/jwt.js`, `backend/src/services/authenticated.js`
- `moment` removed from both files and from `backend/package.json`
- Replaced with `jsonwebtoken`'s built-in `expiresIn` option (no manual unix timestamps needed)
- Status: ✅ Done

#### Item 7 — Remove standalone `body-parser`
- **File**: `backend/configs/app.js`
- `const bodyParser = require('body-parser')` removed
- `bodyParser.urlencoded(...)` → `express.urlencoded({ extended: false })`
- `bodyParser.json()` → `express.json()`
- `body-parser` removed from `backend/package.json`
- Status: ✅ Done

#### Item 8 — Fix deprecated Mongoose connection options
- **File**: `backend/configs/mongoConfig.js`
- `useNewUrlParser: true` removed
- `mongoose.Promise = global.Promise` removed
- Status: ✅ Done (done together with Item 3)

---

### 🟢 Low — Items 16, 17, 18, 19

#### Item 16 — Typo: `'use strcit'` → `'use strict'`
- **File**: `backend/src/services/authenticated.js:1`
- Status: ✅ Done

#### Item 17 — Typo: `user.emai` → `user.email`
- **File**: `backend/src/services/jwt.js:14`
- Status: ✅ Done

#### Item 18 — CORS restricted to env-configured origin
- **File**: `backend/configs/app.js`
- `cors()` (all origins) → `cors({ origin: process.env.CORS_ORIGIN || '*' })`
- Defaults to `*` if not set (preserves dev experience); production must set `CORS_ORIGIN`
- Status: ✅ Done

#### Item 19 — `backend/.env.example` created
- **File**: `backend/.env.example` (created)
- Documents all required and optional env vars: `MONGO_URI`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`
- Added `.env` to `backend/.gitignore`
- Status: ✅ Done

#### `dotenv` added to backend
- `dotenv@16.6.1` added to `backend/package.json` dependencies
- `require('dotenv').config()` added to `backend/index.js` (first line, before anything else)
- Status: ✅ Done

#### Item 12 — `nodemon` v2 → v3 (pulled in during audit fix)
- `nodemon@3.1.14` installed (was 2.0.15)
- Resolved 3 high severity ReDoS vulnerabilities in `simple-update-notifier` chain
- Status: ✅ Done

#### Bonus — `express` and `mongoose` upgraded via `npm audit fix`
- `express`: 4.17.3 → 4.22.2 (patched `path-to-regexp` ReDoS, `cookie`, `send`, `serve-static`, `qs` vulns)
- `mongoose`: 6.2.7 → 6.13.9 (patched MongoDB driver auth data leakage vulnerability)
- **Final state**: `npm audit` reports 0 vulnerabilities

---

## Pending (not yet implemented)

| # | Item | Reason deferred |
|---|------|----------------|
| 9 | Angular v13 → v19 migration | Multi-sprint work; requires incremental upgrades per major version |
| 10 | `HttpClientModule` → `provideHttpClient()` | Requires Angular 17+ (depends on item 9) |
| 11 | Class-based guard → functional guard | Requires Angular 15+ (depends on item 9) |
| 13 | Remove `polyfills.ts` | Requires Angular 15+ migration |
| 14 | `karma` → Jest | Requires Angular 16+ migration |
| 15 | JWT in `localStorage` → httpOnly cookies | Architectural decision needed |
| 20 | Invoice controller + routes | Feature work |
| 21 | Shopping cart view/clear endpoints | Feature work |
