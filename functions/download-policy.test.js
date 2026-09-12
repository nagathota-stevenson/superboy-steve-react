import test from 'node:test';
import assert from 'node:assert/strict';
import { downloadEligible } from './payment-policy.js';

test('only successful unrefunded payments permit new download links', () => {
 const paid = {status:'succeeded',latest_charge:{paid:true,refunded:false,amount_refunded:0}};
 assert.equal(downloadEligible(paid), true);
 assert.equal(downloadEligible({...paid,latest_charge:{...paid.latest_charge,refunded:true}}), false);
 assert.equal(downloadEligible({...paid,latest_charge:{...paid.latest_charge,amount_refunded:1}}), false);
 assert.equal(downloadEligible({...paid,status:'processing'}), false);
 assert.equal(downloadEligible({...paid,latest_charge:null}), false);
 assert.equal(downloadEligible({...paid,latest_charge:'ch_unexpanded'}), false);
});
