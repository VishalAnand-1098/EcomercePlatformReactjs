export function formatPrice(amount, currency = 'INR') {
  const value = Number(amount) || 0;
  if (currency === 'INR') {
    return `₹${value.toFixed(2)}`;
  }
  return `$${value.toFixed(2)}`;
}

export function shortOrderId(orderId) {
  if (!orderId) return '';
  return String(orderId).slice(0, 8).toUpperCase();
}

export function formatShippingAddress(order) {
  const parts = [
    order.shipping_address,
    order.shipping_city,
    order.shipping_state,
    order.shipping_zipcode,
    order.shipping_country,
  ].filter(Boolean);

  return parts.join(', ') || 'Not provided';
}

export function getRecipientEmail(order) {
  return (
    order.shipping_email ||
    order.ecommerce_users?.email ||
    null
  );
}

export function getRecipientName(order) {
  return (
    order.shipping_name ||
    order.ecommerce_users?.name ||
    'Customer'
  );
}

export function buildOrderItemsHtml(items, currency = 'INR') {
  if (!items?.length) {
    return '<p>No items found for this order.</p>';
  }

  const rows = items
    .map((item) => {
      const name = item.ecommerce_products?.name || 'Product';
      const qty = item.quantity || 1;
      const lineTotal = formatPrice((item.price || 0) * qty, currency);
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${qty}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${lineTotal}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px 12px;text-align:left;">Item</th>
          <th style="padding:8px 12px;text-align:center;">Qty</th>
          <th style="padding:8px 12px;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

export function buildOrderSummaryHtml(order, currency = 'INR') {
  return `
    <table style="width:100%;max-width:400px;margin-top:12px;">
      <tr><td style="padding:4px 0;">Subtotal</td><td style="text-align:right;">${formatPrice(order.subtotal, currency)}</td></tr>
      <tr><td style="padding:4px 0;">Tax</td><td style="text-align:right;">${formatPrice(order.tax_amount, currency)}</td></tr>
      <tr><td style="padding:4px 0;">Shipping</td><td style="text-align:right;">${formatPrice(order.shipping_amount, currency)}</td></tr>
      ${Number(order.discount_amount) > 0 ? `<tr><td style="padding:4px 0;">Discount</td><td style="text-align:right;">-${formatPrice(order.discount_amount, currency)}</td></tr>` : ''}
      <tr style="font-weight:bold;font-size:16px;">
        <td style="padding:8px 0;border-top:1px solid #eee;">Total</td>
        <td style="text-align:right;padding:8px 0;border-top:1px solid #eee;">${formatPrice(order.total_amount, currency)}</td>
      </tr>
    </table>
  `;
}
