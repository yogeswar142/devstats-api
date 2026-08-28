# DevStats API 🚀

**DevStats API** is a high-performance, portfolio-quality backend microservice built with **Node.js**, **TypeScript**, and **Fastify**. It serves as a unified statistics aggregator specifically designed for [yogeswar.me](https://yogeswar.me), fetching, transforming, and serving developer metrics from platforms such as **GitHub** and **LeetCode**.

---

## 🏗 Architecture

```text
                               yogeswar.me
                                    │
                                    │ GET /api/v1/stats
                                    ▼
                            ┌───────────────┐
                            │  DevStats API │
                            └───────┬───────┘
                                    │
                              StatsService
                                    │
                          Promise.allSettled()
                             /             \
                            ▼               ▼
                   GitHubProvider     LeetCodeProvider
                    (TTLCache)           (TTLCache)
                   /          \         /          \
                 HIT          MISS    HIT          MISS
                  │            │       │            │
                  ▼            ▼       ▼            ▼
               Return       GitHub  Return       LeetCode
               Cached        REST   Cached       GraphQL
```

---

## ✨ Features

- **Provider Pattern Architecture**: Decoupled, isolated integrations for external developer platforms (GitHub, LeetCode, extensible to Codeforces & WakaTime).
- **Parallel Concurrent Fetching**: Uses `Promise.allSettled()` to fetch provider statistics simultaneously without blocking.
- **Partial Failure Resilience**: If one platform API is temporarily down, the unified endpoint still returns available data with HTTP 200 OK and safe error metadata. Returns 503 Service Unavailable only if all providers fail.
- **In-Memory TTL Caching**: High-performance generic `TTLCache<T>` layer reducing response latency from **~700ms down to ~6ms** (100x speedup).
- **Type-Safe Domain Isolation**: Raw external DTOs are mapped into clean, stable internal domain schemas. Upstream API changes will never break frontend contracts.
- **Automated Testing Suite**: 100% offline unit and integration tests powered by **Vitest** (20 passing test cases).
- **Zod Environment Validation**: Strict environment schema parsing at server startup preventing invalid runtime configurations.

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v20+)
- **Framework**: Fastify 4
- **Language**: TypeScript 5 (Strict ESM / NodeNext)
- **Validation**: Zod
- **Testing**: Vitest
- **HTTP Engine**: Native Fetch API with `AbortSignal.timeout()`

---

## 📍 API Endpoints

### 1. Health Check
```http
GET /health
```
**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "devstats-api",
  "timestamp": "2026-08-28T17:15:21.712Z",
  "uptime": 12.4
}
```

### 2. GitHub Statistics
```http
GET /api/v1/github
```
*Optional Query Param:* `?username=yogeswar142` (Defaults to `GITHUB_USERNAME` env)

**Response (200 OK):**
```json
{
  "username": "yogeswar142",
  "name": "Yogeswar",
  "avatarUrl": "https://avatars.githubusercontent.com/u/232150593?v=4",
  "profileUrl": "https://github.com/yogeswar142",
  "publicRepos": 21,
  "followers": 10,
  "following": 7,
  "totalStars": 23,
  "totalForks": 2,
  "languages": {
    "TypeScript": 7,
    "Python": 3,
    "Kotlin": 2,
    "JavaScript": 2
  },
  "repositories": [
    {
      "name": "Zenlock",
      "description": "Privacy-first Android focus tool...",
      "url": "https://github.com/yogeswar142/Zenlock",
      "stars": 3,
      "forks": 0,
      "language": "Kotlin",
      "updatedAt": "2026-05-20T06:56:31Z"
    }
  ]
}
```

### 3. LeetCode Statistics
```http
GET /api/v1/leetcode
```
*Optional Query Param:* `?username=Yogeswar142` (Defaults to `LEETCODE_USERNAME` env)

**Response (200 OK):**
```json
{
  "username": "Yogeswar142",
  "totalSolved": 48,
  "easySolved": 37,
  "mediumSolved": 10,
  "hardSolved": 1,
  "ranking": 2771138,
  "contestRating": null,
  "contestGlobalRanking": null
}
```

### 4. Unified Statistics (Primary Portfolio Endpoint)
```http
GET /api/v1/stats
```
**Response (200 OK):**
```json
{
  "github": {
    "username": "yogeswar142",
    "totalStars": 23,
    "publicRepos": 21
  },
  "leetcode": {
    "username": "Yogeswar142",
    "totalSolved": 48,
    "easySolved": 37,
    "mediumSolved": 10,
    "hardSolved": 1
  },
  "lastUpdated": "2026-08-28T18:08:57.333Z"
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation
```bash
# Clone the repository
git clone https://github.com/yogeswar142/devstats-api.git
cd devstats-api

# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your environment variables in `.env`:
```env
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

GITHUB_CACHE_TTL_MS=600000
LEETCODE_CACHE_TTL_MS=600000

GITHUB_USERNAME=yogeswar142
LEETCODE_USERNAME=Yogeswar142
GITHUB_TOKEN=
```

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start development server with live reload (`tsx watch`) |
| `npm run typecheck` | Run strict TypeScript compiler verification without emitting |
| `npm run build` | Transpile TypeScript code into `dist/` |
| `npm run start` | Run compiled production server |
| `npm test` | Run complete Vitest test suite |
| `npm run test:watch` | Run Vitest in interactive watch mode |

---

## 🧪 Testing

Run the Vitest test suite:
```bash
npm test
```
**Test Results:**
```text
 ✓ src/providers/github/github.mapper.test.ts (3 tests)
 ✓ src/common/cache/ttl-cache.test.ts (5 tests)
 ✓ src/providers/leetcode/leetcode.mapper.test.ts (4 tests)
 ✓ src/services/stats.service.test.ts (4 tests)
 ✓ src/routes/routes.test.ts (4 tests)

 Test Files  5 passed (5)
      Tests  20 passed (20)
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.