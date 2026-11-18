'use strict';
// ===== 種目データ: [id, 名前, 部位, 器具, 基本種目か, セット, 回数, 休憩秒] =====
const PARTS = ['胸', '背中', '脚', '肩', '腕', '腹'];
const EQUIPS = ['body', 'band', 'db', 'gym'];
const ARCH = new Set(['supermanb','dbrow','pullup','latpull','cablerow','bandpull','bandrow','bandrot','reara','sidera','dbohp','facepull','dbext','pushdown','hammer','plank','birddog','legraise','pushup','backflat','sumohold','sleg','proneY','shrugdown']);
const ARCHW = { '背中': 4, '肩': 3, '腹': 2, '腕': 1, '胸': 1, '脚': 1 };
const EX = [
  ['pushup', 'プッシュアップ', '胸', 'body', 1, 3, 12, 60],
  ['incpush', 'インクラインプッシュアップ', '胸', 'db', 0, 3, 15, 60],
  ['dbpress', 'ダンベルプレス', '胸', 'db', 1, 3, 10, 90],
  ['dbfly', 'ダンベルフライ', '胸', 'db', 0, 3, 12, 60],
  ['bench', 'ベンチプレス', '胸', 'gym', 1, 4, 8, 120],
  ['pecdeck', 'ペックデック', '胸', 'gym', 0, 3, 12, 60],
  ['pullup', '懸垂（チンニング）', '背中', 'gym', 1, 3, 6, 90],
  ['supermanb', 'スーパーマン', '背中', 'body', 0, 3, 15, 45],
  ['dbrow', 'ワンハンドロウ', '背中', 'db', 1, 3, 10, 90],
  ['dbpullover', 'ダンベルプルオーバー', '背中', 'db', 0, 3, 12, 60],
  ['deadlift', 'デッドリフト', '背中', 'gym', 1, 3, 6, 150],
  ['latpull', 'ラットプルダウン', '背中', 'gym', 1, 3, 10, 90],
  ['cablerow', 'シーテッドロウ', '背中', 'gym', 0, 3, 12, 75],
  ['squat', 'スクワット', '脚', 'body', 1, 3, 15, 75],
  ['lunge', 'ランジ', '脚', 'body', 0, 3, 12, 60],
  ['calfb', 'カーフレイズ', '脚', 'body', 0, 3, 20, 45],
  ['gobsquat', 'ゴブレットスクワット', '脚', 'db', 1, 3, 12, 90],
  ['dbrdl', 'ダンベルルーマニアンデッド', '脚', 'db', 0, 3, 12, 75],
  ['bbsquat', 'バーベルスクワット', '脚', 'gym', 1, 4, 8, 150],
  ['legpress', 'レッグプレス', '脚', 'gym', 0, 3, 12, 90],
  ['legcurl', 'レッグカール', '脚', 'gym', 0, 3, 12, 60],
  ['pike', 'パイクプッシュアップ', '肩', 'body', 1, 3, 8, 75],
  ['dbohp', 'ダンベルショルダープレス', '肩', 'db', 1, 3, 10, 90],
  ['sidera', 'サイドレイズ', '肩', 'db', 0, 3, 15, 45],
  ['reara', 'リアレイズ', '肩', 'db', 0, 3, 15, 45],
  ['ohp', 'バーベルショルダープレス', '肩', 'gym', 1, 4, 8, 120],
  ['facepull', 'フェイスプル', '肩', 'gym', 0, 3, 15, 45],
  ['dips', '椅子ディップス', '腕', 'db', 1, 3, 12, 60],
  ['diamond', 'ダイヤモンドプッシュアップ', '腕', 'body', 0, 3, 10, 60],
  ['dbcurl', 'ダンベルカール', '腕', 'db', 1, 3, 12, 60],
  ['dbext', 'フレンチプレス', '腕', 'db', 1, 3, 12, 60],
  ['hammer', 'ハンマーカール', '腕', 'db', 0, 3, 12, 45],
  ['bbcurl', 'バーベルカール', '腕', 'gym', 1, 3, 10, 60],
  ['pushdown', 'プッシュダウン', '腕', 'gym', 0, 3, 12, 60],
  ['bandpull', 'バンドプルアパート', '背中', 'band', 1, 3, 15, 45],
  ['bandrow', 'ゴムバンドロウ', '背中', 'band', 0, 3, 15, 45],
  ['bandrot', 'バンド外旋（肩のインナー）', '肩', 'band', 1, 3, 15, 45],
  ['birddog', 'バードドッグ', '腹', 'body', 0, 3, 10, 45],
  ['proneY', 'うつ伏せYレイズ', '背中', 'body', 0, 3, 10, 45],
  ['shrugdown', '肩の上げ下げ（肩を下げる練習）', '肩', 'body', 0, 3, 10, 45],
  ['backflat', '背中ペタ腹筋キープ（5秒）', '腹', 'body', 1, 3, 5, 45],
  ['sumohold', '四股立ちキープ（秒）', '脚', 'body', 0, 3, 30, 60],
  ['sleg', '片足立ちキープ（秒）', '脚', 'body', 0, 3, 30, 45],
  ['crunch', 'クランチ', '腹', 'body', 1, 3, 20, 45],
  ['plank', 'プランク（秒）', '腹', 'body', 0, 3, 40, 45],
  ['legraise', 'レッグレイズ', '腹', 'body', 0, 3, 15, 45],
  ['russian', 'ロシアンツイスト', '腹', 'db', 0, 3, 20, 45],
  ['abwheel', 'アブローラー', '腹', 'gym', 0, 3, 10, 60],
];
const BYID = Object.fromEntries(EX.map(e => [e[0], e]));

