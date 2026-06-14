// Supabase Edge Function — send-email
// Runtime: Deno · deployed via: supabase functions deploy send-email --no-verify-jwt
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── Environment ─────────────────────────────────────────────────────────────
// RESEND_API_KEY must be set with: supabase secrets set RESEND_API_KEY=re_xxx
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
const RESEND_API_KEY        = Deno.env.get('RESEND_API_KEY') ?? '';
const SUPABASE_URL          = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SITE_URL              = Deno.env.get('SITE_URL') ?? 'https://ecommerce-platform-reactjs.vercel.app';
const FROM_EMAIL            = Deno.env.get('RESEND_FROM_EMAIL') ?? 'GiftsBhejo <onboarding@resend.dev>';

// ─── CORS ─────────────────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// ─── Resend REST helper ───────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string, text: string) {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY secret is not configured');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html, text }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Resend error:', JSON.stringify(data));
    throw new Error(data?.message ?? `Resend error ${res.status}`);
  }
  console.log('Email sent:', data?.id, '→', to);
  return data;
}

// ─── Supabase order fetch ────────────────────────────────────────────────────
async function fetchOrder(orderId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: order, error: oErr } = await supabase
    .from('ecommerce_orders')
    .select('*, ecommerce_users(name, email, phone)')
    .eq('id', orderId)
    .single();

  if (oErr) throw oErr;

  const { data: items, error: iErr } = await supabase
    .from('ecommerce_order_items')
    .select('*, ecommerce_products(name, image_url, price, discount_percentage)')
    .eq('order_id', orderId);

  if (iErr) throw iErr;
  return { ...order, items: items ?? [] };
}

// ─── Utility ─────────────────────────────────────────────────────────────────
function formatOrderId(id: string) {
  if (!id) return '';
  const numeric = parseInt(id.replace(/-/g, '').slice(0, 8), 16) % 10000;
  return `Order_Id${String(numeric).padStart(4, '0')}`;
}
function price(v: number) { return `₹${Number(v || 0).toFixed(2)}`; }

function addr(o: Record<string, string>) {
  return [o.shipping_address, o.shipping_city, o.shipping_state, o.shipping_zipcode, o.shipping_country]
    .filter(Boolean).join(', ') || 'Not provided';
}

// ─── Base layout ─────────────────────────────────────────────────────────────
function layout(title: string, preheader: string, body: string, siteUrl = SITE_URL) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,Helvetica,sans-serif;color:#111827;">
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</span>
  <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
        style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;
               box-shadow:0 8px 24px rgba(0,0,0,0.10);">
        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#f472b6 0%,#ec4899 50%,#be185d 100%);
                     padding:32px 24px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <div style="background:rgba(255,255,255,0.25);border-radius:12px;
                          padding:8px 12px;display:inline-block;">
                <span style="font-size:22px;">🎁</span>
              </div>
            </div>
            <h1 style="margin:10px 0 4px;color:#ffffff;font-size:26px;
                       font-weight:800;letter-spacing:-0.5px;">GiftsBhejo</h1>
            <p style="margin:0;color:#fce7f3;font-size:13px;letter-spacing:1px;">
              DELIVERING LOVE &amp; JOY
            </p>
          </td>
        </tr>
        <!-- BODY -->
        <tr><td style="padding:36px 32px 28px;">${body}</td></tr>
        <!-- FOOTER -->
        <tr>
          <td style="padding:20px 32px 28px;background:#fdf2f8;
                     border-top:1px solid #fce7f3;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#9d174d;font-weight:600;">
              © ${year} GiftsBhejo. All rights reserved.
            </p>
            <p style="margin:0;font-size:12px;color:#6b7280;">
              <a href="${siteUrl}" style="color:#db2777;text-decoration:none;">Visit GiftsBhejo</a>
              &nbsp;·&nbsp;
              <a href="${siteUrl}/dashboard" style="color:#db2777;text-decoration:none;">My Orders</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
  <!--[if mso]></td></tr></table><![endif]-->
