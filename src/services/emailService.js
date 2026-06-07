// Calls the Supabase Edge Function `send-email`
// Deployed at: https://<project>.supabase.co/functions/v1/send-email
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const EDGE_FN_URL  = `${SUPABASE_URL}/functions/v1/send-email`;

function getSiteUrl() {
  return (
    import.meta.env.VITE_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  );
}

async function sendEmail(type, payload = {}) {
  if (!SUPABASE_URL) {
    console.error('VITE_SUPABASE_URL is not set — email API will not work.');
    return { success: false, error: 'VITE_SUPABASE_URL is not configured' };
  }

  const body = { type, siteUrl: getSiteUrl(), ...payload };
  console.log('Calling Edge Function…', { type, url: EDGE_FN_URL });

  try {
    const response = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    console.log('Edge Function response status:', response.status);

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { error: text }; }

    console.log('Edge Function response body:', data);

    if (!response.ok) {
      throw new Error(data?.error ?? `Edge Function error (${response.status})`);
    }
    return { success: true, ...data };
  } catch (err) {
    console.error(`Failed to send ${type} email:`, err);
    return { success: false, error: err.message };
  }
}

export const sendWelcomeEmail      = ({ name, email, password }) =>
  sendEmail('welcome', { name, email, password });

export const sendOrderPlacedEmail   = (orderId) =>
  sendEmail('order_placed', { orderId });

export const sendOrderShippedEmail  = (orderId) =>
  sendEmail('order_shipped', { orderId });

export const sendOrderDeliveredEmail = (orderId) =>
  sendEmail('order_delivered', { orderId });