// ===== 言語 (ja / en) =====
const EXEN = {pushup:'Push-up',incpush:'Incline push-up',dbpress:'Dumbbell bench press',dbfly:'Dumbbell fly',bench:'Bench press',pecdeck:'Pec deck',pullup:'Pull-up',supermanb:'Superman',dbrow:'One-arm dumbbell row',dbpullover:'Dumbbell pullover',deadlift:'Deadlift',latpull:'Lat pulldown',cablerow:'Seated cable row',squat:'Squat',lunge:'Lunge',calfb:'Calf raise',gobsquat:'Goblet squat',dbrdl:'Dumbbell Romanian deadlift',bbsquat:'Barbell squat',legpress:'Leg press',legcurl:'Leg curl',pike:'Pike push-up',dbohp:'Dumbbell shoulder press',sidera:'Lateral raise',reara:'Rear delt raise',ohp:'Barbell overhead press',facepull:'Face pull',dips:'Chair dips',diamond:'Diamond push-up',dbcurl:'Dumbbell curl',dbext:'Overhead triceps extension',hammer:'Hammer curl',bbcurl:'Barbell curl',pushdown:'Triceps pushdown',crunch:'Crunch',plank:'Plank (sec)',legraise:'Leg raise',russian:'Russian twist',abwheel:'Ab wheel',bandpull:'Band pull-apart',bandrow:'Band row',bandrot:'Band external rotation',birddog:'Bird dog',proneY:'Prone Y raise',shrugdown:'Shoulder shrug & drop',backflat:'Flat-back ab hold (5 s)',sumohold:'Sumo squat hold (sec)',sleg:'Single-leg stand (sec)'};
const PARTEN = {'胸':'Chest','背中':'Back','脚':'Legs','肩':'Shoulders','腕':'Arms','腹':'Abs'};
const I = {
ja:{title:'筋トレメニュー',nMenu:'メニュー',nTrain:'記録',nHist:'履歴',langBtn:'EN',
 body:'自重（道具なし）',band:'ゴムバンド（チューブ）',arch:'🏹 アーチェリー向け',archD:'背中・肩・体幹を中心に、引く力と射形の安定に効く種目を選びます',archNote:'アーチェリーで',nCal:'カレンダー',noDay:'この日の記録はありません',modeT:'メニューの作り方',modeRandom:'毎回ランダム',modeRepeat:'同じメニューを繰り返す',modeRepeatN:'前回と同じメニューです。「作り直す」で入れ替えられます。',db:'ダンベル・ペットボトル・椅子など',gym:'ジム（バーベル・マシン・懸垂バー）',
 parts:'鍛える部位（複数OK）',restHint:'疲労が抜けるまで、同じ部位は2〜3日あけるのがおすすめ',equip:'使える器具',time:'時間',min:'{n}分',
 never:'未記録',today:'今日',ago:'{n}日前',pickPart:'部位を選んでください',gen:'メニューを作る',todayMenu:'今日のメニュー',
 line:'{p} ・ {s}セット × {r}回',prev:' ・ 前回{w}kg',regen:'作り直す',start:'開始する',overwrite:'進行中の記録があります。上書きして新しく始めますか？',
 noTrain:'進行中のトレーニングはありません。<br>「メニュー」タブで今日の分を作りましょう。',guide:'{p} ・ 目安{r}回 ・ 休憩{s}秒',last:'前回: ',addSet:'＋セット',rmEx:'種目を外す',
 prog:'進捗 {d}/{a}セット',startedAt:'{t}開始',fin:'トレーニング終了・保存',cancel:'破棄する',noDone:'完了したセットがありません（右の□をタップでチェック）',
 thanks:'お疲れさまでした！記録しました。',pr:'🔥 自己ベスト更新: ',sep:'、',discard:'この記録を破棄しますか？',
 noHist:'まだ記録がありません。',week:'今週',total:'累計',times:'{n}回',mins:'{n}分',vol:'総挙上量 {n}kg',del:'削除',delAsk:'この記録を削除しますか？',
 exp:'書き出し',imp:'読み込み',impAsk:'今の記録を読み込んだデータで置き換えますか？',impBad:'読み込めないファイルです',
 rest:'休憩 {m}:{s}',restEnd:'休憩おわり！次のセットへ',close:'閉じる',how:'動き',tip:'コツ',kg:'kg',reps:'回',loc:'ja-JP'},
en:{title:'Workout Menu',nMenu:'Menu',nTrain:'Log',nHist:'History',langBtn:'日本語',
 body:'Bodyweight (no equipment)',band:'Resistance band',arch:'🏹 Archery focus',archD:'Prioritizes back, shoulders and core — the muscles that support drawing and holding form',archNote:'For archery',nCal:'Calendar',noDay:'No workouts on this day',modeT:'How menus are made',modeRandom:'Random each time',modeRepeat:'Repeat the same menu',modeRepeatN:'Same menu as last time. Tap Reshuffle to swap it.',db:'Dumbbells, water bottles, a chair…',gym:'Gym (barbell, machines, pull-up bar)',
 parts:'Muscle groups (multiple OK)',restHint:'Rest each muscle group 2–3 days before training it again',equip:'Equipment',time:'Time',min:'{n} min',
 never:'No record',today:'Today',ago:'{n}d ago',pickPart:'Pick at least one muscle group',gen:'Create menu',todayMenu:"Today's menu",
 line:'{p} · {s} sets × {r} reps',prev:' · last {w}kg',regen:'Reshuffle',start:'Start',overwrite:'A workout is in progress. Replace it with a new one?',
 noTrain:'No workout in progress.<br>Create today\'s menu in the "Menu" tab.',guide:'{p} · target {r} reps · rest {s}s',last:'Last: ',addSet:'+ Set',rmEx:'Remove',
 prog:'Progress {d}/{a} sets',startedAt:'Started {t}',fin:'Finish & save',cancel:'Discard',noDone:'No completed sets (tap the box on the right to check)',
 thanks:'Great work! Saved.',pr:'🔥 New personal best: ',sep:', ',discard:'Discard this workout?',
 noHist:'No workouts yet.',week:'This week',total:'Total',times:'{n}',mins:'{n} min',vol:'Volume {n}kg',del:'Delete',delAsk:'Delete this workout?',
 exp:'Export',imp:'Import',impAsk:'Replace your current data with the imported file?',impBad:'Could not read this file',
 rest:'Rest {m}:{s}',restEnd:'Rest over! Next set',close:'Close',how:'Movement',tip:'Tips',kg:'kg',reps:'reps',loc:'en-US'}};
