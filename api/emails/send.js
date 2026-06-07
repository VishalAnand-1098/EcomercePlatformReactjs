import { Resend } from 'resend';
import { fetchOrderForEmail } from './utils/supabaseAdmin.js';
import { getRecipientEmail } from './utils/formatOrder.js';
import { buildWelcomeEmail } from './templates/welcome.js';
import { buildOrderPlacedEmail } from './templates/orderPlaced.js';
import { buildOrderShippedEmail } from './templates/orderShipped.js';
import { buildOrderDeliveredEmail } from './templates/orderDelivered.js';

function getSiteUrl(body) {
  return (
    body.siteUrl ||
    process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    'https://ecommerce-platform-reactjs.vercel.app'
  );
}

function verifyAuth(req) {
  const secret = process.env.EMAIL_API_SECRET;
  if (!secret) return false;

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  return token === secret;
}

async function sendWithResend({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'GiftsBhejo <onboarding@resend.dev>';

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html,
    text,
  });

  if (error) throw error;
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { type } = body;
    const siteUrl = getSiteUrl(body);

    if (!type) {
      return res.status(400).json({ error: 'Email type is required' });
    }

    let emailContent;
    let recipient;

    switch (type) {
      case 'welcome': {
        const { name, email, password } = body;
        if (!name || !email || !password) {
          return res.status(400).json({ error: 'name, email, and password are required' });
        }
        recipient = email;
        emailContent = buildWelcomeEmail({ name, email, password, siteUrl });
        break;
      }

      case 'order_placed':
      case 'order_shipped':
      case 'order_delivered': {
        const { orderId } = body;
        if (!orderId) {
          return res.status(400).json({ error: 'orderId is required' });
        }

        const order = await fetchOrderForEmail(orderId);
        recipient = getRecipientEmail(order);

        if (!recipient) {
          return res.status(400).json({ error: 'No recipient email found for this order' });
        }

        if (type === 'order_placed') {
          emailContent = buildOrderPlacedEmail(order, siteUrl);
        } else if (type === 'order_shipped') {
          emailContent = buildOrderShippedEmail(order, siteUrl);
        } else {
          emailContent = buildOrderDeliveredEmail(order, siteUrl);
        }
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown email type: ${type}` });
    }

    const result = await sendWithResend({
      to: recipient,
      ...emailContent,
    });

    return res.status(200).json({ success: true, id: result?.id });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to send email',
    });
  }
}
