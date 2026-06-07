const API_SECRET = import.meta.env.VITE_EMAIL_API_SECRET;

function getSiteUrl() {
  return (
    import.meta.env.VITE_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  );
}

async function sendEmail(type, payload = {}) {
  if (!API_SECRET) {
    console.warn('VITE_EMAIL_API_SECRET is not configured — skipping email');
    return { success: false, skipped: true };
  }

  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_SECRET}`,
      },
      body: JSON.stringify({
        type,
        siteUrl: getSiteUrl(),
        ...payload,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Email API error (${response.status})`);
    }

    return await response.json();
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
