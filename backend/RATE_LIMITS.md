# Rate limits, locks and cost budgets

Everything here is enforced on the **server** (the UI only mirrors it). Numbers are defaults; each can be
changed with the env var shown, with no code change. Redis cost note: budget limits use one `INCR` per
allowed request (two on the first of a window). Locks cost one `MGET` per request in the flow.

## Login (site-wide, `/api/auth/login`)
| Rule | Default | Env |
|---|---|---|
| 5 wrong passwords in a row lock the **account** for 24 h (admin / affiliate / employee: 15 min) | 5 / 24 h | `MAX_LOGIN_ATTEMPTS`, `USER_LOCK_MINUTES`, `ACCOUNT_LOCK_MINUTES` |
| Failed logins from one **network (IP)**, across any accounts, lock that IP for 24 h | 30 / day | `LOGIN_IP_FAIL_LIMIT` |
| Burst limit per IP | 10 / 15 min | (rateLimiter.js) |

## Prep Buddy sign-up (email + IP)
| Rule | Default | Env |
|---|---|---|
| Wrong code, resend, or re-submit while a code is pending: lock the **email** for 24 h | 10 / day | `ARENA_SIGNUP_ATTEMPT_LIMIT` |
| Same, counted per **IP**: lock the IP for 24 h | 10 / day | `ARENA_SIGNUP_IP_ATTEMPT_LIMIT` |
| Codes emailed (any flow) | 5 / 24 h per IP, email, mobile | `otpLimit.js` |
| Gap between codes | 60 s (not counted as an attempt) | |

## Forgot password (email + IP)
| Rule | Default | Env |
|---|---|---|
| Wrong code or resend: lock the **email** for 24 h (the first request is not a resend) | 5 / day | `ARENA_RESET_ATTEMPT_LIMIT` |
| Same, per **IP** | 5 / day | `ARENA_RESET_IP_ATTEMPT_LIMIT` |
| A successful reset clears the email's counter. Admin can lift any lock: Members tab -> "Unlock a customer". | | |

## Prep Buddy members (per signed-in member)
| Action | Default | Env |
|---|---|---|
| Send request | 10 / hour, 30 / day | `ARENA_REQ_HOURLY_LIMIT`, `ARENA_REQ_DAILY_LIMIT` |
| Send to the **same** member (stops send/unsend loops) | 3 / day | `ARENA_REQ_PER_TARGET_LIMIT` |
| Withdraw ("unsend") | 15 / day | `ARENA_WITHDRAW_DAILY_LIMIT` |
| Accept / reject | 60 / day | `ARENA_RESPOND_DAILY_LIMIT` |
| Block / unblock, report, bug report | 10 / day, 10 / day, 5 / day | `ARENA_BLOCK_DAILY_LIMIT`, `ARENA_REPORT_DAILY_LIMIT`, `ARENA_BUG_DAILY_LIMIT` |
| Profile / sharing / visibility changes | 20 / hour | `ARENA_PROFILE_HOURLY_LIMIT` |
| Payment checkout / verify / reconcile / cancel | 10 / 30 / 20 per hour, 5 / day | `ARENA_CHECKOUT_HOURLY_LIMIT`, ... |
| Coupon checks (member and IP) | 30 / hour | `ARENA_COUPON_HOURLY_LIMIT` |
| Delete account attempts | 10 / day (+ 5 wrong passwords = 15 min) | `ARENA_ACCOUNT_DELETE_DAILY_LIMIT` |
| Chat edit/delete, reactions | 60 / hour, 300 / hour | `ARENA_CHAT_EDIT_HOURLY_LIMIT`, `ARENA_CHAT_REACT_HOURLY_LIMIT` |
| Live chat messages | 12 / 10 s, 2000 / day (in memory, no Redis) | `ARENA_CHAT_DAILY_LIMIT` |
| Any write | 30 / min | |

## Public endpoints (per IP)
Payment create (`cashfree`, `payu`, `razorpay`): 20 / hour and 100 / day. Payment verify / return: 60 / hour.
Payment status: 60 / 10 min. Coupon validate: 30 / 10 min. Interview booking create: 10 / hour, 30 / day.
Booking payment / reconcile: 40 / hour. Booking status: 120 / 10 min. Public forms: the existing 5 / 10 min plus
15 / day. Book-review link submit: 20 / hour. Blog view counter: 60 / 10 min.
Gateway **webhooks** are intentionally not limited (they are signature-verified).

## Mail cost
`/admin/mail` picks the provider (Mailtrap / Resend / Amazon SES). Emails are only sent for: sign-up code,
password-reset code, "you're matched", and the site's existing order/booking mails. Each code flow is capped as above.
Tests never send real mail (`MAIL_DISABLE_SEND=true` and blank credentials in the test files).