</body>
</html>`.trim();
}

function btn(href: string, label: string) {
  return `<p style="text-align:center;margin:28px 0 8px;">
    <a href="${href}"
      style="display:inline-block;background:linear-gradient(135deg,#ec4899,#be185d);
             color:#ffffff;text-decoration:none;padding:15px 36px;
             border-radius:999px;font-weight:700;font-size:15px;
             letter-spacing:0.3px;box-shadow:0 4px 14px rgba(190,24,93,0.35);">
      ${label}
    </a>
  </p>`;
}

function badge(label: string, color: string) {
  return `<span style="display:inline-block;padding:4px 12px;border-radius:999px;
    font-size:12px;font-weight:600;background:${color}20;color:${color};">
    ${label}
  </span>`;
}

// ─── Email templates ──────────────────────────────────────────────────────────

function buildWelcome({ name, email, password, siteUrl }: {
  name: string; email: string; password: string; siteUrl?: string;
}) {
  const site = siteUrl ?? SITE_URL;
  const body = `
    <h2 style="margin:0 0 6px;color:#111827;font-size:22px;font-weight:700;">
      Welcome, ${name}! 🎉
    </h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">
      Your GiftsBhejo account is ready — here's everything you need to get started.
    </p>

    <!-- Credentials card -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
      style="background:linear-gradient(135deg,#fdf2f8,#fff0f9);
             border:1px solid #fbcfe8;border-radius:12px;margin:0 0 24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 14px;font-weight:700;color:#9d174d;font-size:14px;
                    text-transform:uppercase;letter-spacing:0.8px;">
            🔐 Your Login Credentials
          </p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;width:80px;">Email</td>
              <td style="padding:6px 0;">
                <span style="color:#111827;font-weight:600;font-size:14px;">${email}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Password</td>
              <td style="padding:6px 0;">
                <code style="background:#f3f4f6;padding:3px 10px;border-radius:6px;
                             font-size:14px;color:#be185d;font-weight:700;letter-spacing:1px;">
                  ${password}
                </code>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- What you can do -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
      style="margin:0 0 24px;">
      <tr>
        <td style="background:#f9fafb;border-radius:10px;padding:18px 22px;">
          <p style="margin:0 0 12px;font-weight:700;color:#374151;font-size:13px;">
            🛍️ What you can do now
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr><td style="padding:4px 0;color:#4b5563;font-size:13px;">✅ &nbsp;Browse thousands of gifts</td></tr>
            <tr><td style="padding:4px 0;color:#4b5563;font-size:13px;">✅ &nbsp;Place orders with fast delivery</td></tr>
            <tr><td style="padding:4px 0;color:#4b5563;font-size:13px;">✅ &nbsp;Track all your orders in real-time</td></tr>
            <tr><td style="padding:4px 0;color:#4b5563;font-size:13px;">✅ &nbsp;Send gifts directly to loved ones</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;text-align:center;">
      For security, please change your password after your first login.
    </p>
    ${btn(`${site}/login`, 'Login to Your Account')}
  `;

  return {
    subject: '🎁 Welcome to GiftsBhejo — Your Account is Ready!',
    html: layout('Welcome to GiftsBhejo', 'Your account has been created successfully', body, site),
    text: `Welcome to GiftsBhejo, ${name}!\n\nEmail: ${email}\nPassword: ${password}\n\nLogin: ${site}/login`,
  };
}

// deno-lint-ignore no-explicit-any
function buildOrderPlaced(order: any, siteUrl?: string) {
  const site = siteUrl ?? SITE_URL;
  const ref  = formatOrderId(order.id);
  const name = order.shipping_name ?? order.ecommerce_users?.name ?? 'Customer';
  const itemRows = (order.items ?? []).map((item: Record<string, unknown>) => {
    const prod = item.ecommerce_products as Record<string, unknown> | undefined;
    const n = (prod?.name ?? 'Product') as string;
    const qty = (item.quantity as number) ?? 1;
    return `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;">${n}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:center;font-size:14px;">${qty}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-size:14px;">
        ${price((item.price as number ?? 0) * qty)}
      </td>
    </tr>`;
  }).join('');

  const body = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <div style="background:#d1fae5;border-radius:50%;width:48px;height:48px;
                  display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">
        ✅
      </div>
      <div>
        <h2 style="margin:0 0 2px;color:#111827;font-size:20px;font-weight:700;">Order Confirmed!</h2>
        <p style="margin:0;color:#6b7280;font-size:13px;">Hi ${name}, we've received your order.</p>
      </div>
    </div>

    <!-- Order ID badge -->
    <p style="margin:0 0 20px;">
      <strong>Order:</strong> &nbsp;
      <code style="background:#fdf2f8;padding:4px 12px;border-radius:6px;
                   color:#be185d;font-weight:700;font-size:15px;">
        ${ref}
      </code>
      &nbsp;&nbsp;
      ${badge('CONFIRMED', '#059669')}
    </p>

    <p style="margin:0 0 6px;color:#374151;font-size:14px;">
      <strong>Payment:</strong> &nbsp;
      ${((order.payment_method ?? 'N/A') as string).toUpperCase()} —
      ${badge(((order.payment_status ?? 'PENDING') as string).toUpperCase(), order.payment_status === 'paid' ? '#059669' : '#d97706')}
    </p>
    <p style="margin:0 0 20px;color:#374151;font-size:14px;">
      <strong>Shipping to:</strong> ${addr(order)}
    </p>

    <!-- Items table -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
      style="border:1px solid #f3f4f6;border-radius:10px;overflow:hidden;margin:0 0 16px;">
      <thead>
        <tr style="background:#fdf2f8;">
          <th style="padding:10px 12px;text-align:left;font-size:12px;
                     color:#9d174d;text-transform:uppercase;letter-spacing:0.5px;">Item</th>
          <th style="padding:10px 12px;text-align:center;font-size:12px;
                     color:#9d174d;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;
                     color:#9d174d;text-transform:uppercase;letter-spacing:0.5px;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr style="background:#f9fafb;">
          <td colspan="2" style="padding:12px;font-weight:700;font-size:15px;">Total</td>
          <td style="padding:12px;text-align:right;font-weight:700;font-size:15px;color:#be185d;">
            ${price(order.total_amount ?? 0)}
          </td>
        </tr>
      </tfoot>
    </table>

    ${btn(`${site}/order-success/${order.id}`, 'View Order Details')}
  `;

  return {
    subject: `✅ Order Confirmed — ${ref} | GiftsBhejo`,
    html: layout('Order Confirmed', `Your order ${ref} has been placed`, body, site),
    text: `Hi ${name}, your order ${ref} is confirmed. Total: ${price(order.total_amount ?? 0)}. View: ${site}/order-success/${order.id}`,
  };
}

