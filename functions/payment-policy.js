export const PRODUCT = 'pocket-macos';
export const AMOUNT = 1999;
export function paidSession(s, live) {
 return s?.mode === 'payment' && s.payment_status === 'paid' && s.amount_total === AMOUNT
  && s.currency === 'usd' && s.livemode === live && s.metadata?.product === PRODUCT
  && /^[a-f0-9]{64}$/.test(s.metadata?.order_id || '') && typeof s.customer_details?.email === 'string';
}

