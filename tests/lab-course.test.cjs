const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const engine = require('../lab-engine.js');
// Minimal DOM harness exercises event wiring and persistence without a browser dependency.
function launch(storage = new Map(), failWrites = false) {
  const nodes = new Map();
  class Element {
    constructor(id) { this.id = id; this.value = ''; this.textContent = ''; }
    set innerHTML(html) {
      this.html = html;
      for (const match of html.matchAll(/<(\w+)[^>]*\bid="([^"]+)"[^>]*>/g)) {
        const node = new Element(match[2]); nodes.set(node.id, node);
        if (match[1] === 'textarea') node.value = html.slice(match.index + match[0].length).split('</textarea>')[0];
        if (match[1] === 'select') {
          const options = html.slice(match.index + match[0].length).split('</select>')[0];
          node.value = options.match(/value="([^"]+)" selected/)?.[1] || options.match(/value="([^"]+)"/)?.[1] || '';
        }
      }
    }
    get innerHTML() { return this.html || ''; }
    insertAdjacentHTML(_, html) { this.innerHTML = this.innerHTML + html; }
  }
  for (const id of ['track','difficulty','bonus','curriculum','missions','incident','xp','progress','history','export']) nodes.set(id, new Element(id));
  const eyebrow = new Element('eyebrow');
  const context = vm.createContext({ OrbitLab: engine, document: { getElementById: id => nodes.get(id) || null, querySelector: () => eyebrow }, localStorage: { getItem: k => storage.get(k) || null, setItem: (k,v) => { if (failWrites) throw Error('full'); storage.set(k,v); } }, window: { addEventListener() {} }, setInterval() { return 1; }, clearInterval() {}, Date, console });
  vm.runInContext(fs.readFileSync(require.resolve('../lab.js'), 'utf8'), context);
  return { nodes, storage, state: () => JSON.parse(storage.get('orbit-lab-course-v1')) };
}
function answer(app, mission, choice = mission.correct) {
  const n = app.nodes;
  n.get('solution').value = String(choice);
  for (const id of ['diagnosis','verification','reply']) n.get(id).value = 'Written evidence';
  n.get('response').onsubmit({ preventDefault() {} });
}
test('finish both tracks, persist completions, and keep drafts across reload', () => {
  const app = launch();
  answer(app, engine.missions.find(m => m.id === 'money'), 0);
  assert.equal(app.state().completed.length, 0);
  assert.match(app.nodes.get('completionStatus').textContent, /remains open/);
  for (const track of ['saas','cpaas']) {
    app.nodes.get('track').value = track; app.nodes.get('track').onchange();
    for (const level of engine.levels) {
      app.nodes.get('difficulty').value = level; app.nodes.get('difficulty').onchange();
      for (const m of engine.missions.filter(m => m.track === track && m.difficulty === level && !m.bonus)) {
        app.nodes.get('missions').onclick({ target: { closest: () => ({ dataset: { id: m.id } }) } });
        answer(app, m);
        assert.ok(app.state().completed.includes(m.id));
        assert.match(app.nodes.get('missions').innerHTML, /Complete/);
      }
    }
  }
  assert.equal(app.state().completed.length, 18);
  app.nodes.get('diagnosis').value = 'Draft survives reload';
  app.nodes.get('response').oninput({ target: { id: 'diagnosis' } });
  const restored = launch(app.storage);
  assert.equal(restored.state().completed.length, 18);
  assert.equal(restored.nodes.get('track').value, 'cpaas');
  assert.equal(restored.nodes.get('difficulty').value, 'advanced');
  assert.match(restored.nodes.get('curriculum').innerHTML, /Track complete/);
  const m = engine.missions.find(m => m.id === 'ttl');
  restored.nodes.get('missions').onclick({ target: { closest: () => ({ dataset: { id: m.id } }) } });
  assert.equal(restored.nodes.get('diagnosis').value, 'Draft survives reload');
});
test('unavailable storage shows a warning without breaking the lab', () => {
  const app = launch(new Map(), true);
  assert.match(app.nodes.get('saveStatus').textContent, /could not be saved/);
  answer(app, engine.missions.find(m => m.id === 'money'));
  assert.match(app.nodes.get('completionStatus').textContent, /complete/);
});

test('older course completions remain saved while expanded difficulties gain new work', () => {
  const storage = new Map([['orbit-lab-course-v1', JSON.stringify({ completed: ['money', 'seats'], sessions: {}, track: 'saas', difficulty: 'beginner' })]]);
  const app = launch(storage);
  assert.deepEqual(app.state().completed, ['money', 'seats']);
  assert.match(app.nodes.get('incident').innerHTML, /Search misses/);
  assert.match(app.nodes.get('curriculum').innerHTML, /beginner - 2\/3/);
});
