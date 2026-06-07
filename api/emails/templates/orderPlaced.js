import { emailLayout, buttonHtml } from './layout.js';
import {
  shortOrderId,
  formatShippingAddress,
  buildOrderItemsHtml,
  buildOrderSummaryHtml,
  getRecipientName,
} from '../utils/formatOrder.js';

export function buildOrderPlacedEmail(order, siteUrl) {
  const currency = order.payment_method === 'card' ? 'INR' : 'INR';
  const orderRef = shortOrderId(order.id);
  const name = getRecipientName(order);
  const successUrl = `${siteUrl}/order-success/${order.id}`;

  const bodyHtml = `
    <h2 style="margin:0 0 16px;color:#111827;">Order Confirmed!</h2>
    <p style="line-height:1.6;color:#374151;">
      Hi ${name}, thank you for your order. We have received it and will process it shortly.
    </p>
    <p style="margin:16px 0;"><strong>Order ID:</strong> #${orderRef}</p>
    <p style="margin:0 0 8px;"><strong>Payment:</strong> ${(order.payment_method || 'N/A').toUpperCase()} — ${(order.payment_status || 'pending').toUpperCase()}</p>
    <p style="margin:0 0 16px;"><strong>Shipping to:</strong> ${formatShippingAddress(order)}</p>
    ${buildOrderItemsHtml(order.items, currency)}
    ${buildOrderSummaryHtml(order, currency)}
    ${buttonHtml(successUrl, 'View Order Details')}
  `;

  return {
    subject: `Order confirmed — #${orderRef}`,
    html: emailLayout({
      title: 'Order Confirmed',
      preheader: `Your GiftsBhejo order #${orderRef} has been placed`,
      bodyHtml,
      siteUrl,
    }),
    text: `Hi ${name}, your order #${orderRef} has been confirmed. Total: ${order.total_amount}. View: ${successUrl}`,
  };
}
