# OnlineSales — Project Context for Claude Code

## What this is

**VentaOnline** is a full-stack e-commerce web application. Two separate repositories (backend API and Angular frontend) have been merged into a single monorepo for CI/CD deployment.

- **Domain language**: Products, Categories, Users (CLIENT / ADMIN roles), ShoppingCart, Invoices.
- **Language mix**: Spanish comments and variable names appear throughout the original source code.

---

## Repository layout

```
OnlineSales-Front/          ← monorepo root (Claude Code automation lives here)
├── backend/                ← Node.js + Express REST API
│   ├── configs/
│   │   ├── app.js          ← Express app setup, middleware, route mounting
│   │   └── mongoConfig.js  ← Mongoose connection (hardcoded URI — see update-required.md)
│   ├── index.js            ← Entrypoint, listens on port 3200
│   └── src/
│       ├── controllers/    ← user, product, category, shoppingCart
│       ├── models/         ← User, Product, Category, ShoppingCart, Invoice (Mongoose schemas)
│       ├── routes/         ← Express routers (public + private with JWT middleware)
│       ├── services/
│       │   ├── authenticated.js  ← ensureAuth / isAdmin middleware
│       │   └── jwt.js            ← token creation (jwt-simple + moment)
│       └── utils/
│           └── validate.js       ← input validation, bcrypt helpers
├── frontend/               ← Angular SPA (≈ Angular 13, 2022)
│   ├── angular.json        ← Project: "ventaOnline-Front", outputs to dist/venta-online-front
│   └── src/
│       ├── app/
│       │   ├── app.module.ts          ← NgModule-based, imports FormsModule + HttpClientModule
│       │   ├── app-routing.module.ts  ← Routes listed below
│       │   ├── components/            ← home, login, register, navbar, products, view-product, not-found
│       │   ├── guards/
│       │   │   └── user.guard.ts      ← CanActivate; allows CLIENT or ADMIN roles
│       │   ├── models/                ← ProductModel, UserModel (TS classes)
│       │   ├── pipes/
│       │   │   └── search.pipe.ts     ← client-side product search filter
│       │   └── services/
│       │       ├── userRest/          ← register, login, getToken(), getIdentity()
│       │       ├── productRest/       ← full product CRUD + auth header
│       │       └── categoryRest/      ← getCategorys()
│       └── environments/
│           ├── environment.ts         ← baseUrl: http://localhost:3200/
│           └── environment.prod.ts
├── .github/
│   └── workflows/
│       ├── pr-validation.yml   ← runs tests, lint, type-check, secret scan on PRs
│       └── on-merge.yml        ← semver bump, CHANGELOG, git tag, GitHub release, Jira update
├── scripts/                ← Claude Code automation (auto-commit, auto-pr, auto-jira, dashboard)
├── .husky/                 ← pre-commit hooks (Claude Code tooling)
├── package.json            ← Root scripts: husky, auto-commit, auto-pr, auto-jira, dashboard
└── .env.local              ← Local secrets (never committed — gitignored)
```

> ⚠️ **Critical gap**: `frontend/package.json` is missing. The Angular project's `package.json` was not carried over during the merge. The frontend **cannot be installed or built** until a `package.json` is restored. See `update-required.md` for the recommended fix.

---

## Running locally

### Backend

```bash
cd backend
npm install
npm start          # nodemon index.js → http://localhost:3200
```

**Requires**: MongoDB running at `mongodb://127.0.0.1:27017/ventaOnline` (hardcoded in `mongoConfig.js`).

### Frontend

```bash
cd frontend
# package.json is missing — restore it first (see update-required.md)
npm install
npx ng serve       # http://localhost:4200, proxies to backend at :3200
```

---

## API surface

All routes are prefixed with the base path shown.

