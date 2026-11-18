'use strict';
// ===== 相棒モード：棒人間「ぼうくん」と一緒に進めて、回数を数える =====
const GT = {
  ja: { buddy: 'ぼうくん', start: '🤝 ぼうくんと一緒にやる', startD: '動きに合わせて回数を数えて、休憩も進めます', tempo: 'ペース', slow: 'ゆっくり', normal: 'ふつう', fast: 'はやい', voice: '声で数える',
    ready: 'いくよー！', go: 'スタート！', setN: 'セット {j}/{m}', next: '次：{n}', rest: '休憩', pause: '一時停止', resume: '再開', stop: 'ここまでにする', skipRest: '休憩をとばす', add15: '＋15秒',
    weight: '重さ', bw: '自重', kg: 'kg', sec: '秒', exit: '中断しますか？（ここまでの記録は残ります）', save: '保存して終わる',
    mid: ['いいね！', 'その調子！', 'きれいなフォーム！', 'ナイス！'], left: 'あと{n}回！', last: 'ラスト1回！', hold: 'キープ！', setDone: 'ナイス！セット完了！', restMsg: 'ひと息つこう〜', restEnd: '次いくよ！', all: 'おつかれさま！今日もよく動いたね！' },
  en: { buddy: 'Bo', start: '🤝 Train with Bo', startD: 'Bo moves with you, counts reps and runs the rests', tempo: 'Pace', slow: 'Slow', normal: 'Normal', fast: 'Fast', voice: 'Count aloud',
    ready: "Let's go!", go: 'Start!', setN: 'Set {j}/{m}', next: 'Next: {n}', rest: 'Rest', pause: 'Pause', resume: 'Resume', stop: 'End set here', skipRest: 'Skip rest', add15: '+15 s',
    weight: 'Weight', bw: 'Bodyweight', kg: 'kg', sec: 's', exit: 'Stop? (Your progress so far is kept)', save: 'Save & finish',
    mid: ['Nice!', 'Keep it up!', 'Clean form!', 'Great!'], left: '{n} more!', last: 'Last one!', hold: 'Hold it!', setDone: 'Nice! Set done!', restMsg: 'Catch your breath~', restEnd: 'Next one!', all: 'Great work! You moved well today!' },
};
const gt = (k, o) => { let v = GT[L()][k]; if (o && typeof v === 'string') for (const x in o) v = v.replace('{' + x + '}', o[x]); return v; };
const PROF = { def: [.15, .35, .15, .35], hold5: [.3, .1, .5, .1] };
const GSPEC = { plank: { kind: 'sec' }, sumohold: { kind: 'sec' }, sleg: { kind: 'sec' }, backflat: { T: 10000, prof: PROF.hold5 } };
const REST_POSE = P(STH, STS, STF, [104, 76], 1, -1), CHEER_POSE = P(STH, STS, STF, [103, -8], 1, -1);
const tempoMs = () => ({ slow: 4500, normal: 3200, fast: 2200 })[S.tempo || 'normal'];
let G = null, gRaf = 0, gLock = null;
async function keepAwake(on) { try { if (on) gLock = await navigator.wakeLock.request('screen'); else if (gLock) { await gLock.release(); gLock = null; } } catch (e) {} }

