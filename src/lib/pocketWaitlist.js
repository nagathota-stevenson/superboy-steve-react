export const POCKET_DATABASE_URL = 'https://superboysteve-e6cea-default-rtdb.firebaseio.com';

export async function joinPocketWaitlist(value) {
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email');
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email));
  const id = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
  // Stable IDs make retries idempotent. Database rules prevent reads and email changes.
  const response = await fetch(`${POCKET_DATABASE_URL}/pocketWaitlist/${id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({ email, source: 'pocket-website', consent: true, consentVersion: '2026-09-09', subscribedAt: { '.sv': 'timestamp' } }),
  });
  if (!response.ok) throw new Error('Unable to save signup');
}
