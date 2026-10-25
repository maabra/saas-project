/* Shared by the browser lab and Node tests. No eval or user-code execution. */
(function (root) {
  'use strict';
  const missions = [
    { id: 'money', title: 'The disappearing invoice cents', category: 'Billing · realistic', minutes: 8, symptom: 'A customer buys 3 seats at €19.99. The invoice asks for €57 instead of €59.97.', evidence: 'Support: “Our invoice is lower than the checkout.”\nInput: unitPrice=19.99, seats=3\nObserved total: 57', file: 'lab-fixes.js → invoiceTotal', hint: 'Convert to integer cents before multiplication. Round only at the currency boundary.', options: ['Truncate each seat price', 'Calculate in integer cents', 'Round the total to whole euros'], correct: 1, cases: [[19.99, 3, 59.97], [0.1, 3, 0.3], [12.5, 0, 0]], kind: 'money' },
    { id: 'access', title: 'A tenant sees someone else’s tasks', category: 'Access control · realistic', minutes: 12, symptom: 'Two companies share a task ID. A lookup returns the first match regardless of company.', evidence: 'Signed-in tenant: north\nRows: task 7 / south / “Private roadmap”; task 7 / north / “Our launch”\nObserved: “Private roadmap”', file: 'lab-fixes.js → findTenantTask', hint: 'Identity and tenant must both match. Missing tenants should return no task.', options: ['Match the task ID only', 'Match the tenant only', 'Match both task ID and tenant'], correct: 2, cases: [], kind: 'access' },
    { id: 'retry', title: 'One checkout, three charges', category: 'Reliability · realistic', minutes: 10, symptom: 'A connection drops after payment. Retrying the same request charges the customer again.', evidence: 'request IDs: pay-42, pay-42, pay-43\nAmounts: 20, 20, 5\nObserved charged total: 45; expected: 25', file: 'lab-fixes.js → chargedTotal', hint: 'Remember each successful request ID. Different IDs may have the same amount.', options: ['Charge every incoming request', 'Deduplicate by request ID', 'Deduplicate by amount'], correct: 1, cases: [], kind: 'retry' },
    { id: 'moon', title: 'The lunar billing department', category: 'Bonus · deliberately unrealistic', bonus: true, minutes: 15, symptom: 'A fictional lunar client has 13 months per year. Your renewal calculator silently wraps after month 12.', evidence: 'Fictional calendar: 13 months, numbered 1–13\nMonth 13 + 1 → month 1\nMonth 12 + 1 → month 13 (currently 1)', file: 'lab-fixes.js → lunarMonth', hint: 'Use the fictional calendar’s modulus. This exercise is not Earth date handling.', options: ['Wrap at 12', 'Wrap at 13', 'Clamp at 13 forever'], correct: 1, cases: [], kind: 'moon' }
  ];
  function run(mission, choice) {
    const m = typeof mission === 'string' ? missions.find(x => x.id === mission) : mission;
    if (!m) throw new Error('Unknown mission');
    let tests;
    if (m.kind === 'money') {
      const calculate = [
        (price, seats) => Math.trunc(price) * seats,
        (price, seats) => Math.round(price * 100) * seats / 100,
        (price, seats) => Math.round(price * seats)
      ][choice];
      tests = m.cases.map(([price, seats, expected]) => ({ name: `${seats} x ${price} = ${expected}`, actual: calculate(price, seats), expected }));
    } else if (m.kind === 'access') {
      const rows = [{ id: 7, tenant: 'south', title: 'Private roadmap' }, { id: 8, tenant: 'north', title: 'Wrong ID' }, { id: 7, tenant: 'north', title: 'Our launch' }];
      const lookup = (id, tenant) => rows.find(row => choice === 0 ? row.id === id : choice === 1 ? row.tenant === tenant : row.id === id && row.tenant === tenant)?.title ?? null;
      tests = [
        { name: 'Same ID, correct tenant', actual: lookup(7, 'north'), expected: 'Our launch' },
        { name: 'Unknown tenant gets no record', actual: lookup(7, 'unknown'), expected: null },
        { name: 'Unknown ID gets no record', actual: lookup(99, 'north'), expected: null }
      ];
    } else if (m.kind === 'retry') {
      const charge = requests => {
        const seen = new Set();
        return requests.reduce((total, request) => {
          const key = choice === 2 ? request.amount : request.id;
          if (choice !== 0 && seen.has(key)) return total;
          seen.add(key);
          return total + request.amount;
        }, 0);
      };
      tests = [
        { name: 'Repeated ID charges once', actual: charge([{ id: 'a', amount: 20 }, { id: 'a', amount: 20 }, { id: 'b', amount: 5 }]), expected: 25 },
        { name: 'Different IDs, same amount both charge', actual: charge([{ id: 'a', amount: 20 }, { id: 'b', amount: 20 }]), expected: 40 },
        { name: 'Empty batch charges zero', actual: charge([]), expected: 0 }
      ];
    } else {
      const month = (start, offset) => choice === 2 ? Math.min(start + offset, 13) : ((start - 1 + offset) % (choice === 0 ? 12 : 13)) + 1;
      tests = [
        { name: 'Month 12 + 1 = 13', actual: month(12, 1), expected: 13 },
        { name: 'Month 13 + 1 = 1', actual: month(13, 1), expected: 1 },
        { name: 'Month 1 + 26 = 1', actual: month(1, 26), expected: 1 }
      ];
    }
    return tests.map(t => ({ ...t, pass: t.actual === t.expected }));
  }
  function review({ tests, diagnosis, verification, reply, seconds, minutes, hints }) {
    const checks = tests.filter(t => t.pass).length / tests.length;
    const specific = text => text.trim().split(/\s+/).filter(Boolean).length >= 12;
    const reasoning = (specific(diagnosis) ? 10 : 0) + (/because|caus|instead|when|due to/i.test(diagnosis) ? 5 : 0);
    const evidence = (specific(verification) ? 5 : 0) + (/test|assert|expected|regression/i.test(verification) ? 5 : 0) + (/edge|empty|zero|unknown|duplicate|boundary/i.test(verification) ? 5 : 0);
    const communication = (specific(reply) ? 5 : 0) + (/impact|customer|affected|charge|invoice|task|renewal/i.test(reply) ? 5 : 0) + (/next|monitor|follow|check|update/i.test(reply) ? 5 : 0);
    const speed = checks === 1 ? (seconds <= minutes * 60 ? 5 : 3) : 0;
    const score = Math.round(checks * 50 + reasoning + evidence + communication + speed);
    const advice = [];
    if (checks < 1) advice.push('Reproduce the failed case before changing the fix. Compare actual and expected output.');
    if (reasoning < 15) advice.push('Explain the causal chain: which input triggered the bug, why the old behavior failed, and why the fix addresses it.');
    if (evidence < 15) advice.push('Name a regression test with exact expected output and one boundary or negative case.');
    if (communication < 15) advice.push('Tell the customer what was affected, what changed, and when you will check or update them next.');
    if (seconds > minutes * 60) advice.push('Try a smaller investigation loop next time: reproduce → isolate one hypothesis → test. Taking time is fine; correctness carries more weight.');
    if (hints) advice.push('You used a hint. Revisit this incident tomorrow without it to test recall. Hints do not reduce your score.');
    if (!advice.length) advice.push('Strong evidence across the rubric. Next, implement the fix in lab-fixes.js and add another regression case.');
    return { score, breakdown: { correctness: Math.round(checks * 50), reasoning, verification: evidence, communication, speed }, advice };
  }
  const api = { missions, run, review };
  if (typeof module !== 'undefined') module.exports = api;
  root.OrbitLab = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
