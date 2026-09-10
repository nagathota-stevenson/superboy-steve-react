import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { joinPocketWaitlist, POCKET_DATABASE_URL } from '../src/lib/pocketWaitlist.js';
const email = process.env.POCKET_TEST_EMAIL;
if (!email || !email.endsWith('@example.invalid')) throw new Error('Set POCKET_TEST_EMAIL to a reserved @example.invalid test address.');
const id = createHash('sha256').update(email).digest('hex');
const url = `${POCKET_DATABASE_URL}/pocketWaitlist/${id}.json`;
const body = {email,source:'pocket-website',consent:true,consentVersion:'2026-09-09',subscribedAt:{'.sv':'timestamp'}};
async function denied(method, data, endpoint = url) {
  const response = await fetch(endpoint, {method,headers:{'Content-Type':'application/json'},...(data ? {body:JSON.stringify(data)} : {})});
  assert.equal(response.status, 401, await response.text());
}
await assert.rejects(joinPocketWaitlist('invalid-email'), /Invalid email/);
await joinPocketWaitlist(email);
console.log('PASS: valid signup saved');
await joinPocketWaitlist(`  ${email.toUpperCase()}  `);
console.log('PASS: repeat signup normalized and accepted');
await denied('GET');
await denied('GET', null, `${POCKET_DATABASE_URL}/pocketWaitlist.json`);
console.log('PASS: public email reads and list reads denied');
await denied('PUT', {...body,consent:false});
await denied('PUT', {...body,email:'bad-email'});
await denied('PUT', {...body,email:'different@example.invalid'});
await denied('PUT', {...body,admin:true});
await denied('DELETE');
console.log('PASS: invalid data, consent removal, email changes, extra fields, and public deletion denied');
console.log(`Cleanup path: /pocketWaitlist/${id}`);