| Base | Visibility | Endpoints |
|------|-----------|-----------|
| `/user` | Public | `POST /register`, `POST /login` |
| `/user` | CLIENT (JWT) | `PUT /update/:id`, `DELETE /delete/:id` |
| `/user` | ADMIN (JWT) | `POST /saveUser`, `PUT /updateUser/:id`, `DELETE /deleteUser/:id` |
| `/product` | CLIENT (JWT) | `GET /getProducts`, `GET /getProduct/:id`, `POST /searchProduct`, `GET /mostSalesProducts`, `GET /searchProductByCategory/:id` |
| `/product` | ADMIN (JWT) | `POST /saveProduct`, `PUT /updateProduct/:id`, `DELETE /deleteProduct/:id`, `GET /exhaustedProducts` |
| `/category` | (see category routes file) | CRUD for product categories |
| `/shoppingCart` | CLIENT (JWT) | `POST /addToShoppingCart` |

**Auth flow**: Login returns a JWT token. Frontend stores it in `localStorage` under the key `token` and sends it via the `Authorization` header on subsequent requests. Token expires in 3 hours.

**Roles**: `CLIENT` (self-service) and `ADMIN` (full management). Role is embedded in the JWT payload.

---

## Frontend routes

| Path | Component | Guard |
|------|-----------|-------|
| `/` or `/home` | HomeComponent | — |
| `/login` | LoginComponent | — |
| `/register` | RegisterComponent | — |
| `/products` | ProductsComponent | UserGuard (CLIENT or ADMIN) |
| `/viewProduct/:idP` | ViewProductComponent | — |
| `**` | NotFoundComponent | — |

---

## Data models

### User
`name`, `surname`, `username`, `email`, `password` (bcrypt hash), `phone`, `role` (`CLIENT` | `ADMIN`)

### Product
`name`, `description`, `price`, `number`, `stock`, `sales`, `category` (ref → Category)

### Category
`name`, `description`

### ShoppingCart
`user` (ref), `products[]` → `{ product, quantity, subTotal }`, `total`

### Invoice
`date`, `noSerial`, `user` (ref), `nit`, `products[]` → `{ product, quantity, subTotal }`, `total`  
*(Invoice CRUD not yet exposed via the API or frontend.)*

---

## CI/CD (GitHub Actions)

### `pr-validation.yml` — runs on every PR to `main`/`master`
1. Install deps (`npm ci`)
2. `npm test`
3. `npm run lint`
4. `npm run type-check`
5. Secret scan (blocks on hardcoded API keys / GitHub tokens)
6. Debug-code warning (console.log / debugger)

### `on-merge.yml` — runs when a PR is merged to `main`/`master`
1. Tests again on main
2. Detects semver bump from commit messages (`feat:` → minor, `BREAKING CHANGE` → major)
3. Bumps `package.json` version
4. Updates `CHANGELOG.md`
5. Creates a git tag + GitHub Release
6. Comments on and closes linked Jira tickets (reads keys like `PROJ-123` from PR title/branch)

**Required secrets** (set in GitHub repo settings):  
`JIRA_HOST`, `JIRA_EMAIL`, `JIRA_API_TOKEN`

---

## Claude Code automation (root)

The root `package.json` is **not** a backend or frontend package — it is the Claude Code harness:

| Script | Purpose |
|--------|---------|
| `npm run auto-commit` | Automated commit helper |
| `npm run auto-pr` | Automated PR creation |
| `npm run auto-jira` | Jira ticket automation |
| `npm run dashboard` | Development dashboard |
| `npm run prepare` | Installs Husky hooks |

**Do not remove** these scripts, the `.husky/` directory, or the `scripts/` directory — they are part of the Claude Code integration, not the application.

---

## Key known issues

See `update-required.md` for a full prioritized list. Short version:

- `bcrypt-nodejs` is **abandoned** (no updates since 2015) — security risk.
- JWT secret key is **hardcoded** in two source files.
- MongoDB URI is **hardcoded** with no env-var fallback.
- `frontend/package.json` is **missing** — frontend cannot be installed.
- Angular version is approximately **v13 (2022)** — current version is v19 (2026).
