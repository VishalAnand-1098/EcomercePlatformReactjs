const API_SECRET = import.meta.env.VITE_EMAIL_API_SECRET;

function getSiteUrl() {
  return (
    import.meta.env.VITE_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  );
}

async function sendEmail(type, payload = {}) {
  const body = {
    type,
    siteUrl: getSiteUrl(),
    ...payload,
  };

  if (!API_SECRET) {
    console.error(
      'VITE_EMAIL_API_SECRET is not set — email API will not authenticate. ' +
        'Add VITE_EMAIL_API_SECRET to .env (local) and Vercel env vars (production).'
    );
  }

  console.log('Calling email API...', { type, url: '/api/emails/send' });

  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: API_SECRET || '',
      },
      body: JSON.stringify(body),
    });

    console.log('Email API response status:', response.status);

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: responseText };
    }
    console.log('Email API response body:', data);

    if (!response.ok) {
      throw new Error(data?.error || `Email API error (${response.status})`);
    }

    return { success: true, ...data };
  } catch (error) {
    console.error(`Failed to send ${type} email:`, error);
    return { success: false, error: error.message };
  }
}

export const sendWelcomeEmail = ({ name, email, password }) =>
  sendEmail('welcome', { name, email, password });

export const sendOrderPlacedEmail = (orderId) =>
  sendEmail('order_placed', { orderId });

export const sendOrderShippedEmail = (orderId) =>
  sendEmail('order_shipped', { orderId });

export const sendOrderDeliveredEmail = (orderId) =>
  sendEmail('order_delivered', { orderId });
