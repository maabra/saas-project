/* Shared by the browser lab and Node tests. No eval or user-code execution. */
(function (root) {
  'use strict';
  const missions = [
    { id: 'money', title: 'The disappearing invoice cents', category: 'Billing · realistic', minutes: 8, symptom: 'A customer buys 3 seats at €19.99. The invoice asks for €57 instead of €59.97.', evidence: 'Support: “Our invoice is lower than the checkout.”\nInput: unitPrice=19.99, seats=3\nObserved total: 57', file: 'lab-fixes.js → invoiceTotal', hint: 'Convert to integer cents before multiplication. Round only at the currency boundary.', options: ['Truncate each seat price', 'Calculate in integer cents', 'Round the total to whole euros'], correct: 1, cases: [[19.99, 3, 59.97], [0.1, 3, 0.3], [12.5, 0, 0]], kind: 'money' },
    { id: 'access', title: 'A tenant sees someone else’s tasks', category: 'Access control · realistic', minutes: 12, symptom: 'Two companies share a task ID. A lookup returns the first match regardless of company.', evidence: 'Signed-in tenant: north\nRows: task 7 / south / “Private roadmap”; task 7 / north / “Our launch”\nObserved: “Private roadmap”', file: 'lab-fixes.js → findTenantTask', hint: 'Identity and tenant must both match. Missing tenants should return no task.', options: ['Match the task ID only', 'Match the tenant only', 'Match both task ID and tenant'], correct: 2, cases: [], kind: 'access' },
    { id: 'retry', title: 'One checkout, three charges', category: 'Reliability · realistic', minutes: 10, symptom: 'A connection drops after payment. Retrying the same request charges the customer again.', evidence: 'request IDs: pay-42, pay-42, pay-43\nAmounts: 20, 20, 5\nObserved charged total: 45; expected: 25', file: 'lab-fixes.js → chargedTotal', hint: 'Remember each successful request ID. Different IDs may have the same amount.', options: ['Charge every incoming request', 'Deduplicate by request ID', 'Deduplicate by amount'], correct: 1, cases: [], kind: 'retry' },
    { id: 'sms-retry', track: 'cpaas', title: 'One notification, three texts', category: 'CPaaS / Message retries', minutes: 10, symptom: 'A timeout triggers retries and the recipient gets the same notification twice.', evidence: 'tenant / request / recipient\nnorth / msg-42 / +15550100\nnorth / msg-42 / +15550100\nsouth / msg-42 / +15550200\nExpected: two sends, one per tenant request', file: 'lab-fixes.js / uniqueMessages', hint: 'Scope the idempotency key to the tenant and request. A recipient can receive multiple legitimate messages.', options: ['Send every retry', 'Deduplicate by tenant and request ID', 'Deduplicate by recipient'], correct: 1, kind: 'sms-retry' },
    { id: 'delivery', track: 'cpaas', title: 'Delivered becomes sent again', category: 'CPaaS / Delivery callbacks', minutes: 10, symptom: 'A delayed sent callback overwrites delivered in a simplified provider status stream.', evidence: 'Callbacks: queued -> sent -> delivered -> sent\nObserved final status: sent\nFixture contract: queued < sent < delivered; callbacks may repeat or arrive late.', file: 'lab-fixes.js / deliveryStatus', hint: 'For this simplified successful-delivery stream, retain the highest known state and ignore unknown statuses. Real providers can have other terminal states.', options: ['Always use the latest callback', 'Keep the furthest known delivery state', 'Always return delivered'], correct: 1, kind: 'delivery' },
    { id: 'segments', track: 'cpaas', title: 'The SMS segment estimate is too low', category: 'CPaaS / Segment accounting', minutes: 8, symptom: 'A simplified GSM-7 estimator counts a 161-septet message as one SMS segment.', evidence: 'Fixture input is already counted in GSM-7 septets.\nSingle segment capacity: 160; multipart capacity: 153 per segment.\n161 septets -> 2 segments; 307 -> 3.\nUnicode encoding and GSM extension character counting are outside this fixture.', file: 'lab-fixes.js / smsSegments', hint: 'Use 160 only for a single segment; once multipart, divide the entire count by 153 and round up. Empty content uses zero.', options: ['Divide by 160 and round down', 'Use 160 for single, 153 for multipart', 'Use 160 for every segment'], correct: 1, kind: 'segments' },
    { id: 'seats', track: 'saas', difficulty: 'beginner', title: 'The last seat disappears', category: 'SaaS / Plan limits', minutes: 6, symptom: 'A team with four members cannot invite its fifth member on a five-seat plan.', evidence: 'Plan limit: 5\nCurrent members: 4\nExpected: allow invite\nAt 5 members: reject invite', file: 'lab-fixes.js / canInvite', hint: 'Compare the current count to the limit before adding a member.', options: ['Require two spare seats', 'Allow only when current count is below the limit', 'Allow even at the limit'], correct: 1, kind: 'seats' },
    { id: 'pagination', track: 'saas', difficulty: 'intermediate', title: 'Page two repeats page one', category: 'SaaS / Pagination', minutes: 8, symptom: 'Customers see repeated items when moving between pages.', evidence: 'Items: A, B, C, D, E; page size: 2\nPage 1: A,B; page 2: C,D; page 3: E\nPages are numbered from 1.', file: 'lab-fixes.js / pageItems', hint: 'Offset is (page - 1) times page size. Slice ends at offset + size.', options: ['Always return the first page', 'Calculate offset from the one-based page number', 'Use the page number as offset'], correct: 1, kind: 'pagination' },
    { id: 'roles', track: 'saas', difficulty: 'advanced', title: 'A viewer deletes a project', category: 'SaaS / Authorization', minutes: 12, symptom: 'The delete check accepts every signed-in user, including viewers and administrators from other tenants.', evidence: 'Contract: only an admin of the target tenant can delete.\nMissing user or tenant: deny.\nMatching tenant with viewer role: deny.', file: 'lab-fixes.js / canDelete', hint: 'Require a user, a nonempty target tenant, the matching tenant, and the admin role.', options: ['Allow every signed-in user', 'Require matching tenant and admin role', 'Allow any admin across tenants'], correct: 1, kind: 'roles' },
    { id: 'phone', track: 'cpaas', difficulty: 'beginner', title: 'The international prefix is doubled', category: 'CPaaS / Recipient formatting', minutes: 6, symptom: 'A fixture formatter adds + to a number that already has it.', evidence: 'Fixture accepts only + followed by 8 to 15 digits.\nSpaces and hyphens may be removed. All other input is rejected.\nNo country-code inference or real number verification.', file: 'lab-fixes.js / formatRecipient', hint: 'Remove allowed separators, then validate the complete string. Preserve an existing +.', options: ['Prepend + to everything', 'Strip allowed separators and validate the fixture format', 'Accept all nonempty strings'], correct: 1, kind: 'phone' },
    { id: 'backoff', track: 'cpaas', difficulty: 'intermediate', title: 'Retry workers ignore the provider delay', category: 'CPaaS / Rate limits', minutes: 10, symptom: 'Workers retry before the provider retry-after delay expires.', evidence: 'Fixture: retry delay = max(local backoff, retry-after seconds).\nLocal 2s, provider 10s -> wait 10s.\nMissing provider delay -> use local backoff.', file: 'lab-fixes.js / retryDelay', hint: 'Neither the local delay nor the provider delay may be shortened.', options: ['Always use the local delay', 'Use the maximum of local and provider delay', 'Use the minimum delay'], correct: 1, kind: 'backoff' },
    { id: 'optout', track: 'cpaas', difficulty: 'advanced', title: 'An opted-out recipient still gets a campaign', category: 'CPaaS / Consent isolation', minutes: 12, symptom: 'A simulated campaign ignores the suppression list or mixes consent across tenants.', evidence: 'Fixture: suppress only an exact tenant + recipient match.\nA north opt-out does not suppress a south campaign.\nNo live messages are sent; this is a data filtering exercise.', file: 'lab-fixes.js / allowedMessages', hint: 'Match both tenant and recipient for each suppression record.', options: ['Ignore suppressions', 'Match suppression by tenant and recipient', 'Suppress the recipient across every tenant'], correct: 1, kind: 'optout' },
    {"id": "search", "track": "saas", "difficulty": "beginner", "title": "Search misses the obvious match", "category": "SaaS / Search", "minutes": 6, "symptom": "Searching for launch with spaces or uppercase letters returns no tasks.", "evidence": "Fixture titles: Launch plan; Budget review\nQuery: \"  LAUNCH  \" -> Launch plan\nEmpty query -> all titles; no match -> empty list.", "file": "lab-fixes.js / searchTitles", "hint": "Trim the query and lowercase both query and title before testing inclusion.", "options": ["Compare titles with the raw query", "Normalize case and trim the query", "Match only the complete title"], "correct": 1, "kind": "search"},
    {"id": "quota", "track": "saas", "difficulty": "intermediate", "title": "A batch upload slips past the quota", "category": "SaaS / Usage limits", "minutes": 9, "symptom": "An upload is allowed even though its batch size pushes total usage beyond the plan limit.", "evidence": "Fixture uses whole MB. Used=90, batch=15, limit=100 -> reject\nUsed=90, batch=10 -> allow\nNegative usage, batch, or limit -> reject.", "file": "lab-fixes.js / canUpload", "hint": "Validate nonnegative inputs, then compare used + batch to the limit. Equality is allowed.", "options": ["Check existing usage only", "Validate inputs and include the entire batch", "Require total usage to be strictly below the limit"], "correct": 1, "kind": "quota"},
    {"id": "expiry", "track": "saas", "difficulty": "advanced", "title": "An expired invite still opens the workspace", "category": "SaaS / Invite lifecycle", "minutes": 12, "symptom": "A consumed or expired invitation can be reused, and an invitation for another tenant is accepted.", "evidence": "Fixture invitation: tenant, expiresAt, used\nAccept only a matching tenant, unused invite, and now < expiresAt.\nTimestamps use the same numeric unit. At exact expiry: reject; missing invite: reject.", "file": "lab-fixes.js / validInvite", "hint": "Combine all checks. A valid timestamp alone does not establish tenant ownership or single use.", "options": ["Check expiry only", "Require tenant match, unused invite, and strict expiry", "Require tenant match but allow used invitations"], "correct": 1, "kind": "expiry"},
    {"id": "cost", "track": "cpaas", "difficulty": "beginner", "title": "The messaging estimate forgets the segments", "category": "CPaaS / Cost estimates", "minutes": 6, "symptom": "A fixture estimate charges for recipients but ignores multiple segments per message.", "evidence": "All prices are integer cents in this fixture.\n3 recipients x 2 segments x 4 cents = 24 cents\nZero recipients or zero segments -> zero. No taxes or provider pricing are modeled.", "file": "lab-fixes.js / messageCost", "hint": "Multiply all three quantities. Keep the result in integer cents.", "options": ["Multiply recipients by price only", "Multiply recipients, segments, and price", "Add recipients and segments before pricing"], "correct": 1, "kind": "cost"},
    {"id": "routing", "track": "cpaas", "difficulty": "intermediate", "title": "A route selects the general prefix first", "category": "CPaaS / Prefix routing", "minutes": 10, "symptom": "A routing fixture picks +1 before a more specific +123 prefix.", "evidence": "Routes: +1 -> general; +123 -> regional\n+12345678 -> regional; +19876543 -> general\nNo matching prefix -> null. Route order must not affect the result. Equal prefixes are not used.", "file": "lab-fixes.js / chooseRoute", "hint": "Of every matching prefix, choose the longest. Return null when none match.", "options": ["Use the first matching route", "Use the longest matching prefix", "Use the shortest matching prefix"], "correct": 1, "kind": "routing"},
    {"id": "ttl", "track": "cpaas", "difficulty": "advanced", "title": "The queue sends yesterday's verification code", "category": "CPaaS / Queue expiry", "minutes": 12, "symptom": "A simulated queue sends expired messages or sends a message before its scheduled time.", "evidence": "Fixture fields: sendAt and expiresAt, in the same time unit as now.\nSend only when sendAt <= now < expiresAt.\nExact send time: allow; exact expiry: reject; future sendAt: reject.\nExpiry must be later than sendAt.", "file": "lab-fixes.js / readyToSend", "hint": "Check both ends of the time window and reject an invalid window.", "options": ["Send whenever the scheduled time has passed", "Require a valid window and now within it", "Check expiry but ignore the scheduled time"], "correct": 1, "kind": "ttl"},
    { id: 'moon', title: 'The lunar billing department', category: 'Bonus · deliberately unrealistic', bonus: true, minutes: 15, symptom: 'A fictional lunar client has 13 months per year. Your renewal calculator silently wraps after month 12.', evidence: 'Fictional calendar: 13 months, numbered 1–13\nMonth 13 + 1 → month 1\nMonth 12 + 1 → month 13 (currently 1)', file: 'lab-fixes.js → lunarMonth', hint: 'Use the fictional calendar’s modulus. This exercise is not Earth date handling.', options: ['Wrap at 12', 'Wrap at 13', 'Clamp at 13 forever'], correct: 1, cases: [], kind: 'moon' }
  ];
  const levels = ['beginner', 'intermediate', 'advanced'];
  const defaults = { money: 'beginner', retry: 'intermediate', access: 'advanced', segments: 'beginner', 'sms-retry': 'intermediate', delivery: 'advanced', moon: 'advanced' };
  missions.forEach(m => { m.track ||= 'saas'; m.difficulty ||= defaults[m.id]; });
  function completion(tests, answers) {
    const requirements = [
      { label: 'Pass every regression check', pass: tests.length > 0 && tests.every(t => t.pass) },
      ...['diagnosis', 'verification', 'reply'].map((key, i) => ({ label: ['Explain the cause and repair', 'Record verification and an edge case', 'Write a customer update'][i], pass: typeof answers[key] === 'string' && answers[key].trim().length > 0 }))
    ];
    return { complete: requirements.every(r => r.pass), requirements };
  }
  function curriculum(completed, track, difficulty) {
    const required = missions.filter(m => !m.bonus && m.track === track && (!difficulty || m.difficulty === difficulty));
    const done = required.filter(m => completed.includes(m.id)).length;
    return { done, total: required.length, complete: required.length > 0 && done === required.length };
  }
  const scenarios = {
    search: { choices: [(titles, q) => titles.filter(t => t.includes(q)).join('|'), (titles, q) => titles.filter(t => t.toLowerCase().includes(q.trim().toLowerCase())).join('|'), (titles, q) => titles.filter(t => t.toLowerCase() === q.trim().toLowerCase()).join('|')], cases: [[[['Launch plan','Budget review'], '  LAUNCH  '], 'Launch plan'], [[['Launch plan','Budget review'], ''], 'Launch plan|Budget review'], [[['Launch plan'], 'missing'], ''], [[[], 'launch'], '']] },
    quota: { choices: [(used, batch, limit) => used < limit, (used, batch, limit) => used >= 0 && batch >= 0 && limit >= 0 && used + batch <= limit, (used, batch, limit) => used >= 0 && batch >= 0 && used + batch < limit], cases: [[[90,15,100],false], [[90,10,100],true], [[-1,5,100],false], [[5,-1,100],false], [[0,0,0],true]] },
    expiry: { choices: [(invite, tenant, now) => !!invite && now < invite.expiresAt, (invite, tenant, now) => !!(invite && tenant && invite.tenant === tenant && !invite.used && now < invite.expiresAt), (invite, tenant, now) => !!(invite && tenant && invite.tenant === tenant && now < invite.expiresAt)], cases: [[[{tenant:'north',expiresAt:100,used:false},'north',99],true], [[{tenant:'north',expiresAt:100,used:false},'north',100],false], [[{tenant:'north',expiresAt:100,used:true},'north',99],false], [[{tenant:'south',expiresAt:100,used:false},'north',99],false], [[null,'north',99],false]] },
    cost: { choices: [(recipients, segments, cents) => recipients * cents, (recipients, segments, cents) => recipients * segments * cents, (recipients, segments, cents) => (recipients + segments) * cents], cases: [[[3,2,4],24], [[0,2,4],0], [[3,0,4],0], [[1,1,7],7]] },
    routing: { choices: [(routes, number) => routes.find(r => number.startsWith(r.prefix))?.name ?? null, (routes, number) => routes.filter(r => number.startsWith(r.prefix)).sort((a,b) => b.prefix.length - a.prefix.length)[0]?.name ?? null, (routes, number) => routes.filter(r => number.startsWith(r.prefix)).sort((a,b) => a.prefix.length - b.prefix.length)[0]?.name ?? null], cases: [[[[{prefix:'+1',name:'general'},{prefix:'+123',name:'regional'}],'+12345678'],'regional'], [[[{prefix:'+123',name:'regional'},{prefix:'+1',name:'general'}],'+12345678'],'regional'], [[[{prefix:'+1',name:'general'}],'+19876543'],'general'], [[[{prefix:'+1',name:'general'}],'+44987654'],null], [[[],'+12345678'],null]] },
    ttl: { choices: [(m, now) => now >= m.sendAt, (m, now) => m.expiresAt > m.sendAt && now >= m.sendAt && now < m.expiresAt, (m, now) => now < m.expiresAt], cases: [[[{sendAt:10,expiresAt:20},10],true], [[{sendAt:10,expiresAt:20},9],false], [[{sendAt:10,expiresAt:20},20],false], [[{sendAt:10,expiresAt:20},21],false], [[{sendAt:20,expiresAt:10},15],false], [[{sendAt:10,expiresAt:10},10],false]] },
    seats: { choices: [(n, limit) => n + 1 < limit, (n, limit) => n < limit, (n, limit) => n <= limit], cases: [[[4, 5], true], [[5, 5], false], [[0, 1], true], [[0, 0], false]] },
    pagination: { choices: [(a, p, n) => a.slice(0, n).join(','), (a, p, n) => a.slice((p - 1) * n, p * n).join(','), (a, p, n) => a.slice(p, p + n).join(',')], cases: [[[['A','B','C','D','E'], 1, 2], 'A,B'], [[[ 'A','B','C','D','E'], 2, 2], 'C,D'], [[[ 'A','B','C','D','E'], 3, 2], 'E'], [[[], 1, 2], '']] },
    roles: { choices: [u => !!u, (u, t) => !!(u && t && u.tenant === t && u.role === 'admin'), u => u?.role === 'admin'], cases: [[[{tenant:'north',role:'admin'}, 'north'], true], [[{tenant:'south',role:'admin'}, 'north'], false], [[{tenant:'north',role:'viewer'}, 'north'], false], [[null, 'north'], false], [[{role:'admin'}, ''], false]] },
    phone: { choices: [s => '+' + s, s => { const v = s.replace(/[ -]/g, ''); return /^\+[1-9][0-9]{7,14}$/.test(v) ? v : null; }, s => s || null], cases: [[['+12345678901'], '+12345678901'], [['+1 234-567-8901'], '+12345678901'], [['12345678901'], null], [['+abc'], null], [[''], null]] },
    backoff: { choices: [local => local, (local, provider = 0) => Math.max(local, provider), (local, provider = 0) => Math.min(local, provider)], cases: [[[2,10],10], [[20,10],20], [[2],2], [[0,0],0]] },
    optout: { choices: [() => true, (m, rows) => !rows.some(r => r.tenant === m.tenant && r.to === m.to), (m, rows) => !rows.some(r => r.to === m.to)], cases: [[[{tenant:'north',to:'123'}, [{tenant:'north',to:'123'}]], false], [[{tenant:'south',to:'123'}, [{tenant:'north',to:'123'}]], true], [[{tenant:'north',to:'456'}, [{tenant:'north',to:'123'}]], true], [[{tenant:'north',to:'123'}, []], true]] }
  };
  function run(mission, choice) {
    const m = typeof mission === 'string' ? missions.find(x => x.id === mission) : mission;
    if (!m) throw new Error('Unknown mission');
    let tests;
    if (scenarios[m.kind]) {
      const scenario = scenarios[m.kind];
      tests = scenario.cases.map(([input, expected]) => ({ name: `Input ${JSON.stringify(input)}`, actual: scenario.choices[choice](...input), expected }));
    } else if (m.kind === 'money') {
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
    } else if (m.kind === 'sms-retry') {
      const count = rows => {
        const seen = new Set();
        return rows.filter(row => {
          const key = choice === 2 ? row.to : JSON.stringify([row.tenant, row.id]);
          if (choice !== 0 && seen.has(key)) return false;
          seen.add(key); return true;
        }).length;
      };
      const a = { tenant: 'north', id: 'a', to: '+15550100' };
      tests = [
        { name: 'Retry sends once', actual: count([a, a]), expected: 1 },
        { name: 'Distinct requests to same recipient both send', actual: count([a, { ...a, id: 'b' }]), expected: 2 },
        { name: 'Tenant keys remain isolated', actual: count([a, { ...a, tenant: 'south' }]), expected: 2 },
        { name: 'Empty batch sends nothing', actual: count([]), expected: 0 }
      ];
    } else if (m.kind === 'delivery') {
      const status = events => {
        const states = ['queued', 'sent', 'delivered'];
        return events.reduce((current, event) => choice === 0 ? event : choice === 2 ? 'delivered' : states.indexOf(event) > states.indexOf(current) ? event : current, 'queued');
      };
      tests = [
        { name: 'Late callback cannot undo delivery', actual: status(['sent', 'delivered', 'sent']), expected: 'delivered' },
        { name: 'Duplicate sent stays sent', actual: status(['sent', 'sent']), expected: 'sent' },
        { name: 'Unknown callback is ignored', actual: status(['sent', 'unknown']), expected: 'sent' },
        { name: 'No callbacks stays queued', actual: status([]), expected: 'queued' }
      ];
    } else if (m.kind === 'segments') {
      const segments = n => choice === 0 ? Math.floor(n / 160) : choice === 2 ? Math.ceil(n / 160) : n === 0 ? 0 : n <= 160 ? 1 : Math.ceil(n / 153);
      tests = [0, 1, 160, 161, 306, 307, 320].map((n, i) => ({ name: `${n} septets`, actual: segments(n), expected: [0, 1, 1, 2, 2, 3, 3][i] }));
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
    const communication = (specific(reply) ? 5 : 0) + (/impact|customer|affected|charge|invoice|task|renewal|message|sms|delivery|recipient/i.test(reply) ? 5 : 0) + (/next|monitor|follow|check|update/i.test(reply) ? 5 : 0);
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
  const api = { missions, run, review, completion, curriculum, levels };
  if (typeof module !== 'undefined') module.exports = api;
  root.OrbitLab = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
