import { emailLayout, buttonHtml } from './layout.js';

export function buildWelcomeEmail({ name, email, password, siteUrl }) {
  const loginUrl = `${siteUrl}/login`;

  const bodyHtml = `
    <h2 style="margin:0 0 16px;color:#111827;">Welcome, ${name}!</h2>
    <p style="line-height:1.6;color:#374151;">
      Thank you for creating your GiftsBhejo account. You can now browse gifts, place orders, and track deliveries.
    </p>
    <div style="background:#fdf2f8;border:1px solid #fbcfe8;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0 0 8px;font-weight:bold;color:#9d174d;">Your login details</p>
      <p style="margin:4px 0;color:#374151;"><strong>Email:</strong> ${email}</p>
      <p style="margin:4px 0;color:#374151;"><strong>Password:</strong> ${password}</p>
    </div>
    <p style="line-height:1.6;color:#6b7280;font-size:13px;">
      For your security, please keep this email private and consider changing your password after your first login.
    </p>
    ${buttonHtml(loginUrl, 'Login to Your Account')}
  `;

  return {
    subject: 'Welcome to GiftsBhejo!',
    html: emailLayout({
      title: 'Welcome to GiftsBhejo',
      preheader: 'Your account has been created successfully',
      bodyHtml,
      siteUrl,
    }),
    text: `Welcome to GiftsBhejo, ${name}!\n\nEmail: ${email}\nPassword: ${password}\n\nLogin: ${loginUrl}`,
  };
}
