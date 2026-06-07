import { emailLayout, buttonHtml } from './layout.js';
import {
  shortOrderId,
  buildOrderItemsHtml,
  getRecipientName,
} from '../utils/formatOrder.js';

export function buildOrderDeliveredEmail(order, siteUrl) {
  const orderRef = shortOrderId(order.id);
  const name = getRecipientName(order);
  const productsUrl = `${siteUrl}/products`;

  const bodyHtml = `
    <h2 style="margin:0 0 16px;color:#111827;">Order Delivered!</h2>
    <p style="line-height:1.6;color:#374151;">
      Hi ${name}, your order <strong>#${orderRef}</strong> has been delivered. We hope you love your gifts!
    </p>
    ${buildOrderItemsHtml(order.items)}
    <p style="line-height:1.6;color:#374151;">
      Thank you for shopping with GiftsBhejo. We'd love to see you again soon.
    </p>
    ${buttonHtml(productsUrl, 'Shop Again')}
  `;

  return {
    subject: `Your order has been delivered — #${orderRef}`,
    html: emailLayout({
      title: 'Order Delivered',
      preheader: `Order #${orderRef} was delivered successfully`,
      bodyHtml,
      siteUrl,
    }),
    text: `Hi ${name}, your order #${orderRef} has been delivered. Shop again: ${productsUrl}`,
  };
}