const detect = () => ((navigator.language || 'ja').toLowerCase().startsWith('ja') ? 'ja' : 'en');
const L = () => (S.lang === 'en' || S.lang === 'ja') ? S.lang : detect();
const t = (k, o) => { let v = I[L()][k]; if (o) for (const x in o) v = v.replace('{' + x + '}', o[x]); return v; };
const exName = id => L() === 'en' ? (EXEN[id] || id) : (BYID[id] ? BYID[id][1] : id);
const partName = p => L() === 'en' ? PARTEN[p] : p;

// ===== 保存 =====
const KEY = 'workout-v1';
let S = { sessions: [], draft: null, sel: { parts: [], equips: ['body'], min: 45 } };
try { const j = JSON.parse(localStorage.getItem(KEY)); if (j) S = Object.assign(S, j); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const day = ts => new Date(ts).toLocaleDateString(I[L()].loc, { month: 'numeric', day: 'numeric', weekday: 'short' });

// ===== 部位ごとの最終トレ日 =====
function lastDays() {
  const r = {};
  for (const s of S.sessions) for (const x of s.ex) {
    const p = BYID[x.id] && BYID[x.id][2];
    if (p && (!r[p] || s.t > r[p])) r[p] = s.t;
  }
  return Object.fromEntries(PARTS.map(p => [p, r[p] ? Math.floor((Date.now() - r[p]) / 864e5) : null]));
}
// 前回の数字・PR
function lastOf(id) {
  for (let i = S.sessions.length - 1; i >= 0; i--) {
    const x = S.sessions[i].ex.find(e => e.id === id);
    if (x) return x;
  }
  return null;
}
function bestOf(id) {
  let b = 0;
  for (const s of S.sessions) for (const x of s.ex) if (x.id === id) for (const st of x.sets) if (st.d) b = Math.max(b, st.w * (st.r || 0));
  return b;
}

// ===== メニュー生成 =====
const selKey = () => JSON.stringify([[...S.sel.parts].sort(), [...S.sel.equips].sort(), S.sel.min, !!S.sel.arch]);
const isFixed = () => S.sel.mode === 'repeat' && S.fixed && S.fixed.key === selKey();
function mkEx(e) {
  const l = lastOf(e[0]);
  const lw = l ? (l.sets.filter(s => s.d).slice(-1)[0] || l.sets[0]).w : 0;
  return { id: e[0], sets: Array.from({ length: e[5] }, () => ({ w: lw, r: e[6], d: 0 })) };
}
function build() {
  if (isFixed()) return S.fixed.ids.filter(id => BYID[id]).map(id => mkEx(BYID[id]));
  return buildNew();
}
function buildNew() {
  const { parts, equips, min, arch } = S.sel;
  const total = Math.max(2, Math.round(min / 9));            // 1種目≒9分
  let ps = [...parts];
  if (arch) ps.sort((a, b) => (ARCHW[b] || 1) - (ARCHW[a] || 1));
  if (ps.length > total) ps = ps.slice(0, total);
  // 部位ごとの種目数（アーチェリー向けは背中・肩を厚めに）
  const cnt = Object.fromEntries(ps.map(p => [p, 1]));
  for (let left = total - ps.length; left > 0; left--) {
    const w = p => (arch ? (ARCHW[p] || 1) : 1) / (cnt[p] + 1);
    cnt[ps.reduce((a, b) => (w(b) > w(a) ? b : a))]++;
  }
  const out = [];
  for (const p of ps) {
    const all = EX.filter(e => e[2] === p && equips.includes(e[3]));
    let c = arch ? all.filter(e => ARCH.has(e[0])) : all;
    if (!c.length) c = all;
    const main = c.filter(e => e[4]).sort(() => Math.random() - .5), sub = c.filter(e => !e[4]).sort(() => Math.random() - .5);
    out.push(...[...main, ...sub].slice(0, cnt[p]));
  }
  out.sort((a, b) => b[4] - a[4]);                           // 基本種目を先に
  return out.map(mkEx);
}

// ===== 画面 =====
let tab = 'menu', preview = null;
const $ = id => document.getElementById(id);
document.querySelectorAll('nav button').forEach(b => b.onclick = () => { tab = b.dataset.t; render(); });

function applyLang() {
  document.documentElement.lang = L(); document.title = t('title');
  $('ttl').textContent = '🏋️ ' + t('title'); $('lang').textContent = t('langBtn');
  document.querySelector('[data-t=menu]').textContent = t('nMenu'); document.querySelector('[data-t=train]').textContent = t('nTrain'); document.querySelector('[data-t=hist]').textContent = t('nHist'); document.querySelector('[data-t=cal]').textContent = t('nCal');
  $('tclose').textContent = t('close');
}
$('lang').onclick = () => { S.lang = L() === 'ja' ? 'en' : 'ja'; save(); preview = null; render(); };

function render() {
  applyLang();
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
  if (tab === 'menu') renderMenu(); else if (tab === 'train') renderTrain(); else if (tab === 'cal') renderCal(); else renderHist();
  $('app').querySelectorAll('[data-info]').forEach(b => b.onclick = () => showInfo(b.dataset.info));
  window.scrollTo(0, 0);
}

function renderMenu() {
  const { parts, equips, min } = S.sel, arch = !!S.sel.arch, ld = lastDays();
  let h = `<div class="card"><button class="chip ${arch ? 'on' : ''}" id="arch" style="width:100%;text-align:left;border-radius:12px">${t('arch')}<small>${t('archD')}</small></button></div>`;
  h += `<div class="card"><h2>${t('modeT')}</h2><div class="chips"><button class="chip ${S.sel.mode !== 'repeat' ? 'on' : ''}" data-mode="random">${t('modeRandom')}</button><button class="chip ${S.sel.mode === 'repeat' ? 'on' : ''}" data-mode="repeat">${t('modeRepeat')}</button></div></div>`;
  h += '<div class="card"><h2>' + t('parts') + '</h2><div class="chips">';
  for (const p of PARTS) {
    const d = ld[p];
    h += `<button class="chip ${parts.includes(p) ? 'on' : ''}" data-p="${p}">${partName(p)}<small>${d === null ? t('never') : d === 0 ? t('today') : t('ago', { n: d })}</small></button>`;
  }
  h += '</div><div class="muted" style="margin-top:8px">' + t('restHint') + '</div></div>';
  h += '<div class="card"><h2>' + t('equip') + '</h2><div class="chips">';
  for (const k of EQUIPS) h += `<button class="chip ${equips.includes(k) ? 'on' : ''}" data-e="${k}">${t(k)}</button>`;
  h += '</div></div><div class="card"><h2>' + t('time') + '</h2><div class="chips">';
  for (const m of [20, 30, 45, 60, 90]) h += `<button class="chip ${min === m ? 'on' : ''}" data-m="${m}">${t('min', { n: m })}</button>`;
  h += '</div></div>';
  if (!parts.length) h += '<div class="muted" style="margin-bottom:10px">' + t('pickPart') + '</div>';
  h += `<button class="btn" id="gen" ${parts.length && equips.length ? '' : 'disabled style="opacity:.4"'}>${t('gen')}</button>`;
  if (preview) {
    h += '<div style="height:14px"></div><div class="card"><h2>' + t('todayMenu') + '</h2>' + (isFixed() ? '<div class="muted" style="margin-bottom:6px">' + t('modeRepeatN') + '</div>' : '');
    for (const x of preview) {
      const e = BYID[x.id];
      h += `<div class="ex" style="padding:6px 0"><div><b>${exName(x.id)}</b> <button class="info" data-info="${x.id}">ⓘ</button><div class="muted">${t('line', { p: partName(e[2]), s: x.sets.length, r: e[6] })}${x.sets[0].w ? t('prev', { w: x.sets[0].w }) : ''}</div></div></div>`;
    }
    h += '</div><div class="row"><button class="btn sec" id="regen">' + t('regen') + '</button><button class="btn" id="start">' + t('start') + '</button></div>';
  }
  $('app').innerHTML = h;
  $('app').querySelectorAll('[data-p]').forEach(b => b.onclick = () => { tgl(S.sel.parts, b.dataset.p); preview = null; save(); render(); });
  $('app').querySelectorAll('[data-e]').forEach(b => b.onclick = () => { tgl(S.sel.equips, b.dataset.e); preview = null; save(); render(); });
  $('app').querySelectorAll('[data-m]').forEach(b => b.onclick = () => { S.sel.min = +b.dataset.m; preview = null; save(); render(); });
  $('app').querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { S.sel.mode = b.dataset.mode; preview = null; save(); render(); });
  $('arch').onclick = () => { S.sel.arch = !S.sel.arch; if (S.sel.arch) S.sel.parts = ['背中', '肩', '腹', '腕']; preview = null; save(); render(); };
  const g = $('gen'); if (g && parts.length && equips.length) g.onclick = () => { preview = build(); render(); };
  const r = $('regen'); if (r) r.onclick = () => { preview = buildNew(); render(); };
  const st = $('start'); if (st) st.onclick = () => {
    if (S.draft && !confirm(t('overwrite'))) return;
    S.fixed = { key: selKey(), ids: preview.map(x => x.id) };
    S.draft = { t: Date.now(), ex: preview }; preview = null; save(); tab = 'train'; render();
  };
}
function tgl(a, v) { const i = a.indexOf(v); i < 0 ? a.push(v) : a.splice(i, 1); }

