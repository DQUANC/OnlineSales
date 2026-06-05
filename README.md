# VentaOnline

A full-stack e-commerce web application. Users can register, log in, browse products by category, search, and add items to a shopping cart. Admins can manage products, categories, and users.

> ⚠️ This project has known security and dependency issues. See [`update-required.md`](./update-required.md) for the full prioritized list before any production deploy.

---

## 🗂️ Monorepo structure

```
├── backend/     Node.js + Express REST API, MongoDB/Mongoose
├── frontend/    Angular ~13 SPA
├── scripts/     Claude Code automation (auto-commit, auto-pr, auto-jira, dashboard)
└── .github/     CI/CD workflows (PR validation, on-merge release)
```

---

## 🛠️ Tech stack

| Layer | Tech |
|---|---|
| **Backend** | Node.js, Express 4.22, Mongoose 6.13 (MongoDB), JWT auth (`jsonwebtoken`), `bcryptjs` |
| **Frontend** | Angular ~13, TypeScript, SweetAlert2 |
| **CI/CD** | GitHub Actions — PR validation → semver release → Jira update |

---

## 🚀 Getting started (local dev)

**Prerequisites**: Node.js 18+, MongoDB running locally

### Backend

```bash
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm start                 # http://localhost:3200
```

### Frontend

> ⚠️ `frontend/package.json` is currently missing — see item #4 in [`update-required.md`](./update-required.md) before running these commands.

```bash
cd frontend
npm install
npm start                 # http://localhost:4200
```

---

## 🔑 Environment variables

| Variable | Required | Description | Example |
|---|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string | `mongodb://127.0.0.1:27017/ventaOnline` |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `PORT` | No | API server port | `3200` |
| `CORS_ORIGIN` | No | Allowed CORS origin in production | `https://myapp.com` |

Create a `backend/.env` file (gitignored) with these values. A `backend/.env.example` template is planned — see [`update-required.md`](./update-required.md) item #19.

---

## 🔌 API overview

All routes are mounted under the path shown.

| Route group | Visibility | Description |
|---|---|---|
| `POST /user/register`, `POST /user/login` | Public | Auth |
| `/product/*` | CLIENT (read), ADMIN (write) | Product CRUD |
| `/category/*` | CLIENT/ADMIN | Category CRUD |
| `/shoppingCart/*` | CLIENT (JWT) | Cart management |

**Auth flow**: Login returns a JWT (3-hour expiry). The frontend stores it in `localStorage` and sends it via the `Authorization` header. Roles: `CLIENT` and `ADMIN`.

Full route details are in [`CLAUDE.md`](./CLAUDE.md).

---

## ⚙️ CI/CD

| Trigger | Actions |
|---|---|
| PR opened to `master` | Install deps, run tests, lint, type-check, secret scan |
| PR merged to `master` | Auto-bump semver, update CHANGELOG, create GitHub Release, close linked Jira tickets |

Required GitHub secrets: `JIRA_HOST`, `JIRA_EMAIL`, `JIRA_API_TOKEN`.

---

## 📋 Pending upgrades

See [`update-required.md`](./update-required.md) for the full prioritized list. Key pending item: Angular v13 → v19 migration.
