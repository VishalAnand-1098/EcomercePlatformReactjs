# Email Integration Plan — Resend + GiftsBhejo

## 1. Goal

Send automated emails using **Resend** for:

| # | Event | When it fires | Recipient |
|---|--------|----------------|-----------|
| 1 | **Welcome / Registration** | User completes sign-up | User email |
| 2 | **Order placed** | Checkout succeeds (`createOrder`) | User / shipping email |
| 3 | **Order shipped** | Admin sets status → `shipped` | User / shipping email |
| 4 | **Order delivered** | Admin sets status → `delivered` | User / shipping email |

---

## 2. Current codebase (what we have today)

- **Frontend only**: React + Vite, talks directly to **Supabase** (no existing backend).
- **Auth**: Custom JWT in browser (`authService.js` → `register`, `login`).
- **Orders**: Created in `src/services/orderService.js` → `createOrder()` from `Checkout.jsx`.
- **Status updates**: Admin via `updateOrderStatus()` in `ManageOrders.jsx` and `OrderDetails.jsx`.
- **Deploy target**: **Vercel** (`vercel.json` currently rewrites all routes to SPA `index.html`).

**Important:** Resend API keys must **never** live in React code or `VITE_*` env vars (they are bundled into the browser). Email sending must run **server-side**.

---

## 3. Recommended architecture

```
React app (browser)
    │
    ├─ register success ──────────────► POST /api/emails/send  { type: "welcome", ... }
    ├─ order created ─────────────────► POST /api/emails/send  { type: "order_placed", orderId }
    └─ admin status → shipped/delivered ► POST /api/emails/send  { type: "order_shipped" | "order_delivered", orderId }
                                              │
                                              ▼
                                    Vercel Serverless Function
                                    (Node.js + Resend SDK)
                                              │
                                              ▼
                                         Resend API
```

### Why Vercel serverless (not frontend Resend)?

- Keeps `RESEND_API_KEY` secret on the server.
- Works with your existing Vercel deployment.
- No Supabase Edge Functions setup required (optional later).

---

## 4. Security notes (read before approval)

### 4.1 API key you shared

You pasted a Resend key in chat. **Treat it as exposed.**

Before production:

