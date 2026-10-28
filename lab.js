(() => {
  'use strict';
  const { missions, run, review, completion, curriculum, levels } = OrbitLab;
  const key = 'orbit-lab-v1';
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let records = [];
  let storageWarning = '';
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(saved)) throw new Error('Invalid history');
    records = saved.filter(r => r && missions.some(m => m.id === r.id) && Number.isFinite(r.score) && r.score >= 0 && r.score <= 100 && typeof r.reply === 'string' && typeof r.date === 'string').slice(-100);
  } catch { storageWarning = 'Saved progress could not be read. Export this session to keep a copy.'; }
  let active = null;
  let timer;
  // Each mission retains its draft and timer when switching incidents.
  const stateKey = 'orbit-lab-course-v1';
  let state = { completed: [], sessions: {}, track: 'saas', difficulty: 'beginner' };
  try {
    const saved = JSON.parse(localStorage.getItem(stateKey) || 'null');
    if (saved) {
      state.completed = Array.isArray(saved.completed) ? saved.completed.filter(id => missions.some(m => m.id === id)) : [];
      state.sessions = Object.fromEntries(missions.flatMap(m => {
        const s = saved.sessions?.[m.id];
        return s && typeof s.start === 'number' && Number.isFinite(s.start) && Number.isInteger(s.choice) && s.choice >= 0 && s.choice < m.options.length && ['diagnosis','verification','reply'].every(k => typeof s[k] === 'string') ? [[m.id, { ...s, attempts: Number.isFinite(s.attempts) ? Math.max(0, s.attempts) : 0 }]] : [];
      }));
      if (['saas','cpaas'].includes(saved.track)) state.track = saved.track;
      if (levels.includes(saved.difficulty)) state.difficulty = saved.difficulty;
    }
  } catch { storageWarning = 'Course progress could not be read. Export your session before leaving.'; }
  const sessions = state.sessions;
  $('track').value = state.track;
  $('difficulty').value = state.difficulty;
  function persist() {
    state.track = $('track').value; state.difficulty = $('difficulty').value;
    try { localStorage.setItem(stateKey, JSON.stringify(state)); }
    catch { storageWarning = 'Progress could not be saved. Export your learning record before leaving.'; if ($('saveStatus')) $('saveStatus').textContent = storageWarning; }
  }
  function course() {
    const track = $('track').value;
    const summary = curriculum(state.completed, track);
    const levelNames = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Hard' };
    $('curriculum').innerHTML = `<h2>${track === 'saas' ? 'SaaS' : 'CPaaS'} learning path</h2><p>${summary.done} / ${summary.total} missions complete${summary.complete ? ' - Track complete!' : ''}</p><progress max="${summary.total}" value="${summary.done}" aria-label="Track completion"></progress><div class="level-grid">${levels.map(level => {
      const p = curriculum(state.completed, track, level);
      return `<button type="button" data-level="${level}" class="quiet ${level === $('difficulty').value ? 'current-level' : ''}" aria-pressed="${level === $('difficulty').value}">${levelNames[level]} - ${p.done}/${p.total}${p.complete ? ' - Complete' : ''}</button>`;
    }).join('')}</div><p id="saveStatus" role="status">${escape(storageWarning || 'Drafts and completed missions save automatically in this browser.')}</p>`;
  }
  const visibleMissions = () => missions.filter(m => (m.track || 'saas') === $('track').value && m.difficulty === $('difficulty').value && (!m.bonus || $('bonus').checked));
  function history() {
    const best = missions.map(m => Math.max(0, ...records.filter(r => r.id === m.id).map(r => r.score)));
    $('xp').textContent = `${best.reduce((a, b) => a + b, 0)} XP`;
    $('progress').textContent = `${best.filter(s => s >= 70).length} / ${missions.length} missions rated 70+ · personal bests count`;
    $('history').innerHTML = (storageWarning ? `<p role="status">${escape(storageWarning)}</p>` : '') + (records.length ? records.slice().reverse().map(r => `<article class="record"><strong>${escape(missions.find(m => m.id === r.id).title)} · ${r.score}/100</strong><p>${escape(new Date(r.date).toLocaleString())} · ${Math.round(r.seconds || 0)}s · ${r.attempts || 1} test runs</p><p>${escape(r.reply)}</p></article>`).join('') : '<p class="muted">Finish an incident to start your learning record.</p>');
  }
  function list() {
    $('missions').innerHTML = visibleMissions().map(m => `<button class="mission ${active?.id === m.id ? 'selected' : ''}" data-id="${m.id}" type="button"><small>${escape(m.category)}</small><strong>${escape(m.title)}</strong><span>Target ${m.minutes} min ${state.completed.includes(m.id) ? '- Complete' : '- To do'}</span></button>`).join('');
  }
  function saveDraft() {
    if (!active || !$('solution')) return;
    Object.assign(sessions[active.id], { choice: Number($('solution').value), diagnosis: $('diagnosis').value, verification: $('verification').value, reply: $('reply').value });
    persist();
  }
  function show(id) {
    saveDraft();
    active = missions.find(m => m.id === id);
    const m = active;
    const s = sessions[id] ||= { start: Date.now(), choice: 0, attempts: 0, hints: 0, diagnosis: '', verification: '', reply: '' };
    clearInterval(timer);
    $('incident').innerHTML = `<div class="incident-head"><span class="pill">${escape(m.category)}</span><span id="elapsed"></span></div><h2>${escape(m.title)}</h2><p>${escape(m.symptom)}</p><pre>${escape(m.evidence)}</pre><p class="muted">Repository exercise: <code>${escape(m.file)}</code></p><section class="finish-panel"><h3>Finish this mission</h3><ol id="checklist"><li>Choose a repair and pass all regression checks.</li><li>Explain the cause and repair.</li><li>Record verification and an edge case.</li><li>Write a customer update, then finish.</li></ol><p id="completionStatus" role="status"></p></section><form id="response"><label for="solution">Choose a patch strategy</label><select id="solution">${m.options.map((o, i) => `<option value="${i}" ${i === s.choice ? 'selected' : ''}>${escape(o)}</option>`).join('')}</select><div class="actions"><button type="button" id="run">Run regression checks</button><button type="button" class="quiet" id="hint">Reveal hint</button></div><p id="hintText">${s.hints ? escape(m.hint) : ''}</p><div id="tests" aria-live="polite"></div><label for="diagnosis">Why did it fail, and why does your fix work?</label><textarea id="diagnosis" required maxlength="3000" rows="3">${escape(s.diagnosis)}</textarea><label for="verification">How did you verify it? Include expected output and an edge case.</label><textarea id="verification" required maxlength="3000" rows="3">${escape(s.verification)}</textarea><label for="reply">Reply to the affected customer</label><textarea id="reply" required maxlength="3000" rows="3">${escape(s.reply)}</textarea><p class="muted">Rubric: checks 50 · reasoning 15 · verification 15 · communication 15 · speed 5. The timer measures wall time, including breaks. Written answers use simple text heuristics.</p><button type="submit">Finish mission &amp; get debrief</button></form><div id="debrief" aria-live="polite"></div>`;
    const tick = () => { $('elapsed').textContent = `${Math.floor((Date.now() - s.start) / 60000)}m ${Math.floor((Date.now() - s.start) / 1000) % 60}s elapsed`; };
    tick(); timer = setInterval(tick, 1000);
    let lastTests = [];
    function updateChecklist(tests = lastTests) {
      const result = completion(tests, s);
      $('checklist').innerHTML = result.requirements.map(r => `<li class="${r.pass ? 'pass' : ''}">${r.pass ? 'Done' : 'To do'}: ${escape(r.label)}</li>`).join('');
      return result;
    }
    const execute = () => {
      s.attempts++;
      const tests = run(m, Number($('solution').value));
      $('tests').innerHTML = tests.map(t => `<p class="test ${t.pass ? 'pass' : 'fail'}">${t.pass ? 'PASS' : 'FAIL'} · ${escape(t.name)}${t.pass ? '' : ` — got ${escape(t.actual)}, expected ${escape(t.expected)}`}</p>`).join('');
      lastTests = tests; saveDraft(); updateChecklist(tests);
      return tests;
    };
    $('run').onclick = execute;
    $('response').oninput = event => { saveDraft(); if (event.target.id === 'solution') { lastTests = []; $('tests').textContent = ''; } updateChecklist(); };
    $('hint').onclick = () => { s.hints = 1; $('hintText').textContent = m.hint; persist(); };
    $('response').onsubmit = event => {
      event.preventDefault(); saveDraft();
      const tests = execute();
      const seconds = Math.max(0, (Date.now() - s.start) / 1000);
      const result = review({ tests, ...s, seconds, minutes: m.minutes });
      const record = { id, date: new Date().toISOString(), ...result, seconds, attempts: s.attempts, diagnosis: s.diagnosis, verification: s.verification, reply: s.reply, hints: s.hints, choice: s.choice };
      const finished = completion(tests, s);
      record.complete = finished.complete;
      if (finished.complete && !state.completed.includes(id)) state.completed.push(id);
      persist();
      $('completionStatus').textContent = finished.complete ? (storageWarning ? 'Mission complete in this session. Export your progress before leaving.' : 'Mission complete! Your completion is saved. You can keep practicing.') : 'Mission remains open. Complete the checklist and try again.';
      records.push(record); records = records.slice(-100);
      try { localStorage.setItem(key, JSON.stringify(records)); } catch { storageWarning = 'Browser storage is unavailable or full. Export your learning record before leaving.'; }
      $('debrief').innerHTML = `<h2>${result.score}/100 · ${result.score >= 85 ? 'Strong recovery' : result.score >= 70 ? 'On the right track' : 'Keep investigating'}</h2><p>${Object.entries(result.breakdown).map(([k, v]) => `${escape(k)}: ${v}`).join(' · ')}</p><ul>${result.advice.map(a => `<li>${escape(a)}</li>`).join('')}</ul><p>Test runs: ${s.attempts}. Iterate on your answer and submit again; your best score counts toward XP.</p>`;
      history(); list(); course();
      if (finished.complete) {
        const next = visibleMissions().find(item => !item.bonus && !state.completed.includes(item.id));
        const level = curriculum(state.completed, $('track').value, $('difficulty').value);
        const nextLevel = levels[levels.indexOf($('difficulty').value) + 1];
        $('debrief').insertAdjacentHTML('beforeend', next ? '<button type="button" id="nextMission">Next unfinished mission</button>' : level.complete && nextLevel ? '<p>Difficulty complete!</p><button type="button" id="nextLevel">Start next difficulty</button>' : '<p>Difficulty complete. Choose another difficulty or track above.</p>');
        if ($('nextMission')) $('nextMission').onclick = () => show(next.id);
        if ($('nextLevel')) $('nextLevel').onclick = () => { $('difficulty').value = nextLevel; selectQueue(); };
      }
    };
    updateChecklist();
    $('completionStatus').textContent = state.completed.includes(id) ? 'Completed - practice again whenever you like.' : 'Open - finish the checklist to complete this mission.';
    list(); course(); persist();
  }
  $('missions').onclick = e => { const button = e.target.closest('[data-id]'); if (button) show(button.dataset.id); };
  $('bonus').onchange = () => { if (!visibleMissions().includes(active)) show(visibleMissions()[0].id); else list(); };
  function selectQueue() {
    document.querySelector('.eyebrow').textContent = $('track').value === 'cpaas' ? 'YOUR LOCAL CPAAS FLIGHT SIMULATOR' : 'YOUR LOCAL SAAS FLIGHT SIMULATOR';
    const queue = visibleMissions();
    show((queue.find(m => !state.completed.includes(m.id)) || queue[0]).id);
  }
  $('track').onchange = selectQueue;
  $('difficulty').onchange = selectQueue;
  $('curriculum').onclick = e => { const button = e.target.closest('[data-level]'); if (button) { $('difficulty').value = button.dataset.level; selectQueue(); } };
  $('export').onclick = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 2, records, course: state }, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'orbit-learning-record.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  window.addEventListener('pagehide', saveDraft);
  history(); selectQueue();
})();
