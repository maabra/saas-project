// Deliberately broken exercises. Fix these functions, then run:
// node --test tests/lab-exercises.test.cjs
// Failures are expected until you implement each repair. No production data is used.
function invoiceTotal(unitPrice, seats) {
  return Math.trunc(unitPrice) * seats;
}
function findTenantTask(rows, id, tenant) {
  return rows.find(row => row.id === id);
}
function chargedTotal(requests) {
  return requests.reduce((total, request) => total + request.amount, 0);
}
function lunarMonth(month, offset) {
  return ((month - 1 + offset) % 12) + 1;
}
// CPaaS exercises use simplified fixtures, not a live messaging provider.
function uniqueMessages(messages) {
  return messages;
}
function deliveryStatus(events) {
  return events.at(-1) || 'queued';
}
function smsSegments(septets) {
  return Math.ceil(septets / 160);
}
// New course exercises are deliberately broken too.
function canInvite(count, limit) { return count <= limit; }
function pageItems(items, page, size) { return items.slice(0, size); }
function canDelete(user, tenant) { return !!user; }
function formatRecipient(value) { return '+' + value; }
function retryDelay(local, provider) { return local; }
function allowedMessages(messages, suppressions) { return messages; }
if (typeof module !== 'undefined') module.exports = { invoiceTotal, findTenantTask, chargedTotal, lunarMonth, uniqueMessages, deliveryStatus, smsSegments, canInvite, pageItems, canDelete, formatRecipient, retryDelay, allowedMessages };
