export function emailLayout({ title, preheader, bodyHtml, siteUrl }) {
  const year = new Date().getFullYear();
  const site = siteUrl || 'https://giftsbhejo.com';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <span style="display:none;max-height:0;overflow:hidden;">${preheader || title}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#ec4899,#be185d);padding:24px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;">GiftsBhejo</h1>
              <p style="margin:8px 0 0;color:#fce7f3;font-size:14px;">Delivering Love &amp; Joy</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;background:#f9fafb;text-align:center;font-size:12px;color:#6b7280;">
              <p style="margin:0 0 8px;">© ${year} GiftsBhejo. All rights reserved.</p>
              <p style="margin:0;"><a href="${site}" style="color:#db2777;text-decoration:none;">Visit GiftsBhejo</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function buttonHtml(href, label) {
  return `
    <p style="text-align:center;margin:28px 0;">
      <a href="${href}" style="display:inline-block;background:#db2777;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:bold;">
        ${label}
      </a>
    </p>
  `;
}