// deno-lint-ignore no-explicit-any
function buildOrderShipped(order: any, siteUrl?: string) {
  const site = siteUrl ?? SITE_URL;
  const ref  = formatOrderId(order.id);
  const name = order.shipping_name ?? order.ecommerce_users?.name ?? 'Customer';
  const itemNames = (order.items ?? [])
    .map((i: Record<string, unknown>) => {
      const prod = i.ecommerce_products as Record<string, unknown> | undefined;
      return (prod?.name ?? 'Product') as string;
    })
    .slice(0, 3).join(', ');

  const body = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:52px;margin-bottom:12px;">🚚</div>
      <h2 style="margin:0 0 6px;color:#111827;font-size:22px;font-weight:700;">
        Your order is on the way!
      </h2>
      <p style="margin:0;color:#6b7280;font-size:14px;">
        Hi ${name}, great news — your order is heading to you.
      </p>
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
      style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;margin:0 0 24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 10px;font-weight:700;color:#1d4ed8;font-size:13px;
                    text-transform:uppercase;letter-spacing:0.8px;">
            📦 Shipment Details
          </p>
          <p style="margin:4px 0;font-size:14px;color:#374151;">
            <strong>Order:</strong>
            <code style="background:#dbeafe;padding:2px 8px;border-radius:4px;color:#1e40af;font-weight:700;">
              ${ref}
            </code>
            &nbsp; ${badge('SHIPPED', '#2563eb')}
          </p>
          <p style="margin:8px 0 0;font-size:14px;color:#374151;">
            <strong>Delivering to:</strong> ${addr(order)}
          </p>
          ${itemNames ? `<p style="margin:8px 0 0;font-size:13px;color:#6b7280;">
            <strong>Items:</strong> ${itemNames}${(order.items?.length ?? 0) > 3 ? ` + ${order.items.length - 3} more` : ''}
          </p>` : ''}
        </td>
      </tr>
    </table>

    <!-- Progress steps -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
      style="margin:0 0 24px;">
      <tr>
        <td style="text-align:center;padding:0 4px;">
          <div style="background:#d1fae5;border-radius:50%;width:36px;height:36px;
                      display:inline-flex;align-items:center;justify-content:center;
                      font-size:16px;margin-bottom:6px;">✅</div>
          <p style="margin:0;font-size:11px;color:#059669;font-weight:600;">Placed</p>
        </td>
        <td style="border-top:2px solid #d1fae5;vertical-align:middle;"></td>
        <td style="text-align:center;padding:0 4px;">
          <div style="background:#dbeafe;border-radius:50%;width:36px;height:36px;
                      display:inline-flex;align-items:center;justify-content:center;
                      font-size:16px;margin-bottom:6px;">🚚</div>
          <p style="margin:0;font-size:11px;color:#2563eb;font-weight:700;">Shipped</p>
        </td>
        <td style="border-top:2px dashed #e5e7eb;vertical-align:middle;"></td>
        <td style="text-align:center;padding:0 4px;">
          <div style="background:#f3f4f6;border-radius:50%;width:36px;height:36px;
                      display:inline-flex;align-items:center;justify-content:center;
                      font-size:16px;margin-bottom:6px;">🏠</div>
          <p style="margin:0;font-size:11px;color:#9ca3af;font-weight:600;">Delivered</p>
        </td>
      </tr>
    </table>

    ${btn(`${site}/dashboard`, 'Track My Order')}
  `;

  return {
    subject: `🚚 Shipped — ${ref} is on its way | GiftsBhejo`,
    html: layout('Order Shipped', `Order ${ref} is on its way to you`, body, site),
    text: `Hi ${name}, your order ${ref} has shipped. Track it: ${site}/dashboard`,
  };
}

// deno-lint-ignore no-explicit-any
function buildOrderDelivered(order: any, siteUrl?: string) {
  const site = siteUrl ?? SITE_URL;
  const ref  = formatOrderId(order.id);
  const name = order.shipping_name ?? order.ecommerce_users?.name ?? 'Customer';

  const body = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:56px;margin-bottom:12px;">🎉</div>
      <h2 style="margin:0 0 6px;color:#111827;font-size:22px;font-weight:700;">
        Order Delivered!
      </h2>
      <p style="margin:0;color:#6b7280;font-size:14px;">
        Hi ${name}, your gifts have arrived safely.
      </p>
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
      style="background:linear-gradient(135deg,#ecfdf5,#f0fdf4);
             border:1px solid #a7f3d0;border-radius:12px;margin:0 0 24px;">
      <tr>
        <td style="padding:20px 24px;text-align:center;">
          <p style="margin:0 0 6px;font-size:14px;color:#374151;">
            Order <code style="background:#d1fae5;padding:2px 8px;border-radius:4px;
                               color:#065f46;font-weight:700;">${ref}</code>
            &nbsp; ${badge('DELIVERED ✓', '#059669')}
          </p>
          <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">
            Delivered to: ${addr(order)}
          </p>
        </td>
      </tr>
    </table>

    <!-- Progress steps (all complete) -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
      style="margin:0 0 24px;">
      <tr>
        <td style="text-align:center;padding:0 4px;">
          <div style="background:#d1fae5;border-radius:50%;width:36px;height:36px;
                      display:inline-flex;align-items:center;justify-content:center;
                      font-size:16px;margin-bottom:6px;">✅</div>
          <p style="margin:0;font-size:11px;color:#059669;font-weight:600;">Placed</p>
        </td>
        <td style="border-top:2px solid #d1fae5;vertical-align:middle;"></td>
        <td style="text-align:center;padding:0 4px;">
          <div style="background:#d1fae5;border-radius:50%;width:36px;height:36px;
                      display:inline-flex;align-items:center;justify-content:center;
                      font-size:16px;margin-bottom:6px;">✅</div>
          <p style="margin:0;font-size:11px;color:#059669;font-weight:600;">Shipped</p>
        </td>
        <td style="border-top:2px solid #d1fae5;vertical-align:middle;"></td>
        <td style="text-align:center;padding:0 4px;">
          <div style="background:#d1fae5;border-radius:50%;width:36px;height:36px;
                      display:inline-flex;align-items:center;justify-content:center;
                      font-size:16px;margin-bottom:6px;">🎁</div>
          <p style="margin:0;font-size:11px;color:#059669;font-weight:700;">Delivered</p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
      style="background:#fdf2f8;border-radius:10px;margin:0 0 8px;">
      <tr>
        <td style="padding:16px 22px;text-align:center;">
          <p style="margin:0 0 4px;font-size:14px;color:#9d174d;font-weight:600;">
            Loved your gifts? We'd love to hear from you!
          </p>
          <p style="margin:0;font-size:13px;color:#6b7280;">
            Share your experience or shop for more amazing gifts.
          </p>
        </td>
      </tr>
    </table>

    ${btn(`${site}/products`, 'Shop More Gifts')}
  `;

  return {
    subject: `🎉 Delivered — ${ref} has arrived | GiftsBhejo`,
    html: layout('Order Delivered', `Your order ${ref} was delivered successfully`, body, site),
    text: `Hi ${name}, your order ${ref} has been delivered. Shop again: ${site}/products`,
  };
}