1. Rotate the key in [Resend Dashboard](https://resend.com/api-keys).
2. Store the new key only in **Vercel Environment Variables** (never commit to Git).

### 4.2 Sending password in welcome email

You asked to email the user their **email + password** after registration.

**Risk:** Plain-text passwords in email are insecure (inbox leaks, forwarding, logs).

**Plan options (pick one when approving):**

| Option | Behavior |
|--------|----------|
| **A (your request)** | Welcome email includes email + plain password |
| **B (recommended)** | Welcome email confirms account only; no password. Add “Reset password” later |
| **C (middle ground)** | Welcome email + “You chose this password at signup” without repeating the password |

Default in implementation unless you say otherwise: **Option A** (as requested), with a short security note in the email footer.

### 4.3 Protecting the email API

The `/api/emails/send` route will accept a shared secret header:

- `EMAIL_API_SECRET` — set in Vercel env, sent from frontend in `Authorization: Bearer ...`
- Prevents random public abuse of your email endpoint

Optional upgrade (phase 2): verify admin JWT for status-change emails only.

---

## 5. Resend setup (one-time, before coding)

1. Create / use Resend account.
2. Add and verify a **sender domain** (e.g. `giftsbhejo.com`) **or** use Resend test sender `onboarding@resend.dev` (testing only; limited recipients).
3. Set env vars in Vercel:

| Variable | Example | Where |
|----------|---------|--------|
| `RESEND_API_KEY` | `re_xxxx...` | Vercel (Production + Preview) |
| `RESEND_FROM_EMAIL` | `GiftsBhejo <noreply@giftsbhejo.com>` | Vercel |
| `EMAIL_API_SECRET` | random 32+ char string | Vercel |
| `SUPABASE_URL` | same as frontend | Vercel (server fetch) |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key | Vercel only — **never** in frontend |

`SUPABASE_SERVICE_ROLE_KEY` lets the API load full order + user details securely by `orderId` without trusting client payload.

---

## 6. Email templates (content outline)

All emails: GiftsBhejo branding, responsive HTML, plain-text fallback.

### 6.1 Welcome — `welcome`

**Trigger:** After successful `register()`.

**Subject:** `Welcome to GiftsBhejo!`

**Body includes:**

- Hello `{name}`
- Your account email: `{email}`
- Your password: `{password}` *(if Option A)*
- Link to login: `{siteUrl}/login`
- Support contact

### 6.2 Order placed — `order_placed`

**Trigger:** After `createOrder()` returns successfully (Razorpay + COD paths in `Checkout.jsx`).

**Subject:** `Order confirmed — #{orderIdShort}`

**Body includes:**

- Order ID, date
- Item list (name × qty, price)
- Subtotal, tax, shipping, discount, total
- Shipping address
- Payment method / status
- Link: `{siteUrl}/order-success/{orderId}`

### 6.3 Order shipped — `order_shipped`

**Trigger:** When admin calls `updateOrderStatus(id, 'shipped')`.

**Subject:** `Your order has shipped — #{orderIdShort}`

**Body includes:**

- Order summary
- Shipping address
- “Track / view order” link → `{siteUrl}/dashboard`

### 6.4 Order delivered — `order_delivered`

**Trigger:** When admin calls `updateOrderStatus(id, 'delivered')`.

**Subject:** `Your order has been delivered — #{orderIdShort}`

**Body includes:**

- Thank-you message
- Order summary
- Optional: review / shop again link → `{siteUrl}/products`

---

## 7. Files to add / change

### 7.1 New files

```
api/
  emails/
    send.js              ← Vercel serverless handler (Resend send)
    templates/
      welcome.js
      orderPlaced.js
      orderShipped.js
      orderDelivered.js
    utils/
      supabaseAdmin.js   ← server-side Supabase client (service role)
      formatOrder.js     ← build line items for emails

src/
  services/
    emailService.js      ← frontend helper: POST /api/emails/send
```

### 7.2 Modified files

| File | Change |
|------|--------|
| `src/context/AuthContext.jsx` | After `registerUser` success → call `sendWelcomeEmail(name, email, password)` |
| `src/services/orderService.js` | After `createOrder` → `sendOrderPlacedEmail(order.id)`; after `updateOrderStatus` → send shipped/delivered email when status matches |
| `vercel.json` | Exclude `/api/*` from SPA rewrite so serverless routes work |
| `package.json` | Add dependency: `resend` |
| `.env.example` | Document server-only vars (no real secrets) |
| `.gitignore` | Ensure `.env` stays ignored |

### 7.3 `vercel.json` change (concept)

Current rewrite sends **everything** to `index.html`, which breaks `/api/*`.

Update to:

```json
{
  "buildCommand": "npm run build:ssg",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

(Vercel auto-detects `/api` folder; rewrite order matters.)

---

## 8. Implementation flow (step-by-step)

### Phase 1 — Backend email API (~2–3 hours)

1. Install `resend` package.
2. Create `api/emails/send.js`:
   - Validate `EMAIL_API_SECRET`.
   - Switch on `type`: `welcome` | `order_placed` | `order_shipped` | `order_delivered`.
   - Load data (from request body or Supabase for orders).
   - Render template → send via Resend.
   - Return `{ success: true }` or error (log on server, don’t block UX).
3. Add Supabase admin helper for order + items + user lookup.

### Phase 2 — Frontend hooks (~1–2 hours)

1. Create `emailService.js` with `sendEmail(type, payload)`.
2. **Registration:** call welcome email in `AuthContext.registerUser` (password still available in memory).
3. **Order placed:** call from `createOrder` after DB insert (non-blocking — email failure should not cancel order).
4. **Shipped / delivered:** call from `updateOrderStatus` when new status is `shipped` or `delivered`.

### Phase 3 — Vercel + Resend config (~30 min)

1. Add env vars in Vercel project settings.
2. Redeploy.
3. Test each email type on production/preview URL.

### Phase 4 — Testing checklist

- [ ] Register new user → welcome email received
- [ ] Place order (COD test) → order confirmation email
- [ ] Place order (Razorpay test) → order confirmation email
- [ ] Admin → mark shipped → shipped email
- [ ] Admin → mark delivered → delivered email
- [ ] Wrong `EMAIL_API_SECRET` → 401, no email sent
- [ ] Email API down → order/register still succeeds (toast optional: “Confirmation email may be delayed”)

---

## 9. Error handling policy

| Scenario | Behavior |
|----------|----------|
| Resend fails | Log error server-side; **do not** fail registration or order |
| Invalid email address | Log; skip send |
| Missing order on status email | Return 404 from API; show admin toast “Status updated; email could not be sent” |

---

## 10. Optional future improvements (out of scope unless you ask)

- Email log table in Supabase (`ecommerce_email_logs`)
- Supabase DB trigger → Edge Function (emails even if admin bypasses frontend)
- Password reset flow instead of emailing password
- PDF invoice attachment on order placed
- i18n / Hindi templates

---

## 11. Dependencies & cost

- **npm:** `resend` (official SDK)
- **Resend free tier:** 3,000 emails/month (check current Resend pricing)
- **Vercel:** Serverless functions included on hobby plan (within limits)

---

## 12. Approval checklist

Please reply with:

1. **Approve plan?** (yes / no / changes)
2. **Welcome email option:** A, B, or C (see §4.2)
3. **From address:** e.g. `noreply@giftsbhejo.com` or use `onboarding@resend.dev` for testing
4. **Site URL for links:** e.g. `https://ecommerce-platform-reactjs.vercel.app`
5. Confirm you will add **rotated** `RESEND_API_KEY` in Vercel (not in code)

Once approved, implementation will follow this plan in the order of Phase 1 → 4.

---

*Plan version: 1.0 — GiftsBhejo Ecommerce Platform*