function say(text) {
  try {
    if (!S.voice || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = L() === 'ja' ? 'ja-JP' : 'en-US'; u.rate = 1.1;
    speechSynthesis.speak(u);
  } catch (e) {}
}
const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
const el$ = id => document.getElementById(id);

function cur() { const x = S.draft.ex[G.i]; return { x, s: x.sets[G.j], e: BYID[x.id], a: ANIM[x.id] }; }
function nextIdx() {
  const d = S.draft;
  if (G.j + 1 < d.ex[G.i].sets.length) return [G.i, G.j + 1];
  if (G.i + 1 < d.ex.length) return [G.i + 1, 0];
  return null;
}
function msg(text) { G.msg = text; const b = el$('gbub'); if (b) b.textContent = text; }

function startGuide() {
  const d = S.draft; if (!d) return;
  let i = 0, j = 0, found = false;
  for (i = 0; i < d.ex.length && !found; i++) for (j = 0; j < d.ex[i].sets.length; j++) if (!d.ex[i].sets[j].d) { found = true; break; }
  if (found) i--; else { i = 0; j = 0; }
  G = { i, j, state: 'ready', t0: performance.now(), pt: 0, paused: false, pstart: 0, count: 0, restEnd: 0, msg: '' };
  const m = document.createElement('div'); m.id = 'guide';
  m.innerHTML = `<div class="gtop"><button class="btn sm sec" id="gx">✕</button><div style="text-align:center;min-width:0"><b id="gname"></b><div class="muted" id="gset"></div></div><button class="btn sm sec" id="gv"></button></div>
    <div class="bubble" id="gbub"></div>
    <svg id="gsvg" viewBox="0 -20 200 170"></svg>
    <div class="gcount"><span id="gc">0</span><small id="gt"></small></div>
    <div class="gw" id="gw"></div>
    <div class="gbtns" id="gctl"></div>`;
  document.body.appendChild(m);
  keepAwake(true);
  el$('gx').onclick = () => { if (confirm(gt('exit'))) { closeGuide(); render(); } };
  el$('gv').onclick = () => { S.voice = !S.voice; save(); el$('gv').textContent = S.voice ? '🔊' : '🔇'; if (!S.voice) try { speechSynthesis.cancel(); } catch (e) {} };
  el$('gv').textContent = S.voice ? '🔊' : '🔇';
  enterReady();
  gRaf = requestAnimationFrame(gLoop);
}
function closeGuide() { keepAwake(false); cancelAnimationFrame(gRaf); G = null; const m = el$('guide'); if (m) m.remove(); try { speechSynthesis.cancel(); } catch (e) {} }

function enterReady() {
  G.state = 'ready'; G.t0 = performance.now(); G.pt = 0; G.paused = false; G.count = 0;
  const { x, s, e } = cur(), spec = GSPEC[x.id] || {};
  G.kind = spec.kind || 'rep'; G.T = spec.T || tempoMs(); G.prof = spec.prof || PROF.def;
  el$('gname').textContent = exName(x.id);
  el$('gset').textContent = gt('setN', { j: G.j + 1, m: x.sets.length });
  el$('gt').textContent = '/ ' + s.r + (G.kind === 'sec' ? gt('sec') : '');
  msg(gt('ready')); say(gt('ready')); renderW(); renderCtl();
}
function renderW() {
  const w = el$('gw'); if (!w) return;
  const target = G.state === 'rest' && nextIdx() ? S.draft.ex[nextIdx()[0]].sets[nextIdx()[1]] : cur().s;
  const lab = target.w ? target.w + gt('kg') : gt('bw');
  w.innerHTML = `${gt('weight')} <button class="btn sm sec" id="gwm">−</button> <b id="gwv">${lab}</b> <button class="btn sm sec" id="gwp">＋</button>`;
  const adj = dv => { target.w = Math.max(0, Math.round(((target.w || 0) + dv) * 10) / 10); save(); renderW(); };
  el$('gwm').onclick = () => adj(-0.5); el$('gwp').onclick = () => adj(0.5);
}
function renderCtl() {
  const c = el$('gctl'); if (!c) return;
  if (G.state === 'rest') {
    c.innerHTML = `<button class="btn sec" id="g1">${gt('add15')}</button><button class="btn" id="g2">${gt('skipRest')}</button>`;
    el$('g1').onclick = () => { G.restEnd += 15000; };
    el$('g2').onclick = () => nextSet();
  } else if (G.state === 'done') {
    c.innerHTML = `<button class="btn" id="g2">${gt('save')}</button>`;
    el$('g2').onclick = () => { closeGuide(); finishDraft(); };
  } else {
    c.innerHTML = `<button class="btn sec" id="g1">${G.paused ? gt('resume') : gt('pause')}</button><button class="btn" id="g2">${gt('stop')}</button>`;
    el$('g1').onclick = togglePause;
    el$('g2').onclick = () => endSet(true);
  }
}
function togglePause() {
  const now = performance.now();
  if (!G.paused) { G.paused = true; G.pstart = now; }
  else { const dt = now - G.pstart; G.pt += dt; G.restEnd += dt; G.paused = false; }
  renderCtl();
}
function onCount() {
  const { s } = cur(), left = s.r - G.count, c = el$('gc');
  c.textContent = G.count; c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
  buzz(15);
  if (G.kind === 'sec') { if (left === 10 || left === 3) msg(gt('left', { n: left }).replace(/回|more/, '')); say(G.count % 10 === 0 || left <= 3 ? G.count : ''); return; }
  say(G.count);
  if (left === 0) msg(gt('setDone')); else if (left === 1) msg(gt('last')); else if (left <= 3) msg(gt('left', { n: left })); else if (G.count % 4 === 0) { const a = gt('mid'); msg(a[(G.count / 4) % a.length | 0]); }
}
function endSet(early) {
  const { s } = cur();
  if (G.count > 0) { s.d = 1; s.r = G.count; save(); }
  buzz([60, 40, 60]); msg(gt('setDone')); say(gt('setDone'));
  const n = nextIdx();
  if (!n) { G.state = 'done'; msg(gt('all')); el$('gc').textContent = '🎉'; el$('gt').textContent = ''; renderW(); el$('gw').innerHTML = ''; renderCtl(); return; }
  G.state = 'rest'; G.t0 = performance.now(); G.pt = 0; G.paused = false;
  const secs = BYID[cur().x.id][7]; G.restEnd = performance.now() + secs * 1000;
  const nx = S.draft.ex[n[0]];
  el$('gset').textContent = gt('next', { n: exName(nx.id) + ' ' + (n[1] + 1) + '/' + nx.sets.length });
  el$('gt').textContent = gt('rest'); msg(gt('restMsg')); renderW(); renderCtl();
}
function nextSet() { const n = nextIdx(); if (!n) return; G.i = n[0]; G.j = n[1]; enterReady(); }

function gLoop(now) {
  if (!G) return;
  const ref = G.paused ? G.pstart : now, el = ref - G.t0 - G.pt;
  let pose, mood = 'ok', ex;
  const { x, s, a } = cur(); ex = a;
  if (G.state === 'ready') {
    const rem = 3 - el / 1000;
    if (rem <= 0) { G.state = 'set'; G.t0 = now; G.pt = 0; G.count = 0; msg(gt('go')); el$('gc').textContent = 0; renderCtl(); }
    else { const c = Math.ceil(rem); if (el$('gc').textContent != c) { el$('gc').textContent = c; say(c); } pose = a.a; mood = 'ok'; }
  } else if (G.state === 'set') {
    const target = s.r || 1;
    if (G.kind === 'sec') {
      const sec = Math.min(target, Math.floor(el / 1000));
      if (sec > G.count && !G.paused) { G.count = sec; onCount(); }
      pose = mix(a.a, a.b, Math.min(1, el / 800)); mood = 'hard';
      if (el >= target * 1000 && !G.paused) endSet(false);
    } else {
      const n = Math.floor(el / G.T), fr = (el % G.T) / G.T, Pf = G.prof, ease = q => q * q * (3 - 2 * q);
      let k;
      if (fr < Pf[0]) k = 0; else if (fr < Pf[0] + Pf[1]) k = ease((fr - Pf[0]) / Pf[1]); else if (fr < Pf[0] + Pf[1] + Pf[2]) k = 1; else k = 1 - ease((fr - Pf[0] - Pf[1] - Pf[2]) / Pf[3]);
      const c = Math.min(target, n + (fr >= Pf[0] + Pf[1] ? 1 : 0));
      if (c > G.count && !G.paused) { G.count = c; onCount(); }
      pose = mix(a.a, a.b, k); mood = (fr > Pf[0] && fr < Pf[0] + Pf[1] + Pf[2]) ? 'hard' : 'ok';
      if (el >= target * G.T && !G.paused) endSet(false);
    }
  } else if (G.state === 'rest') {
    const rem = Math.ceil((G.restEnd - (G.paused ? G.pstart : now)) / 1000);
    el$('gc').textContent = Math.max(0, rem);
    pose = REST_POSE; ex = {}; mood = 'rest';
    if (rem <= 3 && rem > 0 && G._rm !== rem) { G._rm = rem; msg(gt('restEnd')); }
    if (rem <= 0 && !G.paused) { nextSet(); }
  } else if (G.state === 'done') { pose = CHEER_POSE; ex = {}; mood = 'cheer'; }
  if (G && pose) { const sv = el$('gsvg'); if (sv) sv.innerHTML = figSVG(pose, ex || {}, mood); }
  if (G) gRaf = requestAnimationFrame(gLoop);
}
