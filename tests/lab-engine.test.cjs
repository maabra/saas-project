const { test } = require('node:test');
const assert = require('node:assert/strict');
const { missions, run, review } = require('../lab-engine.js');
test('every correct strategy passes and every incorrect strategy exposes a regression', () => {
  for (const mission of missions) {
    mission.options.forEach((_, choice) => {
      assert.equal(run(mission, choice).every(t => t.pass), choice === mission.correct, `${mission.id}: choice ${choice}`);
    });
  }
});
test('speed cannot compensate for incorrect fixes, hints do not reduce scores', () => {
  const input = { tests: run('money', 0), diagnosis: '', verification: '', reply: '', seconds: 1, minutes: 8, hints: 0 };
  const result = review(input);
  assert.equal(result.breakdown.speed, 0);
  assert.ok(result.score < 70);
  assert.equal(result.score, review({ ...input, hints: 1 }).score);
  assert.ok(review({ ...input, seconds: 1000 }).advice.some(a => a.includes('smaller investigation')));
});
test('clear evidence plus passing checks earns full score', () => {
  const result = review({ tests: run('money', 1), diagnosis: 'The invoice was wrong because truncating each price removed cents before multiplying by the seat count.', verification: 'A regression test asserts expected output of 59.97 for three seats and an edge case with zero seats.', reply: 'The customer invoice was affected by rounding. We fixed the calculation and will monitor the next invoice update.', seconds: 60, minutes: 8, hints: 0 });
  assert.equal(result.score, 100);
});

const { completion, curriculum, levels } = require('../lab-engine.js');
test('both tracks have three required missions at each difficulty', () => {
  for (const track of ['saas', 'cpaas']) for (const difficulty of levels) {
    assert.equal(curriculum([], track, difficulty).total, 3);
  }
});
test('completion requires passing checks and all written steps, independent of coaching score', () => {
  const answers = { diagnosis: 'Cause', verification: 'Checked', reply: 'Updated' };
  assert.equal(completion(run('money', 1), answers).complete, true);
  assert.equal(completion(run('money', 0), answers).complete, false);
  assert.equal(completion([], answers).complete, false);
  for (const key of Object.keys(answers)) assert.equal(completion(run('money', 1), { ...answers, [key]: '   ' }).complete, false);
});
test('difficulty and track completion exclude bonus and other tracks; repeats do not inflate totals', () => {
  const ids = missions.filter(m => m.track === 'saas' && !m.bonus).map(m => m.id);
  assert.equal(curriculum([...ids, ...ids], 'saas').done, 9);
  assert.equal(curriculum(ids, 'saas').complete, true);
  assert.equal(curriculum(ids, 'cpaas').done, 0);
  assert.equal(curriculum(['moon'], 'saas', 'advanced').done, 0);
});