// ─── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  // Health check
  if (req.method === 'GET') {
    return json({
      ok: true,
      service: 'send-email edge function',
      env: {
        RESEND_API_KEY: !!RESEND_API_KEY,
        SUPABASE_URL: !!SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_KEY,
        SITE_URL,
      },
    });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { type, siteUrl } = body as { type?: string; siteUrl?: string };
  const site = siteUrl ?? SITE_URL;

  if (!type) return json({ error: 'type is required' }, 400);

  console.log(`send-email called: type=${type}`);

  try {
    let to: string;
    let subject: string;
    let html: string;
    let text: string;

    switch (type) {
      case 'welcome': {
        const { name, email, password } = body as {
          name?: string; email?: string; password?: string;
        };
        if (!email || !password) {
          return json({ error: 'email and password are required for welcome email' }, 400);
        }
        to = email;
        const tpl = buildWelcome({
          name: name ?? email.split('@')[0],
          email,
          password,
          siteUrl: site,
        });
        subject = tpl.subject; html = tpl.html; text = tpl.text;
        break;
      }

      case 'order_placed':
      case 'order_shipped':
      case 'order_delivered': {
        const { orderId } = body as { orderId?: string };
        if (!orderId) return json({ error: 'orderId is required' }, 400);

        const order = await fetchOrder(orderId);
        const recipient = order.shipping_email ?? order.ecommerce_users?.email;
        if (!recipient) return json({ error: 'No recipient email found for this order' }, 400);
        to = recipient;

        const tpl =
          type === 'order_placed'   ? buildOrderPlaced(order, site)
        : type === 'order_shipped'  ? buildOrderShipped(order, site)
        :                             buildOrderDelivered(order, site);

        subject = tpl.subject; html = tpl.html; text = tpl.text;
        break;
      }

      default:
        return json({ error: `Unknown email type: ${type}` }, 400);
    }

    const result = await sendEmail(to, subject, html, text);
    return json({ success: true, id: result?.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('send-email error:', msg);
    return json({ error: msg }, 500);
  }
});