function finishDraft() {
  const d = S.draft; if (!d) return;
  const ex = d.ex.map(x => ({ id: x.id, sets: x.sets.filter(s => s.d) })).filter(x => x.sets.length);
  if (!ex.length) { alert(t('noDone')); return; }
  const prs = ex.filter(x => x.sets.some(s => s.w * s.r > bestOf(x.id) && bestOf(x.id) > 0)).map(x => exName(x.id));
  S.sessions.push({ t: d.t, end: Date.now(), ex }); S.draft = null; save(); stopTimer();
  alert(t('thanks') + (prs.length ? '\n\n' + t('pr') + prs.join(t('sep')) : ''));
  cal.sel = dkey(Date.now()); const n = new Date(); cal.y = n.getFullYear(); cal.m = n.getMonth(); tab = 'cal'; render();
}

function renderTrain() {
  const d = S.draft;
  if (!d) { $('app').innerHTML = '<div class="card">' + t('noTrain') + '</div>'; return; }
  let h = '', done = 0, all = 0;
  d.ex.forEach((x, i) => {
    const e = BYID[x.id], l = lastOf(x.id);
    const ls = l ? l.sets.filter(s => s.d).map(s => `${s.w}×${s.r}`).join(' / ') : '';
    h += `<div class="card"><div class="ex"><div><b>${exName(x.id)}</b> <button class="info" data-info="${x.id}">ⓘ</button><div class="muted">${t('guide', { p: partName(e[2]), r: e[6], s: e[7] })}</div>${ls ? `<div class="muted">${t('last')}${ls}</div>` : ''}</div></div>`;
    x.sets.forEach((s, j) => {
      all++; if (s.d) done++;
      h += `<div class="set ${s.d ? 'done' : ''}"><span class="muted">${j + 1}</span>
        <input type="number" inputmode="decimal" step="0.5" value="${s.w}" data-i="${i}" data-j="${j}" data-k="w" placeholder="${t('kg')}">
        <input type="number" inputmode="numeric" value="${s.r}" data-i="${i}" data-j="${j}" data-k="r" placeholder="${t('reps')}">
        <button class="chk" data-c="${i},${j}">${s.d ? '✓' : ''}</button></div>`;
    });
    h += `<div class="row" style="margin-top:8px"><button class="btn sm sec" data-add="${i}">${t('addSet')}</button><button class="btn sm sec" data-del="${i}">${t('rmEx')}</button></div></div>`;
  });
  const pct = all ? Math.round(done / all * 100) : 0;
  const tp = S.tempo || 'normal';
  h = `<div class="card"><button class="btn" id="gstart">${gt('start')}</button><div class="muted" style="margin:6px 0">${gt('startD')}</div><div class="chips"><span class="muted" style="align-self:center">${gt('tempo')}</span>${['slow', 'normal', 'fast'].map(k => `<button class="chip ${tp === k ? 'on' : ''}" data-tempo="${k}">${gt(k)}</button>`).join('')}<button class="chip ${S.voice ? 'on' : ''}" id="gvoice">🔊 ${gt('voice')}</button></div></div>` + h;
  h = `<div class="card"><div class="row"><b>${t('prog', { d: done, a: all })}</b><span class="muted">${t('startedAt', { t: new Date(d.t).toLocaleTimeString(I[L()].loc, { hour: '2-digit', minute: '2-digit' }) })}</span></div><div class="bar"><i style="width:${pct}%"></i></div></div>` + h +
    '<button class="btn" id="fin">' + t('fin') + '</button><div style="height:10px"></div><button class="btn sec" id="cancel">' + t('cancel') + '</button>';
  $('app').innerHTML = h;
  $('gstart').onclick = startGuide;
  $('app').querySelectorAll('[data-tempo]').forEach(b => b.onclick = () => { S.tempo = b.dataset.tempo; save(); renderTrain(); });
  $('gvoice').onclick = () => { S.voice = !S.voice; save(); renderTrain(); };
  $('app').querySelectorAll('input[type=number]').forEach(inp => inp.onchange = () => {
    d.ex[+inp.dataset.i].sets[+inp.dataset.j][inp.dataset.k] = parseFloat(inp.value) || 0; save();
  });
  $('app').querySelectorAll('[data-c]').forEach(b => b.onclick = () => {
    const [i, j] = b.dataset.c.split(',').map(Number), s = d.ex[i].sets[j];
    s.d = s.d ? 0 : 1; save();
    if (s.d) startTimer(BYID[d.ex[i].id][7]); else stopTimer();
    const y = window.scrollY; renderTrain(); window.scrollTo(0, y);
  });
  $('app').querySelectorAll('[data-add]').forEach(b => b.onclick = () => {
    const x = d.ex[+b.dataset.add], p = x.sets[x.sets.length - 1]; x.sets.push({ w: p.w, r: p.r, d: 0 }); save(); const y = scrollY; renderTrain(); scrollTo(0, y);
  });
  $('app').querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    d.ex.splice(+b.dataset.del, 1); save(); const y = scrollY; renderTrain(); scrollTo(0, y);
  });
  $('fin').onclick = finishDraft;
  $('cancel').onclick = () => { if (confirm(t('discard'))) { S.draft = null; save(); stopTimer(); render(); } };
}

