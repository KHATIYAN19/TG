# Target Trek — Developer Guide

Target Trek (https://www.targettrek.in) is a career-prep platform for software engineers in India. One codebase runs
several products:

| Product | What it is | Frontend path | Backend prefix |
|---|---|---|---|
| **Books / Ebooks** | Paid technical ebooks (HLD, LLD, AWS, Docker, Git, SQL, GenAI…), bundles, all-books membership | `/books`, `/book/*` | `/book`, `/payment/books`, `/api/book-offers`, `/api/membership` |
| **Mock interviews & mentorship** | Book a paid slot with an interviewer | `/mock-interviews`, `/mentorship` | `/api/interviews` |
| **Prep Buddy Arena** | Paid matching of study buddies, real-time chat (WebSocket) | `/prep-buddy` | `/api/arena`, `ws://…/ws/arena` |
| **Resume Lab** | AI + human resume / LinkedIn review, resume builder, vault, ATS checker | `/resume-review` | `/api/resume` |
| **Referrals** | Members refer each other into companies, chat, monthly subscriptions | `/referral` | `/api/referral`, `ws://…/ws/referral` |
| **Memories** | Paid personalised pages (birthday, proposal, sorry…) with photos/videos | `/memories`, `/m/:code` | `/api/memories` |
| **Content** | Blogs (with an AI blog-draft agent), interview experiences, free resources | `/blogs`, `/interviews`, `/resources` | `/blogs`, `/api/interview` |
| **Admin / partners / affiliates** | Admin console, partner revenue dashboard, affiliate dashboard, campaigns, analytics, invoices, finance | `/admin/*`, `/partners`, `/dashboard` | `/api/admin/*`, `/api/partner`, `/api/affiliate` |

---

## Table of contents

1. [Tech stack](#1-tech-stack)
2. [Repository layout](#2-repository-layout)
3. [Getting started (local setup)](#3-getting-started-local-setup)
4. [Environment variables — backend](#4-environment-variables--backend)
5. [Environment variables — frontend](#5-environment-variables--frontend)
6. [Architecture](#6-architecture)
7. [Authentication and roles](#7-authentication-and-roles)
8. [Payments](#8-payments)
9. [Email](#9-email)
10. [File storage](#10-file-storage)
11. [Background jobs and cron endpoints](#11-background-jobs-and-cron-endpoints)
12. [Rate limits and security](#12-rate-limits-and-security)
13. [SEO, prerendering and Vercel functions](#13-seo-prerendering-and-vercel-functions)
14. [Testing](#14-testing)
15. [Scripts](#15-scripts)
16. [Deployment](#16-deployment)
17. [Conventions and gotchas](#17-conventions-and-gotchas)
18. [Command cheat sheet](#18-command-cheat-sheet)

---

## 1. Tech stack

**Backend** (`backend/`) — Node.js (ES modules), Express 5, MongoDB via Mongoose 8, Upstash Redis (REST) for rate
limits, locks and counters, `ws` for WebSockets, Zod for validation, JWT + bcrypt for auth. Integrations: Cashfree,
Razorpay, PayU, Gumroad, Amazon S3 / SES / SQS / CloudFront, Cloudinary, Mailtrap, Resend, OpenAI, Google Gemini,
Anthropic Claude, Google Sign-In, Meta Conversions API. PDFs are generated with `@react-pdf/renderer`; media is
processed with `sharp` and `ffmpeg-static`.

**Frontend** (`client/`) — React 18, Vite 5, React Router 7, Redux Toolkit (auth state), Tailwind CSS 3, Framer
Motion, React Hook Form + Zod, Recharts (admin charts), Quill editor (blogs), react-pdf. Hosted on **Vercel**, which
also runs small serverless functions in `client/api/` for SEO pages, sitemap, RSS and `llms.txt`.

**Hosting** — backend on **Google Cloud Run** (`asia-south2`), frontend on **Vercel**, database on **MongoDB Atlas**,
Redis on **Upstash**. Scheduled jobs are triggered by **Google Cloud Scheduler**.

---

## 2. Repository layout

```
TG/
├── README.md                ← this file
├── SECURITY.md              ← vulnerability reporting + incident runbook (CERT-In / DPDP)
├── backend/
│   ├── index.js             ← Express app: middleware order, every route mount, background jobs, WebSockets
│   ├── RATE_LIMITS.md       ← every rate limit / lock and the env var that tunes it
│   ├── .env.example         ← partial example (see section 4 for the full list)
│   ├── config/              ← auth.js (JWT/OTP/lock settings), urls.js, invoice.js, cashfree.js, razorpay.js, analyticsRedis.js
│   ├── Middleware/          ← auth, rate limiters, budgets (Redis counters), body limits, input sanitising, image checks
│   ├── routes/              ← one router per feature (arena/, memory/, resume/, referral/ subfolders)
│   ├── controllers/         ← request handlers (arena/, books/, memory/, partner/, referral/, resume/)
│   ├── models/              ← Mongoose schemas (analytics/, arena/, memory/, partner/, referral/, resume/)
│   ├── services/            ← business logic
│   │   ├── payments/        ← central payment processor (README.md inside) + gateways/
│   │   ├── mail/            ← mail queue (SQS), worker, provider settings, templates
│   │   ├── storage/s3.js    ← presigned upload/download URLs, optional CloudFront signing
│   │   ├── arena/ memory/ resume/ referral/ membership/ partner/ campaign/ invoice/ blogAgent/ …
│   ├── utils/               ← MailSender, redis client, dbConnection, cloudinary, payu, razorpay, limits, phone…
│   ├── templates/           ← legacy HTML email templates
│   ├── assets/fonts/        ← fonts for PDF invoices / resumes
│   ├── scripts/             ← one-off maintenance scripts (section 15)
│   └── tests/               ← node:test suites (section 14)
└── client/
    ├── index.html           ← SPA shell (Meta pixel, fonts…)
    ├── vite.config.js
    ├── vercel.json          ← rewrites to prerendered pages / API functions, security headers, CSP (report-only)
    ├── api/                 ← Vercel serverless functions (SEO pages, sitemap, robots, rss, llms.txt)
    ├── scripts/
    │   ├── gen-seo-data.mjs ← extracts SEO text from page components → api/_seo-data.json (runs before build)
    │   └── prerender.mjs    ← renders content pages to dist/prerendered/*.html (runs after build)
    └── src/
        ├── App.jsx          ← all routes, maintenance gate, admin guard
        ├── main.jsx / prerender-entry.jsx
        ├── Redux/           ← store + authSlice
        ├── lib/             ← authSession (silent token refresh), analytics, Meta pixel, Google Ads, Clarity, consent
        ├── utils/Url.js     ← BASE_URL of the backend (VITE_BASE_URL)
        ├── payment/         ← gatewayConfig.js (which gateway the UI names)
        ├── config/businessInfo.js ← legal / grievance-officer details for legal pages
        ├── maintenance/     ← env-driven maintenance mode
        ├── Admin/           ← admin console screens
        ├── arena/ resume/ referral/ memories/ partner/ blog/ Ebooks/ resources/ hld/ sql/ auth/ component/ …
```

---

## 3. Getting started (local setup)

### Prerequisites

- **Node.js 20+** (the team currently uses Node 26) and npm
- A **MongoDB** connection string (Atlas dev cluster recommended). Some flows (Prep Buddy Arena) use
  **transactions**, which need a replica set. On a standalone local `mongod`, set `ARENA_NO_TRANSACTIONS=true`.
- An **Upstash Redis** database (free tier is enough for development) — the server will not start without it.
- Optional, per feature: payment gateway **sandbox** keys, AWS keys, Cloudinary, mail provider, OpenAI key.

### 1. Clone and install

```bash
git clone <repo-url> TG && cd TG
cd backend && npm install
cd ../client && npm install
```

### 2. Backend `.env`

Create `backend/.env` (it is git-ignored). Minimum to boot:

```env
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
JWT_SECRET=<at least 32 random characters — openssl rand -hex 32>
UPSTASH_REDIS_REST_URL=https://<your-db>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5001
COOKIE_SECURE=false            # local http only; never false in production
MAIL_DISABLE_SEND=true         # optional: never send real email while developing
```

Add more variables from [section 4](#4-environment-variables--backend) as you work on a feature (payments, uploads,
AI, mail…). **Ask a lead for dev/sandbox credentials — never use production keys locally.**

### 3. Frontend `.env`

Create `client/.env`:

```env
VITE_BASE_URL=http://localhost:5001
VITE_PAYMENT_GATEWAY=cashfree
```

### 4. Run

```bash
# terminal 1 — backend on http://localhost:5001 (auto-restarts on file changes)
cd backend && npm run dev            # production-style: npm start

# terminal 2 — frontend on http://localhost:5173
cd client && npm run dev
```

See the [command cheat sheet](#18-command-cheat-sheet) for every command.

Backend health check: `GET http://localhost:5001/health`.

In development the backend accepts any `localhost` / `127.0.0.1` port through CORS, so Vite hopping to 5174 is fine.

### 5. Become an admin locally

Sign up normally on `/signup`, then in your **dev** database set that user's `role` to `"admin"`
(`users` collection). Admin, partner, affiliate and employee accounts receive an emailed one-time code on a new device,
so either configure a mail provider or read the code from the server logs / database while developing.

### 6. Production build of the frontend

```bash
cd client && npm run build     # gen-seo-data → vite build → prerender
npm run preview
npm run lint
```

---

## 4. Environment variables — backend

All backend configuration comes from `backend/.env` locally and from **Cloud Run environment variables** in
production. Values are read at runtime with `process.env`; most are optional and have safe defaults.

> **Never commit real values.** `.env` files are git-ignored. If a secret is ever pushed, rotate it immediately
> (see `SECURITY.md`).

Legend: **Req** = server refuses to start without it. Default = value used when unset.

### 4.1 Core / server

| Variable | Req | Default | Description |
|---|---|---|---|
| `MONGO_URI` | ✅ | — | MongoDB connection string. |
| `JWT_SECRET` | ✅ | — | Signs access tokens. **Min 32 chars.** Also the fallback for `UNSUBSCRIBE_SECRET` and `MEMORY_PIN_SECRET`. Changing it signs everyone out. |
| `UPSTASH_REDIS_REST_URL` | ✅ | — | Upstash Redis REST URL (rate limits, locks, counters, analytics). |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | — | Upstash Redis REST token. |
| `FRONTEND_URL` | ✅ | `https://www.targettrek.in` | Public site URL. Used in emails, payment return URLs, CORS and S3 CORS. |
| `BACKEND_URL` | | `https://tg-540700086743.asia-south2.run.app` | Public URL of this backend. Used for gateway callbacks/webhooks and unsubscribe links. **Must be public** for Cashfree/PayU returns. |
| `NODE_ENV` | | `development` | `production` disables localhost CORS origins. |
| `PORT` | | `5001` | HTTP port (Cloud Run sets this itself). |
| `CORS_ORIGINS` | | — | Extra allowed origins, comma separated. `targettrek.in` and `www.targettrek.in` are always allowed. |
| `PUBLIC_SITE_URL` | | — | Site URL used when the blog agent builds internal links. |
| `K_SERVICE` | | (set by Cloud Run) | Detects Cloud Run; analytics timers then rely on Cloud Scheduler instead of in-process timers. |
| `ANALYTICS_FORCE_TIMERS` | | `false` | `true` = run analytics timers in-process even on Cloud Run. |

### 4.2 Authentication and accounts (`config/auth.js`)

| Variable | Default | Description |
|---|---|---|
| `JWT_EXPIRES_IN` | `15m` | Access-token lifetime (`ms` format: `15m`, `1h`). |
| `REFRESH_TOKEN_TTL_DAYS` | `7` | Refresh cookie / device session lifetime. |
| `TRUSTED_DEVICE_TTL_DAYS` | `30` | How long a device stays trusted (no OTP) for privileged accounts. |
| `OTP_TTL_MINUTES` | `10` | One-time code validity. |
| `PASSWORD_SETUP_TTL_MINUTES` | `60` | Password-setup link validity. |
| `MAX_OTP_ATTEMPTS` | `5` | Wrong codes allowed per code. |
| `MAX_LOGIN_ATTEMPTS` | `5` | Wrong passwords in a row before the account locks. |
| `ACCOUNT_LOCK_MINUTES` | `15` | Lock duration for admin / affiliate / employee / partner. |
| `USER_LOCK_MINUTES` | `1440` | Lock duration for normal members (24 h). |
| `LOGIN_IP_FAIL_LIMIT` | `30` | Failed logins per IP per day before the IP is locked. |
| `LOGIN_OTP_ENABLED` | `false` | `true` = members and affiliates also need an emailed code on login. |
| `BCRYPT_ROUNDS` | `12` | Password hashing cost. |
| `COOKIE_SECURE` | `true` | Set `false` **only** for local http. |
| `GOOGLE_CLIENT_ID` | — | Google OAuth Web client ID. Must equal the client's `VITE_GOOGLE_CLIENT_ID`. Empty = Google sign-in disabled. |

### 4.3 Payments (`services/payments/config.js`)

Gateway selection: `<PRODUCT>_PAYMENT_GATEWAY` → `PAYMENT_GATEWAY` → `cashfree`. Test vs live always follows the keys
(`CASHFREE_ENV`, `PAYU_MODE`, `rzp_test_` / `rzp_live_` prefix), so the mode can never disagree with the keys.

| Variable | Default | Description |
|---|---|---|
| `PAYMENT_GATEWAY` | `cashfree` | Global gateway: `cashfree` \| `razorpay` \| `payu`. |
| `BOOKS_PAYMENT_GATEWAY` | — | Per-product override (any product name works: `BOOKS`, `ARENA`, `MEMORIES`, `RESUME`, `REFERRAL`, …). |
| `ARENA_PAYMENT_GATEWAY` | — | Override for Prep Buddy Arena. |
| `MEMORIES_PAYMENT_GATEWAY` | — | Override for Memories (legacy alias: `MEMORY_PAYMENT_GATEWAY`). |
| `RESUME_PAYMENT_GATEWAY` / `REFERRAL_PAYMENT_GATEWAY` | — | Overrides for Resume Lab / Referrals. |
| `SUBSCRIPTION_PAYMENT_GATEWAY` | (normal gateway) | Gateway for **new** monthly subscriptions: `razorpay` \| `cashfree`. Existing subscriptions stay on their own gateway. |
| `REFERRAL_SUBSCRIPTION_PAYMENT_GATEWAY` | — | Per-product subscription override. |
| `CASHFREE_APP_ID` | — | Cashfree app ID (alias `CASHFREE_CLIENT_ID`). |
| `CASHFREE_SECRET_KEY` | — | Cashfree secret (alias `CASHFREE_CLIENT_SECRET`). Also verifies Cashfree webhooks. |
| `CASHFREE_ENV` | `sandbox` | `sandbox` \| `production`. |
| `CASHFREE_API_VERSION` | `2025-01-01` | Cashfree PG API version. |
| `CASHFREE_SUBSCRIPTION_API_VERSION` | = `CASHFREE_API_VERSION` | Cashfree subscriptions API version. |
| `CASHFREE_WEBHOOK_TOLERANCE_SEC` | `86400` | Max webhook age; `0` disables the age check. |
| `RAZORPAY_KEY_ID` | — | `rzp_test_…` or `rzp_live_…`. |
| `RAZORPAY_KEY_SECRET` | — | Razorpay secret. |
| `RAZORPAY_WEBHOOK_SECRET` | — | Verifies Razorpay webhooks. |
| `PAYU_KEY` | — | PayU merchant key (alias `PAYU_MERCHANT_KEY`). |
| `PAYU_SALT` | — | PayU salt (alias `PAYU_MERCHANT_SALT`). |
| `PAYU_MODE` | `test` | `test` \| `production`. (`PAYU_ENV` is read by the legacy order-mail sender.) |
| `PAYMENT_FALLBACK_PHONE` | — | 10-digit phone sent to Cashfree/PayU when an account has a foreign number. |
| `GUMROAD_ACCESS_TOKEN` | — | Gumroad token for international Memories purchases (redeemed by order number + email). |
| `GUMROAD_SALES_URL` | `https://api.gumroad.com/v2/sales` | Only for testing against a mock. |
| `MEMORY_ALLOW_MOCK_PAYMENTS` | `false` | **Dev only**: adds a fake "test payment" gateway to Memories. |

### 4.4 Email (`utils/MailSender.js`, `services/mail/*`)

The active provider is chosen by an admin at `/admin/mail`; `MAIL_PROVIDER` is only the default.

| Variable | Default | Description |
|---|---|---|
| `MAIL_PROVIDER` | `mailtrap` | `mailtrap` \| `resend` \| `ses`. |
| `MAILTRAP_TOKEN` | — | Mailtrap API token (aliases: `MAILTRAP_API_TOKEN`, `MAILTRAP_API_KEY`, `MAILTRAP_SENDING_TOKEN`). |
| `RESEND_API_KEY` | — | Resend API key. |
| `RESEND_FROM` | `Target Trek <no-reply@targettrek.in>` | Resend sender. |
| `AMAZON_ACCESS_KEY_ID` | — | AWS key for SES, SQS and S3 (alias `AWS_ACCESS_KEY_ID`). |
| `AMAZON_SECRET_ACCESS_KEY` | — | AWS secret (alias `AWS_SECRET_ACCESS_KEY`). |
| `AMAZON_REGION` | — | e.g. `ap-south-1` (aliases `AMAZON_SES_REGION`, `AWS_REGION`). |
| `AMAZON_SESSION_TOKEN` | — | Only for temporary credentials (alias `AWS_SESSION_TOKEN`). |
| `AMAZON_SES_FROM_EMAIL` | `no-reply@targettrek.in` | SES sender address. |
| `AMAZON_SES_FROM_NAME` | `Target Trek` | SES sender name. |
| `AMAZON_SES_CONFIGURATION_SET` | — | SES configuration set (bounce/complaint tracking). |
| `SQS_EMAIL_QUEUE_NAME` | — | **Setting this turns background email ON.** Empty = send directly. |
| `SQS_EMAIL_QUEUE_URL` | — | Full queue URL (skips the name lookup). |
| `SQS_EMAIL_DLQ_NAME` | (from redrive policy) | Dead-letter queue name. |
| `SQS_REGION` | = `AMAZON_REGION` | Queue region. |
| `MAIL_WORKER_ENABLED` | `true` | `false` = this process only enqueues; run a worker elsewhere. |
| `MAIL_WORKER_POLLERS` | `2` | Parallel SQS pollers. |
| `MAIL_WORKER_RATE_PER_SEC` | `10` | Send rate; keep below your SES limit. |
| `MAIL_MAX_ATTEMPTS` | `5` | Retries when the queue has no DLQ. |
| `MAIL_QUEUE_ENABLED` | `true` | `false` = bypass the queue entirely. |
| `MAIL_DISABLE_SEND` | `false` | `true` = never contact a provider (tests, dry runs). |
| `ADMIN_MAIL` | — | Address that receives admin notifications (interview bookings, etc.). |
| `INTERVIEW_ORGANIZER_EMAIL` | — | Organizer address on interview calendar invites. |
| `UNSUBSCRIBE_SECRET` | = `JWT_SECRET` | Signs unsubscribe links in campaign email. |
| `PROMO_MAIL_REF` | `lkh` | Referral code appended to links in promo mail. |
| `EBOOK_EMAIL_MAX_ATTACHMENT_MB` | `7` | Ebooks larger than this are emailed as links, not attachments. |

### 4.5 Storage — S3, CloudFront, Cloudinary

| Variable | Default | Description |
|---|---|---|
| `S3_BUCKET_NAME` | — | Private bucket for uploads, books, invoices, memory media. |
| `S3_REGION` | = `AMAZON_REGION` | Bucket region. |
| `S3_KEY_PREFIX` | — | Optional key prefix (e.g. `prod` → `prod/uploads/...`). |
| `S3_UPLOAD_URL_TTL_SECONDS` | `300` | Presigned upload URL lifetime. |
| `S3_DOWNLOAD_URL_TTL_SECONDS` | `300` | Presigned download URL lifetime. |
| `MEDIA_CDN_DOMAIN` | — | Optional CloudFront domain in front of the bucket. |
| `MEDIA_CDN_KEY_PAIR_ID` | — | CloudFront public key ID. |
| `MEDIA_CDN_PRIVATE_KEY` | — | Matching PEM private key (`\n` accepted). |
| `CLOUDINARY_CLOUD_NAME` | — | Cloudinary (images, legacy book PDFs, blog covers). |
| `CLOUDINARY_API_KEY` | — | |
| `CLOUDINARY_API_SECRET` | — | |

IAM for the AWS key: `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on the bucket; SES send; and for SQS
`SendMessage`, `ReceiveMessage`, `DeleteMessage`, `ChangeMessageVisibility`, `GetQueueUrl`, `GetQueueAttributes` on
the main queue **and** the DLQ. Browser uploads need bucket CORS — see `scripts/setS3Cors.mjs`.

### 4.6 AI (blog agent, Resume Lab, contact replies)

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | — | OpenAI key (blog agent, Resume Lab, contact-reply drafts). |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Only for testing against a mock server. |
| `OPENAI_MODEL` | `gpt-4.1-mini` | Blog agent text model (must support the Responses API + web search). |
| `OPENAI_MODEL_RESEARCH` / `_PLANNER` / `_WRITER` / `_CHECKER` | = `OPENAI_MODEL` | Per-stage overrides for the blog agent. |
| `OPENAI_SEARCH_TOOL` | `web_search` | Use `web_search_preview` on older accounts. |
| `OPENAI_IMAGE_MODEL` | `gpt-image-1-mini` | Blog cover image model. |
| `OPENAI_IMAGE_QUALITY` | `low` | Cover image quality. |
| `OPENAI_IMAGE_SIZE` | `1536x1024` | Cover image size. |
| `OPENAI_IMAGE_FALLBACKS` | — | Comma-separated fallback image models (e.g. `dall-e-3`). |
| `OPENAI_MODEL_CONTACT_REPLY` | `gpt-4o-mini` | Model that drafts replies to contact-form messages. |
| `BLOG_AGENT_CRON_SECRET` | — | Secret for the daily blog-agent cron (**24+ chars**). |
| `BLOG_AGENT_HOURLY_LIMIT` | `12` | Live generations per admin per hour. |
| `RESUME_AI_MODEL` | `gpt-4.1` | OpenAI model for Resume Lab until an admin picks one in the console. |
| `RESUME_AI_PIPELINE` | `on` | `off` = single-pass review instead of the multi-agent pipeline. |
| `RESUME_AI_MAX_REVISIONS` | `2` | Reviser passes (0–2). |
| `RESUME_AI_MAX_TOKENS` | `30000` | Token cap per review call. |
| `GEMINI_API_KEY` | — | Enables Gemini models in Resume Lab. |
| `GEMINI_BASE_URL` | Google default | Mock/testing only. |
| `ANTHROPIC_API_KEY` | — | Enables Claude models in Resume Lab. |
| `ANTHROPIC_BASE_URL` | `https://api.anthropic.com` | Mock/testing only. |
| `USD_INR_RATE` | `85` | Only for the "≈ ₹ per review" hint in the admin screen. |

### 4.7 Memories

| Variable | Default | Description |
|---|---|---|
| `MEMORIES_SITE_URL` | `${FRONTEND_URL}/memories` | Base URL used in Memories emails. |
| `MEMORY_PAGE_LIFETIME_DAYS` | `30` | How long a page stays live. |
| `MEMORY_PIN_SECRET` | = `JWT_SECRET` | Key used to encrypt page PINs. |
| `MEMORY_MEDIA_URL_TTL_SECONDS` | `3600` | Photo/video link lifetime. |
| `MEMORY_PIN_LIMIT` | `10` | Wrong-PIN tries per visitor per page per 15 min. |
| `MEMORY_PIN_PAGE_LIMIT` | `60` | Wrong-PIN tries per page per hour. |
| `MEMORY_VIEW_LIMIT`, `MEMORY_UPLOAD_LIMIT`, `MEMORY_EVENT_LIMIT`, `MEMORY_QUOTE_LIMIT`, `MEMORY_ANSWER_LIMIT`, `MEMORY_REPLY_LIMIT`, `MEMORY_CODE_LIMIT`, `MEMORY_CODE_CLAIM_LIMIT`, `MEMORY_EMAIL_RESEND_LIMIT`, `MEMORY_REFERRAL_LIMIT`, `MEMORY_CASHOUT_LIMIT`, `MEMORY_TICKET_LIMIT`, `MEMORY_TICKET_REPLY_LIMIT` | 120, 100, 120, 240, 30, 20, 10, 30, 20, 40, 5, 8, 40 | Per-user/IP budgets (see `routes/memory/memoryRoutes.js`). |

### 4.8 Prep Buddy Arena

| Variable | Default | Description |
|---|---|---|
| `ARENA_NO_TRANSACTIONS` | `false` | `true` for a standalone local `mongod` (no replica set). |
| `ARENA_CHAT_DAILY_LIMIT` | `2000` | Chat messages per member per day. |
| `ARENA_SIGNUP_ATTEMPT_LIMIT` / `ARENA_SIGNUP_IP_ATTEMPT_LIMIT` | `10` / `10` | Sign-up code attempts per email / IP per day. |
| `ARENA_RESET_ATTEMPT_LIMIT` / `ARENA_RESET_IP_ATTEMPT_LIMIT` | `5` / `5` | Password-reset attempts per email / IP per day. |
| `ARENA_REQ_HOURLY_LIMIT`, `ARENA_REQ_DAILY_LIMIT`, `ARENA_REQ_PER_TARGET_LIMIT` | 10, 30, 3 | Buddy requests. |
| `ARENA_WITHDRAW_DAILY_LIMIT`, `ARENA_RESPOND_DAILY_LIMIT` | 15, 60 | |
| `ARENA_BLOCK_DAILY_LIMIT`, `ARENA_REPORT_DAILY_LIMIT`, `ARENA_BUG_DAILY_LIMIT` | 10, 10, 5 | |
| `ARENA_PROFILE_HOURLY_LIMIT` | 20 | |
| `ARENA_CHECKOUT_HOURLY_LIMIT`, `ARENA_VERIFY_HOURLY_LIMIT`, `ARENA_RECONCILE_HOURLY_LIMIT`, `ARENA_CANCEL_DAILY_LIMIT` | 10, 30, 20, 5 | Payment flow budgets. |
| `ARENA_COUPON_HOURLY_LIMIT` | 30 | |
| `ARENA_ACCOUNT_DELETE_DAILY_LIMIT` | 10 | |
| `ARENA_CHAT_EDIT_HOURLY_LIMIT`, `ARENA_CHAT_REACT_HOURLY_LIMIT` | 60, 300 | |

### 4.9 Resume Lab and Referrals limits

| Variable | Default |
|---|---|
| `RESUME_SUBMIT_LIMIT` / `RESUME_VIEW_LIMIT` | 20 / 120 |
| `RESUME_BUILDER_LIMIT` / `RESUME_BUILDER_AI_LIMIT` / `RESUME_BUILDER_PDF_LIMIT` | 120 / 10 / 40 |
| `REFERRAL_VIEW_LIMIT` / `REFERRAL_WRITE_LIMIT` / `REFERRAL_ASK_LIMIT` / `REFERRAL_MSG_LIMIT` | 120 / 60 / 20 / 300 |

### 4.10 Public endpoint budgets (`Middleware/publicBudgets.js`, per IP)

| Variable | Default |
|---|---|
| `PAY_CREATE_HOURLY_LIMIT` / `PAY_CREATE_DAILY_LIMIT` | 20 / 100 |
| `PAY_VERIFY_HOURLY_LIMIT` / `PAY_STATUS_LIMIT` | 60 / 60 per 10 min |
| `COUPON_VALIDATE_LIMIT` / `COUPON_LIST_LIMIT` | 30 / 60 per 10 min |
| `BOOKING_CREATE_HOURLY_LIMIT` / `BOOKING_CREATE_DAILY_LIMIT` | 10 / 30 |
| `BOOKING_STEP_HOURLY_LIMIT` / `BOOKING_STATUS_LIMIT` | 40 / 120 per 10 min |
| `PUBLIC_FORM_DAILY_LIMIT` | 15 |
| `REVIEW_LINK_HOURLY_LIMIT` | 20 |
| `BLOG_VIEW_LIMIT` | 60 per 10 min |

See `backend/RATE_LIMITS.md` for the full explanation of every limit.

### 4.11 Analytics, marketing, cron secrets

| Variable | Default | Description |
|---|---|---|
| `ANALYTICS_ACTIVE_SECONDS` | `60` | Window for "active now" visitors. |
| `ANALYTICS_IP_SALT` | — | Salt for hashing visitor IPs (set a random value). |
| `ANALYTICS_CRON_SECRET` | — | Secret for `/internal/analytics/maintenance`. |
| `INTERVIEW_CRON_SECRET` | — | Secret for `/api/interviews/maintenance/cleanup`. |
| `INTERVIEW_IP_HASH_SALT` | — | Salt for hashing IPs on interview-experience submissions. |
| `META_CAPI_ACCESS_TOKEN` | — | Meta Conversions API token. Empty = server-side Purchase events off. |
| `META_PIXEL_ID` | pixel in `client/index.html` | Meta pixel ID. |
| `META_TEST_EVENT_CODE` | — | Sends events to Meta's "Test events" tab only. |
| `META_GRAPH_VERSION` | `v21.0` | Graph API version. |

### 4.12 Invoices (`config/invoice.js`)

| Variable | Default | Description |
|---|---|---|
| `INVOICE_SELLER_NAME` | `Target Trek` | Trade name. |
| `INVOICE_PROPRIETOR` | (owner's name) | Proprietor. |
| `INVOICE_SELLER_ADDRESS` | (registered address) | Use `\n` or `\|` for line breaks. |
| `INVOICE_SELLER_EMAIL` | support address | |
| `INVOICE_SELLER_PHONE` | — | |
| `INVOICE_SELLER_WEBSITE` | `targettrek.in` | |
| `INVOICE_SELLER_PAN` | — | |
| `INVOICE_SELLER_GSTIN` | — | When set, the tax line shows the GSTIN. |
| `INVOICE_TAX_LINE` | `Not registered under GST` | Overrides the tax line text. |
| `INVOICE_TAX_RATE_PERCENT` | `0` | Only applied when a GSTIN is set (totals are treated as tax-inclusive). |
| `INVOICE_PREFIX` | `TT` | Invoice number prefix. |
| `INVOICE_REFUND_POLICY_URL` | `https://<website>/refund-policy` | |
| `SEND_BOOKS_BILL` | `false` | `true` = auto-generate (never auto-email) an invoice for every paid ebook order. |

### 4.13 Variables in old `.env` files that the code no longer reads

`MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, `ANALYTICS_RETENTION_DAYS`, `GUMROAD_APPLICATION_ID`, `PAYU_PAYMENT_URL`,
`PISTON_URL`, `PISTON_API_KEY`, `ARENA_CODE_*`. They are safe to remove.

---

## 5. Environment variables — frontend

Vite only exposes variables that start with `VITE_`, and they are **baked in at build time** — change them in Vercel
(Project → Settings → Environment Variables) and **redeploy**. Everything here is public; never put a secret in a
`VITE_` variable.

### 5.1 Core

| Variable | Default | Description |
|---|---|---|
| `VITE_BASE_URL` | Cloud Run URL | Backend base URL (`src/utils/Url.js`). Use `http://localhost:5001` locally. |
| `VITE_GOOGLE_CLIENT_ID` | — | Google Sign-In client ID (same value as backend `GOOGLE_CLIENT_ID`). |

### 5.2 Payment display (the server decides what really charges)

| Variable | Description |
|---|---|
| `VITE_PAYMENT_GATEWAY` | Global gateway shown in the UI: `cashfree` \| `razorpay` \| `payu`. |
| `VITE_BOOKS_PAYMENT_GATEWAY`, `VITE_ARENA_PAYMENT_GATEWAY`, `VITE_MEMORIES_PAYMENT_GATEWAY`, `VITE_RESUME_PAYMENT_GATEWAY` | Per-product display hints. Keep them equal to the backend's `<PRODUCT>_PAYMENT_GATEWAY`. |
| `VITE_CASHFREE_ENV` (alias `VITE_CASHFREE_MODE`) | `sandbox` \| `production` for the mock-interview Cashfree checkout. |

### 5.3 Analytics and ads

| Variable | Description |
|---|---|
| `VITE_CLARITY_ID` | Microsoft Clarity project ID. Empty = off. |
| `VITE_GOOGLE_ADS_ID` | Google Ads tag ID (`AW-…`). |
| `VITE_GOOGLE_ADS_PURCHASE_LABEL` | Conversion label for purchases. |

### 5.4 Sale campaign banner/popup (`src/component/SaleCampaign.jsx`)

| Variable | Default | Description |
|---|---|---|
| `VITE_SALE_ENABLED` | `false` | Master switch. |
| `VITE_SALE_SHOW_MODAL` / `VITE_SALE_SHOW_BANNER` | `false` | Show popup / banner. |
| `VITE_SALE_ID` | `diwali-sale-2026` | Change it to re-show the popup to people who dismissed an older sale. |
| `VITE_SALE_TITLE` | `Diwali Sale` | |
| `VITE_SALE_DISCOUNT` | `10` | Shown as "Flat N% OFF". |
| `VITE_SALE_COUPON` | `DIWALI10` | Display only — create the real coupon in Admin → Coupons. |
| `VITE_SALE_EMOJI` | 🪔 | |
| `VITE_SALE_START_AT` / `VITE_SALE_END_AT` | — | ISO dates. |
| `VITE_SALE_POPUP_DELAY` | `1800` | ms before the popup appears. |
| `VITE_SALE_DISMISS_HOURS` | `24` | Hours the popup stays hidden after closing. |

### 5.5 Maintenance mode (`src/maintenance/`)

| Variable | Description |
|---|---|
| `VITE_MAINTENANCE` | `all` = whole site, or a comma list of sections: `referral`, `resume`, `prep-buddy`, `books`, `memories`, `mock-interviews`, `interview-experiences`, `blogs`, `resources`. Empty = open. |
| `VITE_MAINTENANCE_TITLE` / `VITE_MAINTENANCE_MESSAGE` | Optional text. |
| `VITE_MAINTENANCE_ENDS_AT` | Optional "expected back" time, e.g. `2026-11-21T14:00:00+05:30`. |

Signed-in admins never see the maintenance page; `/admin`, `/login`, `/signup` and legal pages always stay open.

### 5.6 Legal / business details (`src/config/businessInfo.js`, required by Indian e-commerce rules)

`VITE_LEGAL_NAME`, `VITE_LEGAL_ADDRESS`, `VITE_LEGAL_GSTIN`, `VITE_LEGAL_CIN`, `VITE_SUPPORT_PHONE`,
`VITE_GRIEVANCE_OFFICER_NAME`, `VITE_GRIEVANCE_OFFICER_DESIGNATION` (default "Grievance Officer"),
`VITE_GRIEVANCE_OFFICER_EMAIL` (default support address), `VITE_GRIEVANCE_OFFICER_PHONE`.
About page: `VITE_OPERATOR_NAME`, `VITE_OPERATOR_MOBILE`, `VITE_OPERATOR_ADDRESS`.
Keep these consistent with the backend `INVOICE_SELLER_*` values.

### 5.7 Product pricing hints

`VITE_GOOGLE_ADK_MRP`, `VITE_GOOGLE_ADK_PRICE` — display prices for the Google ADK ebook landing page.

### 5.8 Vercel serverless functions / build (`client/api`, `client/scripts`)

| Variable | Description |
|---|---|
| `BLOG_API_URL` | Backend URL used by `client/api/*` (falls back to `VITE_BASE_URL`, then the Cloud Run URL). |
| `PRERENDER_DEBUG` | Any value = print full stack traces when a page fails to prerender. |

---

## 6. Architecture

```
            Browser (React SPA on Vercel)
               │  HTTPS (axios, Bearer access token + httpOnly refresh cookie)
               │  WebSocket  /ws/arena, /ws/referral
               ▼
   Google Cloud Run — Express backend (backend/index.js)
     │        │          │            │             │
  MongoDB   Upstash    Amazon        Payment       AI providers
  Atlas     Redis      S3/SES/SQS    gateways      (OpenAI, Gemini, Claude)
                       CloudFront    (Cashfree, Razorpay, PayU, Gumroad)
                       Cloudinary
               ▲
     Cloud Scheduler → /internal/* cron endpoints (secret header)
     Gateways → webhooks (signature-verified, raw body)
```

### Request pipeline (order matters — see `backend/index.js`)

1. `compression`, `helmet`, `trust proxy`.
2. Public **unsubscribe** routes (before CORS on purpose).
3. **CORS** (skipped for gateway *return* URLs, which are cross-site form POSTs).
4. `cookieParser`.
5. **Webhooks with raw body** — must stay **above** `express.json()` because signature checks need the exact bytes:
   `/api/interviews/payment/cashfree/webhook`, `/api/memories/payments/webhook/:gateway`,
   `/api/resume/payments/webhook/:gateway`, `/api/referral/payments/webhook/:gateway`,
   `/payment/books/webhook/:gateway`.
6. `/api/analytics` (own 8 kb parser and limiter), `/api/csp-report`, `/internal/*` cron routes.
7. `bodyParsers` — 1 MB anonymous, 10 MB with a valid access token.
8. `sanitizeInput` — strips Mongo operator keys (`$ne`, `$gt`…).
9. `globalRateLimiter`.
10. Origin check (CSRF) on cookie-authenticated endpoints (`/api/auth/refresh`, `/logout`, `/logout-all`).
11. Feature routers, then the 404 and global error handlers (5xx messages are never leaked).

On start-up the server connects to MongoDB, runs idempotent data migrations, and starts background sweepers
(section 11). WebSockets attach to the same HTTP server.

### Adding a new feature (typical flow)

1. Model in `backend/models/<feature>/`.
2. Business logic in `backend/services/<feature>/`.
3. Controller in `backend/controllers/<feature>/` — validate input with **Zod**.
4. Router in `backend/routes/<feature>/` with `auth` / `isAdmin` and a budget from `Middleware/*Budgets.js`.
5. Mount the router in `backend/index.js` (public routes **before** authenticated ones).
6. Frontend page under `client/src/<feature>/`, route in `client/src/App.jsx`, API calls through `BASE_URL`.
7. If it takes payments, use the central processor (section 8) — never call a gateway directly.

---

## 7. Authentication and roles

- **Access token**: short-lived JWT (`JWT_EXPIRES_IN`, default 15 min) sent as `Authorization: Bearer …`.
- **Refresh**: httpOnly cookie with a seven-day default lifetime. `/api/auth/refresh` reuses a newly issued
  refresh cookie briefly to avoid races between reloads, then rotates it; replaced cookies have a short grace
  period for concurrent requests. `client/src/lib/authSession.js` refreshes access tokens silently and shares
  one in-flight refresh between concurrent requests.
- The client signs out only for explicit authentication/session failure codes. An endpoint-specific `401` or
  permission-denied `403` does not clear an otherwise valid login.
- **Sessions** are stored per device (`UserSession`); "log out all devices" bumps the user's `tokenVersion`.
- **OTP on new device** is always required for `admin`, `partner`, `affiliate` and `Employee`; optional for members
  (`LOGIN_OTP_ENABLED`).
- **Lockouts**: per account and per IP (section 4.2, `RATE_LIMITS.md`).
- **Google Sign-In** (Prep Buddy and others) when `GOOGLE_CLIENT_ID` is set.

Auth endpoints (`/api/auth`): `login`, `verify-otp`, `resend-otp`, `password/setup`, `refresh`, `me`,
`change-password`, `logout`, `logout-all`.

Roles (`models/User.js`): `admin`, `normal`, `Employee`, `affiliate`, `partner`. Middleware in `Middleware/auth.js`:
`auth`, `isAdmin`, `authorizeRoles(...)`, plus employee/affiliate guards.

---

## 8. Payments

All gateway calls go through **`backend/services/payments/`** (read its `README.md`). Products validate their own
request, then call `createPayment()` / `verifyPayment()` / `parseWebhook()` / `refundPayment()`.

- `paid` is returned only when the gateway confirms it **and** the amount matches. Never grant access on the
  browser's word alone.
- The browser receives a `checkout` object: `cashfree` (session id), `razorpay` (order + key), or `form_post` (PayU).
- Each order stores the `gateway` and `mode` it was created with, so switching `PAYMENT_GATEWAY` never breaks
  existing orders or subscriptions.

### Webhook URLs to register in gateway dashboards

Replace `{BACKEND_URL}` with the public HTTPS backend URL (Cloud Run by default). Register Razorpay webhooks
in the Razorpay Dashboard; passing a `webhookUrl` while creating an order does not register one with Razorpay.
Use the **same webhook secret** for every endpoint handled by this backend and set it as
`RAZORPAY_WEBHOOK_SECRET` in the backend environment. Keep it server-side only.
Use the secret for the same Razorpay mode as the active keys. This backend reads one webhook secret, so do not
send both test-mode and live-mode webhooks with different secrets to the same deployment. If the variable is
unset, the endpoint responds with a configuration error instead of reporting a bad signature.

| Product | Razorpay webhook URL |
|---|---|
| Books | `{BACKEND_URL}/payment/books/webhook/razorpay` |
| Memories | `{BACKEND_URL}/api/memories/payments/webhook/razorpay` |
| Resume Lab | `{BACKEND_URL}/api/resume/payments/webhook/razorpay` |
| Referrals (one-time + subscriptions) | `{BACKEND_URL}/api/referral/payments/webhook/razorpay` |

For one-time orders, enable **`payment.captured`** and **`order.paid`**. The server verifies the
`x-razorpay-signature` against the exact raw request body, then fetches the payment/order from Razorpay and checks
the amount before fulfillment. Other order events (including `payment.failed` and refund events) are currently
acknowledged but ignored; they do not update order state.

For Referral subscriptions, add these events to the **Referral** URL as well:
`subscription.authenticated`, `subscription.activated`, `subscription.charged`, `subscription.pending`,
`subscription.halted`, `subscription.cancelled`, `subscription.completed`, `subscription.paused`,
`subscription.resumed`, and `subscription.updated`.

The Prep Arena currently verifies payments through its browser result and server-side status checks; it has no
Razorpay webhook route. Mock interviews use Cashfree only at
`{BACKEND_URL}/api/interviews/payment/cashfree/webhook`; Cashfree sets its notify URL per order.
Webhook routes use raw bodies and are not JWT-protected or rate-limited; their signatures are verified by the
gateway adapter. A handler returns 2xx after successful processing/ignoring an event and 5xx on processing
errors so the gateway can retry. A missing Razorpay webhook secret returns 503; an invalid signature returns 400.

**Local testing:** use sandbox keys (`CASHFREE_ENV=sandbox`, `PAYU_MODE=test`, `rzp_test_…`). Gateways must reach
`BACKEND_URL`, so expose your local backend with a tunnel (e.g. ngrok / cloudflared) when testing returns and
webhooks. For Memories you can set `MEMORY_ALLOW_MOCK_PAYMENTS=true` locally.

---

## 9. Email

- `utils/MailSender.js` sends through the provider an admin selects at `/admin/mail` (Mailtrap, Resend or SES).
- If `SQS_EMAIL_QUEUE_NAME` is set, mail is queued in **Amazon SQS** and sent by `services/mail/mailWorker.js`
  (started inside the server unless `MAIL_WORKER_ENABLED=false`). Failed messages land in the DLQ and can be retried
  from Campaign Studio.
- Templates live in `services/mail/templates.js` (and legacy HTML in `backend/templates/`). Preview every template
  offline: `node scripts/preview-emails.mjs` (never sends anything).
- Campaign emails include a signed unsubscribe link (`/api/mail/unsubscribe`); suppressed addresses are stored in
  `MailSuppression`.
- Set `MAIL_DISABLE_SEND=true` locally unless you are testing email.

---

## 10. File storage

- **S3 (private)** for user uploads, book files, invoices and memory media. The browser uploads directly with a
  **presigned POST** (`/api/uploads`) and reads through short-lived presigned GET URLs (or CloudFront signed URLs
  when `MEDIA_CDN_*` is set). Run `node scripts/setS3Cors.mjs` (then `--apply`) once per bucket.
- **Cloudinary** for public images, blog covers and legacy book PDFs.
- Book storage location (S3 vs Cloudinary) is chosen in the admin at `/admin/book-storage`.
- Memory media is processed in the background (`services/memory/mediaProcessor.js`, `sharp` + `ffmpeg`) and removed
  after the page expires (`storageCleanup.js`, `expiry.js`).

---

## 11. Background jobs and cron endpoints

Started in-process by `startServer()` in `backend/index.js`:

| Job | Interval | What it does |
|---|---|---|
| Analytics jobs | timers (or Cloud Scheduler on Cloud Run) | Roll up visitor/page analytics. |
| Ebook email sweeper | periodic | Retries ebook deliveries that failed. |
| Invoice sweeper | periodic | Generates pending invoices. |
| Pack-code sweeper | periodic | Memories pack codes. |
| Memory storage / media / expiry | periodic | Process uploads, expire pages, delete old media. |
| Mail worker | continuous | Consumes the SQS email queue. |
| Arena maintenance | 10 min | Releases abandoned checkouts, heals paid members. |
| Session sweep | 10 min | Deletes expired/revoked device sessions. |
| Meta CAPI sweep | 15 min | Re-sends Purchase events Meta missed. |
| Book view flush | on `SIGTERM` | Writes buffered view counts before shutdown. |

**Cloud Scheduler endpoints** (all `POST`, protected by a secret header):

| Endpoint | Header | Schedule |
|---|---|---|
| `/internal/analytics/maintenance` | `x-cron-secret: $ANALYTICS_CRON_SECRET` | every minute |
| `/internal/blog-agent/daily?count=3` | `x-cron-secret: $BLOG_AGENT_CRON_SECRET` | daily (set attempt deadline ≈ 30 min; creates **draft** posts only) |
| `/api/interviews/maintenance/cleanup` | `x-interview-cron-secret: $INTERVIEW_CRON_SECRET` | releases expired interview slot holds |

Because Cloud Run can scale to zero, anything time-critical should be driven by Cloud Scheduler, not only by
in-process timers.

---

## 12. Rate limits and security

- Rate limits and budgets are **server-side** Redis counters — read `backend/RATE_LIMITS.md` before adding an
  endpoint, and attach an appropriate budget to every new public or member route.
- Input: Zod validation in controllers, `sanitizeInput` against NoSQL injection, `sanitize-html` for rich text,
  image signature checks on uploads.
- Headers: `helmet` on the backend; security headers and a strict **CSP in report-only mode** in
  `client/vercel.json`. Violations are posted to `/api/csp-report` and logged as `[csp]` — once clean, rename the header
  to `Content-Security-Policy` to enforce it.
- Secrets only in environment variables (Cloud Run / Vercel). `SECURITY.md` contains the incident runbook
  (CERT-In 6-hour reporting, DPDP notifications, log retention of 180 days in India).
- Customer data exports (`*.csv`, `backend/exports/`, `backend/lld-customers.json`) are git-ignored — never commit them.

---

## 13. SEO, prerendering and Vercel functions

`npm run build` in `client/` runs three steps:

1. `scripts/gen-seo-data.mjs` — reads SEO constants (`SEO_TITLE`, `FAQS`, …) straight from page components and writes
   `api/_seo-data.json`. If you change a book/landing page's SEO text, the build picks it up automatically.
2. `vite build` — the SPA into `dist/`.
3. `scripts/prerender.mjs` — renders static content pages to `dist/prerendered/<route>.html` so crawlers get full
   HTML. Failed pages fall back to the SPA shell.

`vercel.json` rewrites map public URLs to either a prerendered file or a serverless function in `client/api/`:
`page.js` (book/learn pages with SEO data), `blog.js` / `blogs.js`, `interview.js` / `interviews.js`,
`portfolio.js`, `sitemap.js` (`/sitemap.xml`), `robots.js`, `rss.js`, `llms.js` (`/llms.txt`). Files starting with
`_` are helpers, not routes.

**When you add a new public page**: add the route in `App.jsx`, and if it should be indexed add it to
`scripts/prerender.mjs` (static content) or to `gen-seo-data.mjs` + a `vercel.json` rewrite (book-style pages), and
to `api/sitemap.js`.

---

## 14. Testing

Tests use Node's built-in **`node:test`** runner. Run from `backend/`:

```bash
npm test                    # unit suites (no database, ~5 s): security, webhooks, storage, invoices, mail queue,
                            #   resume agents, referral subscriptions, email templates, AWS signing, arena helpers
npm run test:integration    # integration suites: login, partners, Prep Buddy Arena, HTTP security
npm run test:all            # both
```

Integration suites start a throw-away in-memory MongoDB replica set (`mongodb-memory-server`, a dev dependency). The
first run downloads a MongoDB binary, so it is slower. They are plain scripts that print `PASS` / `FAIL` per check
and exit with code 1 on any failure.

Run one suite on its own:

```bash
node --test tests/security/hardening.test.mjs        # any unit file
node tests/arena/arena.integration.test.mjs          # any integration file
node --test --test-name-pattern="CSP" tests/security/hardening.test.mjs   # only matching tests
```

| File | Type | Covers |
|---|---|---|
| `tests/security/hardening.test.mjs` | unit | body size limits, CSP report endpoint |
| `tests/security/cashfreeWebhook.test.mjs` | unit | Cashfree webhook signature + age checks |
| `tests/security/login.integration.test.mjs` | integration | login, OTP, lockouts |
| `tests/books/bookFiles.test.js` | unit | multi-file books, S3 vs Cloudinary |
| `tests/storage/s3.test.js` | unit | presigned upload/download, key ownership |
| `tests/invoice/invoice.test.mjs` | unit | invoice numbers, PDF data |
| `tests/mail/queue.test.mjs` | unit | SQS mail queue + worker |
| `tests/resume/agents.test.mjs` | unit | Resume Lab AI pipeline guards |
| `tests/referral/subscription.test.mjs` | unit | referral subscriptions |
| `tests/partner/partner.integration.test.mjs` | integration | partner dashboard permissions |
| `tests/arena/arena.integration.test.mjs` | integration | Prep Buddy Arena flows |
| `tests/arena/http-security.test.mjs` | integration | rate limits, access control, payments, admin consoles |
| `services/**/*.test.js`, `utils/awsSigV4.test.js` | unit | templates, promo mail, arena pricing/privacy/OTP limits, AWS SigV4 |

Tests set their own env vars and blank out every mail/AWS credential, so they **never send real email or touch real
services**. Add new unit test files to the `test` script in `backend/package.json`.

Frontend checks: `cd client && npm run lint && npm run build`.

---

## 15. Scripts

All in `backend/scripts/`, run from `backend/`. They load `backend/.env`. **Check which database `MONGO_URI` points
at before running anything that writes.** Run the dry-run mode first when there is one. Arguments go after `--`
when you use the npm shortcut (`npm run admin:reset -- --email=…`).

| npm shortcut | Direct command | Writes? | Purpose |
|---|---|---|---|
| `npm run admin:reset -- --email=<admin>` | `node scripts/bootstrapAdminAuth.js --email=<admin>` | **yes, no dry run** | Resets an existing **admin** to a clean login state: active, unlocked, failed attempts cleared, `tokenVersion` bumped, every session revoked, Redis auth cache rewritten. The password is **not** changed. Use it to recover a locked or disabled admin. Refuses to run without a valid `--email=`. |
| `npm run slots:add -- [--dry] [--email=<interviewer>]` | `node scripts/addMockInterviewSlots.js` | yes | Creates two mock-interview slots (8–8:45 PM, 9–9:45 PM IST) for today and the next 7 days. Skips past slots. |
| `npm run invoices:backfill -- [--write] [--limit=50] [--from=YYYY-MM-DD] [--to=YYYY-MM-DD]` | `node scripts/backfillInvoices.js` | only with `--write` | Creates invoices for paid orders that have none, oldest first. Safe to re-run. |
| `npm run resume:migrate-credits -- [--dry]` | `node scripts/migrateResumeCredits.js` | yes unless `--dry` | One-time Resume Lab migration to separate AI / human / LinkedIn credits. |
| `npm run s3:cors -- [--apply] [--origin https://…]` | `node scripts/setS3Cors.mjs` | only with `--apply` | Shows / applies the S3 CORS rule for browser uploads. **Replaces** the bucket's whole CORS config; needs `s3:PutBucketCORS`. |
| `npm run emails:preview -- [folder]` | `node scripts/preview-emails.mjs` | no | Renders every email template to HTML (no network, no DB). Open `index.html` in the output folder. |
| — | `node scripts/exportLldCustomers.js` | writes a local file | Exports LLD book customers to `lld-customers.json`. Contains personal data: git-ignored, never share or commit it. |
| — | `node scripts/tempBackfillAffiliateOrders.js [--code=BBB] [--apply]` | only with `--apply` | One-off: attaches affiliate details to old PayU / Razorpay orders (one code, or all affiliates). Preview by default; safe to re-run. |

---

## 16. Deployment

### Backend — Google Cloud Run (`asia-south2`)

- Service runs `npm start` (`node index.js`); Cloud Run provides `PORT` and `K_SERVICE`.
- Set every required variable from section 4 in the service's environment (use Secret Manager for secrets).
- `NODE_ENV=production`, `COOKIE_SECURE=true`, `FRONTEND_URL=https://www.targettrek.in`, `BACKEND_URL=` the service URL.
- Request timeout must exceed the blog agent's run time (~10 min) if you use it.
- Logging: keep the `_Default` bucket retention at **180 days** in an Indian region (see `SECURITY.md`).
- Configure the Cloud Scheduler jobs from section 11 and the gateway webhooks from section 8.

### Frontend — Vercel

- Root directory `client/`, build command `npm run build`, output `dist/`.
- Set `VITE_*` variables (section 5) per environment (Preview / Production) and redeploy after any change.
- `vercel.json` controls rewrites, function duration (30 s) and security headers.

### Release checklist

- [ ] New env vars added to Cloud Run / Vercel **and** to this README.
- [ ] Webhooks and CORS origins still match the deployed URLs.
- [ ] Relevant tests pass locally; `npm run lint` and `npm run build` pass in `client/`.
- [ ] No secrets, `.env` files, or customer exports in the diff.

---

## 17. Conventions and gotchas

- **ES modules everywhere** (`"type": "module"`) — use `import`, include the `.js` extension in relative imports.
- **Express 5**: async handlers that throw are forwarded to the error handler automatically.
- **Webhooks must stay above `express.json()`** in `index.js`, or signature checks break.
- **Public routes are mounted before authenticated ones** for the same prefix (e.g. `/api/memories/view` before
  `/api/memories`). Keep that order when adding routes.
- **Money is stored in paise** (`amountPaise`) in the payment layer.
- **Never trust the client** for prices, coupons, payment status or limits — the UI only mirrors server rules.
- **Gateway mode follows the keys**; don't add separate "test mode" flags.
- `VITE_*` values are public and build-time only.
- A `.env.example` exists in `backend/` but is incomplete — this README is the authoritative list. Update both when
  you add a variable.
- Some legacy routes have no `/api` prefix (`/book`, `/booking`, `/blogs`, `/admin/...`, `/payment/...`); keep them
  stable, the live site depends on them.
- Contact for security issues: see `SECURITY.md`.

---

## 18. Command cheat sheet

### First-time setup

```bash
git clone <repo-url> TG && cd TG
cd backend && npm install            # backend dependencies
cd ../client && npm install          # frontend dependencies
# then create backend/.env and client/.env (section 3)
openssl rand -hex 32                 # generate a value for JWT_SECRET / cron secrets / salts
```

### Backend (`cd backend`)

| Command | What it does |
|---|---|
| `npm run dev` | Start the API with auto-restart (nodemon) on `PORT` (default 5001). |
| `npm start` | Start the API the way Cloud Run does (`node index.js`). |
| `npm test` | Unit tests (no database). |
| `npm run test:integration` | Integration tests (in-memory MongoDB). |
| `npm run test:all` | All tests. |
| `npm run emails:preview` | Render every email template to HTML files. |
| `npm run s3:cors` / `npm run s3:cors -- --apply` | Show / apply the S3 bucket CORS rule. |
| `npm run admin:reset -- --email=<admin>` | Unlock / reset an admin and sign them out everywhere. |
| `npm run slots:add -- --dry` | Preview mock-interview slots (drop `--dry` to create). |
| `npm run invoices:backfill` / `-- --write` | Preview / create missing invoices. |
| `npm run resume:migrate-credits -- --dry` | Preview the Resume Lab credits migration. |
| `curl http://localhost:5001/health` | Health check. |

### Frontend (`cd client`)

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on http://localhost:5173 (hot reload). |
| `npm run build` | Production build: SEO data → `vite build` → prerender to `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | ESLint (fails on any warning). |
| `PRERENDER_DEBUG=1 npm run build` | Build with full stack traces for pages that fail to prerender. |

### Triggering cron jobs by hand (local or deployed)

```bash
curl -X POST "$BACKEND_URL/internal/analytics/maintenance"   -H "x-cron-secret: $ANALYTICS_CRON_SECRET"
curl -X POST "$BACKEND_URL/internal/blog-agent/daily?count=1" -H "x-cron-secret: $BLOG_AGENT_CRON_SECRET"
curl -X POST "$BACKEND_URL/api/interviews/maintenance/cleanup" -H "x-interview-cron-secret: $INTERVIEW_CRON_SECRET"
```

### Before you push

```bash
cd backend && npm run test:all
cd ../client && npm run lint && npm run build
git status        # no .env files, *.csv, exports or lld-customers.json in the diff
```
