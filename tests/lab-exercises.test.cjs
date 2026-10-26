const { test } = require('node:test');
const assert = require('node:assert/strict');
const fixes = require('../lab-fixes.js');
test('billing preserves cents, fractional prices, and zero seats', () => {
  assert.equal(fixes.invoiceTotal(19.99, 3), 59.97);
  assert.equal(fixes.invoiceTotal(0.1, 3), 0.3);
  assert.equal(fixes.invoiceTotal(12.5, 0), 0);
});
test('task lookup isolates tenants and rejects unknown IDs or tenants', () => {
  const rows = [{ id: 7, tenant: 'south' }, { id: 8, tenant: 'north' }, { id: 7, tenant: 'north' }];
  assert.equal(fixes.findTenantTask(rows, 7, 'north'), rows[2]);
  assert.equal(fixes.findTenantTask(rows, 7, 'unknown'), undefined);
  assert.equal(fixes.findTenantTask(rows, 99, 'north'), undefined);
});
test('payment retries deduplicate IDs, not amounts', () => {
  assert.equal(fixes.chargedTotal([{ id: 'a', amount: 20 }, { id: 'a', amount: 20 }, { id: 'b', amount: 5 }]), 25);
  assert.equal(fixes.chargedTotal([{ id: 'a', amount: 20 }, { id: 'b', amount: 20 }]), 40);
  assert.equal(fixes.chargedTotal([]), 0);
});
test('OPTIONAL BONUS: fictional lunar calendar wraps at 13', () => {
  assert.equal(fixes.lunarMonth(12, 1), 13);
  assert.equal(fixes.lunarMonth(13, 1), 1);
  assert.equal(fixes.lunarMonth(1, 26), 1);
});

// These also intentionally fail until the corresponding CPaaS exercises are repaired.
test('CPaaS: message retries isolate tenant keys and retain distinct requests', () => {
  const a = { tenant: 'north', id: 'a', to: '+15550100' };
  assert.deepEqual(fixes.uniqueMessages([a, a]), [a]);
  const b = { ...a, id: 'b' }, c = { ...a, tenant: 'south' };
  assert.deepEqual(fixes.uniqueMessages([a, b, c]), [a, b, c]);
  assert.deepEqual(fixes.uniqueMessages([]), []);
});
test('CPaaS: late, duplicate and unknown callbacks preserve delivery progress', () => {
  assert.equal(fixes.deliveryStatus(['sent', 'delivered', 'sent']), 'delivered');
  assert.equal(fixes.deliveryStatus(['sent', 'sent', 'unknown']), 'sent');
  assert.equal(fixes.deliveryStatus([]), 'queued');
});
test('CPaaS: simplified GSM-7 septet counts respect multipart boundaries', () => {
  [0, 1, 160, 161, 306, 307, 320].forEach((n, i) => {
    assert.equal(fixes.smsSegments(n), [0, 1, 1, 2, 2, 3, 3][i]);
  });
});