function renderHist() {
  const ss = [...S.sessions].reverse();
  let h = '';
  if (!ss.length) h = '<div class="card">' + t('noHist') + '</div>';
  const wk = S.sessions.filter(s => Date.now() - s.t < 7 * 864e5).length;
  if (ss.length) h += `<div class="card"><div class="row"><span>${t('week')}</span><b>${t('times', { n: wk })}</b></div><div class="row"><span>${t('total')}</span><b>${t('times', { n: ss.length })}</b></div></div>`;
  ss.forEach((s, ri) => {
    const vol = s.ex.reduce((a, x) => a + x.sets.reduce((b, t) => b + t.w * t.r, 0), 0);
    const min = s.end ? Math.round((s.end - s.t) / 60000) : 0;
    h += `<div class="card"><div class="row"><b>${day(s.t)}</b><span class="muted">${min ? t('mins', { n: min }) + ' · ' : ''}${t('vol', { n: Math.round(vol) })}</span></div>`;
    for (const x of s.ex) h += `<div class="muted" style="margin-top:4px"><span style="color:var(--tx)">${esc(exName(x.id))}</span>　${x.sets.map(t => `${t.w}×${t.r}`).join(' / ')}</div>`;
    h += `<div style="margin-top:8px"><button class="btn sm sec" data-rm="${S.sessions.length - 1 - ri}">${t('del')}</button></div></div>`;
  });
  h += `<div class="row"><button class="btn sec" id="exp">${t('exp')}</button><button class="btn sec" id="imp">${t('imp')}</button></div><input type="file" id="file" accept=".json" hidden>`;
  $('app').innerHTML = h;
  $('app').querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { if (confirm(t('delAsk'))) { S.sessions.splice(+b.dataset.rm, 1); save(); render(); } });
  $('exp').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' }));
    a.download = 'workout-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
  };
  $('imp').onclick = () => $('file').click();
  $('file').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then(t => { try { const j = JSON.parse(t); if (!Array.isArray(j.sessions)) throw 0; if (confirm(t('impAsk'))) { S = Object.assign(S, j); save(); render(); } } catch (x) { alert(t('impBad')); } });
  };
}

