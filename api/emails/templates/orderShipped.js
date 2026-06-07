import { emailLayout, buttonHtml } from './layout.js';
import {
  shortOrderId,
  formatShippingAddress,
  buildOrderItemsHtml,
  getRecipientName,
} from '../utils/formatOrder.js';

export function buildOrderShippedEmail(order, siteUrl) {
  const orderRef = shortOrderId(order.id);
  const name = getRecipientName(order);
  const dashboardUrl = `${siteUrl}/dashboard`;

  const bodyHtml = `
    <h2 style="margin:0 0 16px;color:#111827;">Your order is on the way!</h2>
    <p style="line-height:1.6;color:#374151;">
      Hi ${name}, great news — your order <strong>#${orderRef}</strong> has been shipped and is heading to you.
    </p>
    <p style="margin:16px 0;"><strong>Delivery address:</strong> ${formatShippingAddress(order)}</p>
    ${buildOrderItemsHtml(order.items)}
    ${buttonHtml(dashboardUrl, 'Track Your Orders')}
  `;

  return {
    subject: `Your order has shipped — #${orderRef}`,
    html: emailLayout({
      title: 'Order Shipped',
      preheader: `Order #${orderRef} is on its way`,
      bodyHtml,
      siteUrl,
    }),
    text: `Hi ${name}, your order #${orderRef} has been shipped. Track: ${dashboardUrl}`,
  };
}