// ===== カレンダー：やった日と、その日の部位・種目 =====
const dkey = ts => { const d = new Date(ts); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
let cal = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: dkey(Date.now()) };
function renderCal() {
  const by = {};
  for (const s of S.sessions) (by[dkey(s.t)] = by[dkey(s.t)] || []).push(s);
  const ja = L() === 'ja', first = new Date(cal.y, cal.m, 1), days = new Date(cal.y, cal.m + 1, 0).getDate(), today = dkey(Date.now());
  const title = first.toLocaleDateString(I[L()].loc, { year: 'numeric', month: 'long' });
  const wd = ja ? ['日', '月', '火', '水', '木', '金', '土'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  let h = `<div class="card"><div class="row" style="align-items:center"><button class="btn sm sec" id="cp">‹</button><b>${title}</b><button class="btn sm sec" id="cn">›</button></div><div class="cal">`;
  wd.forEach(w => { h += `<div class="wd">${w}</div>`; });
  for (let i = 0; i < first.getDay(); i++) h += '<div></div>';
  for (let d = 1; d <= days; d++) {
    const k = cal.y + '-' + (cal.m + 1) + '-' + d, ss = by[k];
    const ps = ss ? [...new Set(ss.flatMap(s => s.ex.map(x => BYID[x.id] && BYID[x.id][2]).filter(Boolean)))].map(p => partName(p).slice(0, ja ? 1 : 2)).join(ja ? '' : ' ') : '';
    h += `<button class="day${ss ? ' did' : ''}${k === today ? ' today' : ''}${k === cal.sel ? ' sel' : ''}" data-d="${k}"><span>${d}</span><small>${ps}</small></button>`;
  }
  h += '</div></div>';
  const sel = by[cal.sel] || [];
  if (!sel.length) h += `<div class="card muted">${t('noDay')}</div>`;
  for (const s of sel) {
    const min = s.end ? Math.round((s.end - s.t) / 60000) : 0;
    h += `<div class="card"><div class="row"><b>${day(s.t)}</b><span class="muted">${min ? t('mins', { n: min }) : ''}</span></div>`;
    for (const x of s.ex) h += `<div class="muted" style="margin-top:4px"><span style="color:var(--tx)">${esc(exName(x.id))}</span>　${x.sets.map(q => `${q.w}×${q.r}`).join(' / ')}</div>`;
    h += '</div>';
  }
  $('app').innerHTML = h;
  $('cp').onclick = () => { const d = new Date(cal.y, cal.m - 1, 1); cal.y = d.getFullYear(); cal.m = d.getMonth(); renderCal(); };
  $('cn').onclick = () => { const d = new Date(cal.y, cal.m + 1, 1); cal.y = d.getFullYear(); cal.m = d.getMonth(); renderCal(); };
  $('app').querySelectorAll('[data-d]').forEach(b => b.onclick = () => { cal.sel = b.dataset.d; renderCal(); });
}

// ===== 休憩タイマー =====
let tmr = null, tEnd = 0;
function startTimer(sec) {
  stopTimer(); tEnd = Date.now() + sec * 1000; $('timer').style.display = 'flex'; tick();
  tmr = setInterval(tick, 250);
}
function tick() {
  const r = Math.ceil((tEnd - Date.now()) / 1000);
  if (r <= 0) { $('tt').textContent = t('restEnd'); clearInterval(tmr); tmr = null; try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {} return; }
  $('tt').textContent = t('rest', { m: Math.floor(r / 60), s: String(r % 60).padStart(2, '0') });
}
function stopTimer() { clearInterval(tmr); tmr = null; $('timer').style.display = 'none'; }

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
if (S.draft) tab = 'train';
render();
