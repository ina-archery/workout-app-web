'use strict';
// ===== 棒人間アニメ：開始(a)⇄終了(b)の姿勢を往復 =====
// 姿勢: h=腰, s=肩の向き, f=足首(目標), d=手(目標), kb/eb=膝・肘の曲がる向き(+1/-1), g=もう片方の足
const SEG = { T: 44, U: 22, F: 22, TH: 30, SH: 30 };
const P = (h, s, f, d, kb, eb, o) => Object.assign({ h, s, f, d, kb: kb || 1, eb: eb || 1 }, o);
const STH = [100, 74], STS = [100, 30], STF = [100, 134];

function ik(a, t, l1, l2, bend) {
  const dx = t[0] - a[0], dy = t[1] - a[1], d = Math.hypot(dx, dy) || 1e-6;
  const ex = dx / d, ey = dy / d, dd = Math.min(d, l1 + l2 - 0.01);
  const x = (dd * dd + l1 * l1 - l2 * l2) / (2 * dd), h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const nx = bend > 0 ? ey : -ey, ny = bend > 0 ? -ex : ex;
  return [[a[0] + ex * x + nx * h, a[1] + ey * x + ny * h], [a[0] + ex * dd, a[1] + ey * dd]];
}

const pushA = P([94, 109], [134, 90], [40, 134], [136, 134], 1, -1);
const pushB = P([99, 125], [143, 118], [40, 134], [136, 134], 1, -1);
const lyH = [68, 108], lyS = [112, 108], lyF = [46, 134];
const benchPr = [['rect', 44, 112, 116, 8], ['line', 54, 120, 54, 138], ['line', 150, 120, 150, 138]];
const lyA = P(lyH, lyS, lyF, [112, 64], -1, 1), lyB = P(lyH, lyS, lyF, [112, 92], -1, 1);
const seatPr = [['rect', 78, 106, 34, 8], ['rect', 72, 52, 6, 58]];
const sqA = P(STH, STS, STF, [112, 48], 1, -1), sqB = P([78, 104], [104, 66], STF, [126, 66], 1, -1);
const curlA = P(STH, STS, STF, [102, 74], 1, -1), curlB = P(STH, STS, STF, [116, 34], 1, -1);
const hingeA = P(STH, STS, STF, [104, 74], 1, 1);
const crunchP = (s, d) => P([80, 132], s, [56, 134], d, -1, 1);

const ANIM = {
  pushup: { a: pushA, b: pushB },
  incpush: { pr: [['rect', 126, 112, 50, 26]],
    a: P([106, 96], [140, 68], [60, 134], [140, 112], 1, -1), b: P([115, 110], [155, 92], [60, 134], [140, 112], 1, -1) },
  dbpress: { eq: 'db', pr: benchPr, a: lyA, b: lyB },
  dbfly: { eq: 'db', pr: benchPr, a: lyA, b: P(lyH, lyS, lyF, [100, 98], -1, 1) },
  bench: { eq: 'bb', pr: benchPr, a: lyA, b: lyB },
  pecdeck: { pr: seatPr, a: P([90, 102], [88, 58], [120, 134], [124, 62], 1, -1), b: P([90, 102], [88, 58], [120, 134], [98, 60], 1, -1) },
  pullup: { free: 1, pr: [['line', 66, 20, 134, 20]],
    a: P([100, 106], [100, 62], [96, 128], [104, 20], -1, 1, { fa: 1 }), b: P([99, 80], [100, 36], [88, 118], [104, 20], -1, 1, { fa: 1 }) },
  supermanb: { a: P([100, 130], [144, 130], [40, 130], [188, 130], 1, 1), b: P([100, 128], [142, 118], [42, 114], [182, 100], 1, 1, { fa: 1 }) },
  dbrow: { eq: 'db', pr: [['rect', 128, 112, 52, 26]],
    a: P([80, 84], [122, 70], [78, 134], [122, 114], 1, -1, { h2: [136, 112] }), b: P([80, 84], [122, 70], [78, 134], [94, 88], 1, -1, { h2: [136, 112] }) },
  dbpullover: { eq: 'db', pr: benchPr, a: lyA, b: P(lyH, lyS, lyF, [143, 77], -1, 1) },
  deadlift: { eq: 'bb', a: P([78, 100], [118, 86], [100, 134], [120, 126], 1, 1), b: P([102, 74], [103, 30], [100, 134], [106, 74], 1, 1) },
  latpull: { pr: [...seatPr, ['cable', 112, -14]],
    a: P([90, 102], [86, 58], [120, 134], [110, 20], 1, -1), b: P([90, 102], [86, 58], [120, 134], [104, 68], 1, -1) },
  cablerow: { pr: [['rect', 60, 106, 30, 8], ['line', 126, 116, 126, 138], ['cable', 178, 74]],
    a: P([70, 104], [74, 60], [122, 132], [118, 72], 1, -1), b: P([70, 104], [62, 60], [122, 132], [86, 88], 1, -1) },
  squat: { a: sqA, b: sqB },
  lunge: { a: P(STH, STS, STF, [104, 56], 1, -1, { g: [100, 134], gb: 1 }), b: P([100, 102], [100, 58], [126, 134], [104, 84], 1, -1, { g: [68, 128], gb: 1 }) },
  calfb: { a: P(STH, STS, STF, [104, 74], 1, -1), b: P([108, 62], [108, 18], [104, 122], [112, 62], 1, -1, { ft: [113, 136] }) },
  gobsquat: { eq: 'db', a: sqA, b: P([78, 104], [104, 66], STF, [118, 78], 1, -1) },
  dbrdl: { eq: 'db', a: hingeA, b: P([76, 88], [116, 70], STF, [118, 112], 1, 1) },
  bbsquat: { eq: 'bb', a: P(STH, STS, STF, [93, 38], 1, -1), b: P([78, 104], [104, 66], STF, [96, 76], 1, -1) },
  legpress: { free: 1, pr: [['line', 78, 116, 54, 80]],
    a: P([70, 110], [46, 73], [102, 98], [76, 98], 1, -1, { pl: [106, 76, 106, 120] }), b: P([70, 110], [46, 73], [126, 112], [76, 98], 1, -1, { pl: [130, 90, 130, 134] }) },
  legcurl: { pr: [['rect', 70, 112, 98, 8], ['line', 80, 120, 80, 138], ['line', 160, 120, 160, 138]],
    a: P([100, 108], [144, 108], [44, 110], [160, 108], 1, -1, { fa: 1 }), b: P([100, 108], [144, 108], [72, 80], [160, 108], 1, -1, { fa: 1 }) },
  pike: { a: P([59, 76], [92, 105], [45, 134], [125, 134], 1, -1), b: P([68, 82], [106, 106], [45, 134], [125, 134], 1, -1) },
  dbohp: { eq: 'db', a: P(STH, STS, STF, [104, 34], 1, -1), b: P(STH, STS, STF, [103, -12], 1, -1) },
  sidera: { eq: 'db', a: { fv: 1, a: 5, c: 3 }, b: { fv: 1, a: 78, c: 88 } },
  reara: { eq: 'db', a: P([72, 86], [114, 68], [92, 134], [113, 108], 1, -1), b: P([72, 86], [114, 68], [92, 134], [104, 84], 1, -1) },
  ohp: { eq: 'bb', a: P(STH, STS, STF, [108, 36], 1, -1), b: P(STH, STS, STF, [103, -12], 1, -1) },
  facepull: { pr: [['cable', 182, 30]], a: P(STH, STS, STF, [142, 30], 1, 1), b: P(STH, STS, STF, [108, 24], 1, 1) },
  dips: { pr: [['rect', 36, 104, 44, 34]],
    a: P([84, 104], [72, 60], [134, 134], [64, 104], 1, -1), b: P([84, 124], [72, 80], [134, 134], [64, 104], 1, -1) },
  diamond: { a: pushA, b: pushB },
  dbcurl: { eq: 'db', a: curlA, b: curlB },
  dbext: { eq: 'db', a: P(STH, STS, STF, [102, -12], 1, -1), b: P(STH, STS, STF, [90, 26], 1, -1) },
  hammer: { eq: 'db', a: curlA, b: curlB },
  bbcurl: { eq: 'bb', a: curlA, b: curlB },
  pushdown: { pr: [['cable', 124, -14]], a: P(STH, STS, STF, [112, 38], 1, -1), b: P(STH, STS, STF, [104, 74], 1, -1) },
  crunch: { a: crunchP([124, 132], [134, 124]), b: crunchP([94, 90], [102, 82]) },
  plank: { a: P([83, 120], [126, 110], [25, 134], [148, 132], 1, -1), b: P([83, 117], [126, 108], [25, 134], [148, 132], 1, -1) },
  legraise: { a: P([90, 132], [46, 132], [149, 130], [88, 134], 1, 1, { fa: 1 }), b: P([90, 132], [46, 132], [91, 73], [88, 134], 1, 1, { fa: 1 }) },
  russian: { eq: 'db', a: P([90, 132], [67, 94], [132, 98], [100, 86], 1, -1, { fa: 1 }), b: P([90, 132], [67, 94], [132, 98], [100, 70], 1, -1, { fa: 1 }) },
  abwheel: { eq: 'wheel',
    a: P([94, 108], [125, 80], [62, 130], [128, 128], 1, -1), b: P([88, 104], [130, 92], [58, 128], [164, 126], 1, -1) },
};

// 説明文: [日本語の動き, 日本語のコツ, English how, English tip]
const TXT = {
  pushup: ['手を肩幅より少し広めに床につき、体を一直線にして胸が床に近づくまで曲げ、押し戻す。', 'お尻が落ちたり上がったりしないように。', 'Hands slightly wider than shoulders, body in a straight line. Lower your chest toward the floor, then push back up.', "Don't let your hips sag or pike up."],
  incpush: ['台やベンチに手をついて行う腕立て伏せ。床より負荷が軽い。', '体は頭からかかとまで一直線。', 'Push-ups with your hands on a bench or step — easier than on the floor.', 'Keep a straight line from head to heels.'],
  dbpress: ['ベンチに仰向けになり、ダンベルを胸の横から真上に押し上げる。', '下ろすとき肘を開きすぎない（体から45度くらい）。', 'Lie on a bench and press the dumbbells from beside your chest straight up.', "Don't flare your elbows too wide (about 45° from your body)."],
  dbfly: ['腕を広げて胸を開き、胸の前で抱えるように閉じる。（実際は腕が体の横に開きます）', '肘は軽く曲げたまま固定。重すぎるとプレスになる。', 'Open your arms wide to stretch the chest, then bring them together over your chest like a hug. (In reality your arms open out to the sides.)', 'Keep your elbows slightly bent and fixed. Too heavy turns it into a press.'],
  bench: ['バーベルを胸まで下ろし、真上に押し上げる。', '肩甲骨を寄せて胸を張り、足で踏ん張る。補助者かセーフティを使う。', 'Lower the bar to your chest, then press it straight up.', 'Pull your shoulder blades together, chest up, feet planted. Use a spotter or safety pins.'],
  pecdeck: ['座ってグリップを持ち、腕を前で閉じて胸を絞る。（実際は腕が横に開閉します）', '肩をすくめず、胸を張ったまま。', 'Sit, grip the handles, and bring your arms together in front to squeeze the chest. (In reality your arms open and close to the sides.)', "Don't shrug; keep your chest up."],
  pullup: ['バーにぶら下がり、あごがバーを超えるまで体を引き上げる。', '反動を使わず、肩甲骨を下げて背中で引く。きつければ足を台に乗せる。', 'Hang from the bar and pull yourself up until your chin clears it.', 'No swinging — pull with your back, shoulder blades down. Rest feet on a box if it is too hard.'],
  supermanb: ['うつ伏せで、腕と脚を同時に床から持ち上げて数秒キープ。', '首を反らしすぎず、視線は床。', 'Lie face down and lift arms and legs off the floor together; hold a few seconds.', "Don't crank your neck up; keep your eyes on the floor."],
  dbrow: ['ベンチに片手と片膝をつき、ダンベルを腰に向けて引き上げる。', '背中は平らに。肘を後ろに引くイメージ。', 'Support one hand and one knee on a bench, and pull the dumbbell toward your hip.', 'Flat back. Think of driving the elbow backward.'],
  dbpullover: ['ベンチに仰向けで、ダンベルを両手で持ち、頭の後ろへ弧を描いて下ろし、戻す。', '肘は軽く曲げたまま。肩に違和感があれば無理しない。', 'Lie on a bench holding one dumbbell with both hands; lower it in an arc behind your head, then bring it back.', 'Elbows slightly bent. Stop if your shoulders feel uncomfortable.'],
  deadlift: ['バーを足の真ん中に置き、背中をまっすぐに保ったまま、床から立ち上がるように引く。', '腰を丸めない。バーは体に沿わせる。まず軽い重さでフォームを固める。', 'With the bar over mid-foot, keep your back straight and stand up with it from the floor.', "Don't round your back. Keep the bar close. Practice with a light weight first."],
  latpull: ['バーを握って座り、胸に向かって肘を下に引き下ろす。', '上体を倒しすぎず、肩甲骨を下げる意識で。', 'Grip the bar, sit, and pull it down toward your chest by driving your elbows down.', "Don't lean back too far; think shoulder blades down."],
  cablerow: ['座って足を踏ん張り、ハンドルをおなかに向けて引く。', '背中を丸めず、肘を後ろに引いて肩甲骨を寄せる。', 'Sit with feet braced and pull the handle toward your belly.', 'Keep your back straight; pull elbows back and squeeze your shoulder blades.'],
  squat: ['足を肩幅に開き、椅子に座るように腰を落として立ち上がる。', '膝はつま先と同じ向きに。かかとを浮かさない。背中は丸めない。', 'Feet shoulder-width apart. Sit your hips down as if onto a chair, then stand up.', 'Knees track over your toes, heels stay down, back stays straight.'],
  lunge: ['大きく一歩踏み出し、後ろの膝が床に近づくまで腰を落とし、戻す。', '前の膝がつま先より大きく出ないように。上体は起こす。', 'Step forward and lower until your back knee nearly touches the floor, then return.', "Front knee shouldn't travel far past your toes. Keep your torso upright."],
  calfb: ['つま先立ちになり、ふくらはぎを縮めて、ゆっくり下ろす。', '壁や椅子に手を添えてOK。上でひと呼吸止めると効く。', 'Rise onto your toes, squeeze your calves, then lower slowly.', 'Hold a wall or chair if you like. Pause at the top.'],
  gobsquat: ['ダンベルを胸の前で縦に抱え、スクワットを行う。', '胸を起こし、肘を膝の内側に入れるイメージで深く。', 'Hold one dumbbell vertically at your chest and squat.', 'Chest up; let your elbows slide inside your knees at the bottom.'],
  dbrdl: ['ダンベルを太ももの前に持ち、膝を軽く曲げたままお尻を後ろに引いて上体を倒し、戻す。', '背中はまっすぐ。ももの裏が伸びたところまで。', 'Hold dumbbells in front of your thighs. With knees slightly bent, push hips back and lean forward, then return.', 'Straight back. Go down until you feel a stretch in the hamstrings.'],
  bbsquat: ['バーを肩の後ろに担ぎ、スクワットを行う。', '胸を張り、腹圧を入れる。重いときはセーフティバーのあるラックで。', 'Rest the bar on your upper back and squat.', 'Chest up, brace your abs. Use a rack with safety bars when going heavy.'],
  legpress: ['シートに座り、足でプレートを押し出し、膝を曲げて戻す。', '膝を伸ばし切らない。腰がシートから浮かない範囲で。', 'Sit in the seat, push the platform away with your feet, then bend your knees to return.', "Don't lock out your knees; keep your lower back on the seat."],
  legcurl: ['うつ伏せでパッドをかかとに当て、膝を曲げて引き寄せる。', '腰を反らせず、ゆっくり戻す。', 'Lie face down with the pad on your heels; bend your knees to curl it toward you.', "Don't arch your lower back; lower slowly."],
  pike: ['お尻を高く上げた逆V字から、頭を床に近づけるように肘を曲げ、押し戻す。', '肩のトレーニング。頭の真上に押すイメージで。', 'From an upside-down V with hips high, bend your elbows to bring your head toward the floor, then press back.', 'A shoulder exercise — press as if pushing toward the ceiling over your head.'],
  dbohp: ['ダンベルを肩の横に構え、頭の真上に押し上げる。', '腰を反らせない。腹に力を入れて立つ。', 'Hold dumbbells beside your shoulders and press them straight overhead.', "Don't arch your back; keep your abs braced."],
  sidera: ['腕を軽く曲げ、ダンベルを体の横に肩の高さまで持ち上げる。（正面から見た図）', '肘から先に上げるつもりで。肩をすくめない。軽めでOK。', 'With elbows slightly bent, raise the dumbbells out to the sides up to shoulder height. (Front view)', "Lead with your elbows; don't shrug. Light weights are fine."],
  reara: ['上体を前に倒し、ダンベルを体の横へ開くように持ち上げる。（実際は腕が横に開きます）', '背中を丸めず、肩甲骨を寄せすぎない。', 'Bend forward and raise the dumbbells out to your sides. (In reality your arms open out to the sides.)', "Keep your back flat; don't over-squeeze the shoulder blades."],
  ohp: ['バーを鎖骨のあたりに構え、頭の真上に押し上げる。', 'お尻と腹に力を入れ、腰を反らせない。', 'Hold the bar at collarbone height and press it straight overhead.', "Squeeze glutes and abs; don't arch your lower back."],
  facepull: ['ケーブルを顔の高さに合わせ、ロープを顔に向けて、肘を高く後ろに引く。', '肘は肩より高く。肩甲骨を寄せる。', 'Set the cable at face height and pull the rope toward your face, elbows high and back.', 'Elbows above shoulder level; squeeze your shoulder blades.'],
  dips: ['椅子に手を後ろについて、腰を落とし肘を曲げ、押し戻す。', '肘は真後ろ。肩に違和感があれば浅めに。', 'With hands on a chair behind you, bend your elbows to lower your hips, then press back up.', 'Elbows point straight back. Go shallower if your shoulders hurt.'],
  diamond: ['両手を親指と人差し指でひし形にして胸の下につき、腕立て伏せ。', '肘は体に沿わせる。きついときは膝をつく。', 'Push-up with hands close together under your chest, thumbs and index fingers forming a diamond.', "Keep elbows tight to your body. Drop to your knees if it's too hard."],
  dbcurl: ['肘を体の横に固定して、ダンベルを肩に向けて巻き上げる。', '反動を使わず、下ろすときもゆっくり。', 'Keep your elbows pinned to your sides and curl the dumbbells toward your shoulders.', 'No swinging; lower slowly too.'],
  dbext: ['ダンベルを頭の後ろで構え、肘を固定して真上に伸ばす。', '肘は開かない。頭の横で固定。', 'Hold a dumbbell behind your head and extend your arms straight overhead, elbows fixed.', "Don't flare your elbows; keep them near your head."],
  hammer: ['手のひらを内側に向けたまま、ダンベルを巻き上げる。', '前腕もきたえられる。肘は固定。', 'Curl the dumbbells with palms facing each other the whole time.', 'Hits the forearms too. Keep elbows fixed.'],
  bbcurl: ['バーを握り、肘を体の横に固定して巻き上げる。', '上体を反らさない。', 'Grip the bar and curl it up with elbows pinned to your sides.', "Don't lean back."],
  pushdown: ['ケーブルを上から押し下げ、肘を体の横に固定して腕を伸ばす。', '肘を前後に動かさない。伸ばし切って1秒止める。', 'Push the cable down from above, keeping elbows pinned to your sides.', "Don't move your elbows back and forth. Fully extend and pause for a second."],
  crunch: ['仰向けで膝を立て、おへそをのぞくように上体を丸めて肩甲骨を浮かせる。', '首で引かない。反動をつけず、ゆっくり。', 'Lie on your back with knees bent and curl up as if looking at your navel, lifting your shoulder blades.', "Don't pull with your neck. Slow, no momentum."],
  plank: ['ひじをつき、頭からかかとを一直線にしてキープ（回数欄は秒数）。', 'お尻を上げすぎず、腹に力を入れ続ける。', 'Rest on your forearms and hold a straight line from head to heels (the reps field is seconds).', "Don't let hips rise too high; keep your abs tight."],
  legraise: ['仰向けで脚をそろえて持ち上げ、床スレスレまで下ろす。', '腰が浮いたら膝を曲げてOK。手をお尻の下に。', 'Lie on your back and raise your legs together, then lower them to just above the floor.', 'If your lower back lifts, bend your knees. Place hands under your hips.'],
  russian: ['床に座って上体を少し倒し、ダンベルを左右に体をひねりながら動かす。（実際は左右にひねります）', '足を床につけてOK。腹でひねる。', 'Sit with torso leaned back and rotate side to side, moving the dumbbell across your body. (In reality you twist left and right.)', 'Feet can touch the floor. Twist from your abs.'],
  abwheel: ['膝をつき、ローラーを前に転がし、体が伸びたところから腹の力で戻す。', '腰が反らない範囲で。最初は浅くでOK。', 'Kneel and roll the wheel forward, then pull back using your abs.', 'Only as far as you can without arching your back. Start shallow.'],
};

ANIM.bandpull = { band: 1, a: { fv: 1, a: 45, c: -80 }, b: { fv: 1, a: 85, c: 85 } };
ANIM.bandrot = { band: 1, a: { fv: 1, a: 3, c: -85 }, b: { fv: 1, a: 3, c: 75 } };
ANIM.bandrow = ANIM.cablerow;
ANIM.birddog = { a: P([84, 100], [128, 100], [56, 132], [130, 137], 1, -1, { g: [56, 132], gb: 1, h2: [130, 137] }),
  b: P([84, 100], [128, 100], [28, 100], [172, 100], 1, -1, { g: [56, 132], gb: 1, fa: 1, h2: [130, 137] }) };

TXT.bandpull = ['ゴムバンドを両手で持ち、胸の前で腕を伸ばしたまま、左右に引き開いて肩甲骨を寄せる。（正面から見た図）', '肩をすくめず、肩甲骨を背骨に寄せるイメージ。ゆっくり戻す。', 'Hold a band in both hands with arms extended in front of your chest, then pull it apart and squeeze your shoulder blades together. (Front view)', "Don't shrug; think of pulling your shoulder blades toward your spine. Return slowly."];
TXT.bandrow = ['ゴムバンドを柱や足にかけ、ハンドルをおなかに向けて引く。', '背中を丸めず、肘を後ろに引いて肩甲骨を寄せる。', 'Anchor the band to a post or your feet and pull the handles toward your belly.', 'Keep your back straight; pull elbows back and squeeze your shoulder blades.'];
TXT.bandrot = ['ゴムバンドを両手で持ち、肘を脇につけて90度に曲げ、前腕を外側に開く。（正面から見た図）', '肘を体から離さない。軽い負荷で回数を多めに。肩の奥のインナーマッスルに効く。', 'Hold a band in both hands with elbows at your sides bent 90°, then rotate your forearms outward. (Front view)', "Keep your elbows against your body. Use light resistance and more reps. Targets the deep rotator cuff muscles."];
TXT.birddog = ['四つん這いから、片腕と反対側の脚を同時に水平に伸ばして2秒キープし、戻す。左右交互に行う。', '腰を反らさず、背中は水平に。ぐらつかない速さで。', 'On all fours, extend one arm and the opposite leg until level, hold 2 seconds, then return. Alternate sides.', "Don't arch your lower back; keep your back level. Move slowly enough not to wobble."];

ANIM.proneY = { a: P([100, 130], [144, 130], [40, 130], [188, 130], 1, 1), b: P([100, 130], [144, 130], [40, 130], [182, 108], 1, 1) };
ANIM.shrugdown = { eq: 'db', a: { fv: 1, a: 84, c: 88, sy: 8 }, b: { fv: 1, a: 84, c: 88, sy: 0 } };
ANIM.backflat = { a: P([80, 132], [124, 132], [56, 134], [100, 134], -1, 1), b: P([80, 132], [120, 122], [56, 134], [100, 134], -1, 1) };
ANIM.sleg = { a: P(STH, STS, STF, [104, 74], 1, -1, { g: [112, 118], gb: 1 }), b: P(STH, STS, STF, [128, 36], 1, -1, { g: [112, 118], gb: 1 }) };
ANIM.sumohold = { a: P(STH, STS, STF, [104, 74], 1, -1), b: P([78, 104], [104, 66], STF, [118, 84], 1, -1) };

TXT.proneY = ['うつ伏せで両腕を頭の前にY字に伸ばし、親指を上に向けて腕を床から持ち上げ、止めてから下ろす。（横から見た図）', '脚は床につけたまま。肩をすくめず、肩甲骨を下げて背中の下の方で上げる。ペットボトルを持つと負荷が上がる。', 'Lie face down with arms extended in a Y overhead, thumbs up; lift your arms off the floor, pause, then lower. (Side view)', 'Legs stay down. Do not shrug; lift using the lower part of your back with shoulder blades down. Hold water bottles to add load.'];
TXT.shrugdown = ['両腕を肩の高さで真横に伸ばし、少し猫背（背中を軽く丸める）になって、肩を耳に近づけるように持ち上げてから、ストンと下げる。両肩同時に。（正面から見た図）', 'そのままやると背筋で下げがち。アーチェリーで肩を下げるのに必要なのは腹筋なので、軽く丸めて腹筋を使う感覚で。慣れたらゴムを引いたままでも。', 'Hold both arms straight out to the sides at shoulder height with a slightly rounded (hunched) back; lift your shoulders toward your ears, then drop them down. Move both shoulders together. (Front view)', 'Done upright you tend to use your back muscles. In archery the shoulder is held down by the abs, so round slightly and feel your abs doing the work. Later try it while stretching a band.'];
TXT.backflat = ['仰向けで膝を立て、背骨を床にへばりつかせるように、腰を床に押しつけて5秒キープ。頭だけを少し上げておへそをのぞくと腹筋が入りやすい。5秒休んで繰り返す。（回数欄は5秒キープの回数）', '腰の下にタオルを入れて、引き抜かれても抜けないように腹筋で押さえつける、と考えると感覚がわかりやすい。首に力を入れすぎない。', 'Lie on your back with knees bent and press your spine flat against the floor, holding 5 seconds. Lifting just your head to look at your navel helps engage the abs. Rest 5 seconds and repeat. (Reps = number of 5-second holds)', 'Put a towel under your lower back and imagine someone trying to pull it out — hold it down with your abs. Keep neck tension low.'];
TXT.sleg = ['片足で立ち、反対の足を軽く浮かせて30秒キープ。左右とも行う（回数欄は秒数。慣れたら腕を真横に上げたり、ペットボトルを持つとさらに難しくなります）。', '足の裏全体で床を踏み、お尻を軽く締めて、体を傾けずに立つ。ぐらつくときは壁に指を添えてOK。', 'Stand on one leg with the other foot just off the floor and hold 30 seconds. Do both sides (the reps field is seconds). To make it harder, raise your arms out to the sides or hold a bottle.', 'Press your whole foot into the floor, lightly squeeze your glutes and do not lean. Touch a wall with a finger if you wobble.'];
TXT.sumohold = ['足を肩幅より大きく開き、つま先を外に向けて腰を落とし（四股立ち）、お尻を後ろに突き出して背中を反らせた姿勢で30秒キープ。（実際は脚が左右に開きます）', '膝とつま先を同じ向きに。「お尻ツン・背中を反らす」姿勢を崩さずにキープ。きついときは浅めに。', 'Stand with feet wider than shoulders, toes turned out, sink into a wide squat (sumo stance), stick your hips back and keep your back arched. Hold 30 seconds. (In reality your legs spread out to the sides.)', 'Knees over toes. Hold the hips-back, arched-back position without letting it collapse. Go shallower if it is too hard.'];

// アーチェリーでの狙い [日本語, English]
const ARN = {
  supermanb: ['引き分けで背中を締めて姿勢を保つ、背中の筋肉（脊柱起立筋・僧帽筋）を鍛えます。', 'Builds the back muscles that hold your posture while drawing.'],
  dbrow: ['引き腕を後ろへ引く動きと同じ筋肉（広背筋・菱形筋）に効きます。', 'Trains the same muscles (lats, rhomboids) that pull your draw arm back.'],
  pullup: ['引く力そのものを底上げする、背中全体の種目です。', 'A full back exercise that raises your raw pulling strength.'],
  latpull: ['背中の引く力を安全に重くして鍛えられます。', 'A safe way to load your pulling strength.'],
  cablerow: ['肩甲骨を寄せる動き＝引き分けの背中の張り（バックテンション）に直結します。', 'Squeezing the shoulder blades is exactly the back tension you use at full draw.'],
  bandpull: ['背中の張り（バックテンション）を作る肩甲骨まわりに効きます。ゴムを引く動きは、リリースで引き手のヒジを背中側へ回す感覚づくりにも役立ちます。練習前のウォームアップにも。', 'Targets the shoulder-blade muscles behind back tension. Band-only, so it also works as a warm-up before shooting.'],
  bandrow: ['引き分けの背中の使い方に近い動きです。', 'A movement close to how your back works during the draw.'],
  bandrot: ['肩のインナーマッスル（回旋筋腱板）を鍛え、肩のケガ予防と安定に効きます。', 'Strengthens the rotator cuff for shoulder stability and injury prevention.'],
  reara: ['後ろ肩（三角筋後部）は引き腕を後ろに引く力と、肩の安定に使います。', 'The rear delts help pull the draw arm back and stabilise the shoulder.'],
  sidera: ['弓を持つ腕を、ぶれずに支える肩の力になります。軽めで。', 'Builds the shoulder strength that holds the bow arm steady. Keep it light.'],
  dbohp: ['弓腕の肩を安定させる力になります。軽めで。', 'Builds stability in the bow-arm shoulder. Keep it light.'],
  facepull: ['肩甲骨まわりと肩の安定、ケガ予防に効きます。', 'Works the shoulder-blade area for stability and injury prevention.'],
  dbext: ['弓を押す腕の肘を安定させる三頭筋を鍛えます。', 'Trains the triceps that keep the bow-arm elbow stable.'],
  pushdown: ['弓を押す腕の肘を安定させる三頭筋を鍛えます。', 'Trains the triceps that keep the bow-arm elbow stable.'],
  hammer: ['前腕と握りの安定に使う筋肉に効きます。', 'Hits the forearm muscles used for a steady grip.'],
  proneY: ['引き手側の下部僧帽筋は、熟練者ほどよく使うという研究があり、肩甲骨を安定させる要になります。', 'Research found skilled archers use the lower trapezius of the draw arm more; it is a key shoulder-blade stabiliser.'],
  shrugdown: ['押し手の肩が上がったり背中側へ逃げたりしないよう、肩を下げて保つ感覚を作ります。肩を下げるのは背筋ではなく腹筋、という感覚づくりです。', 'Builds the feel of keeping the bow-side shoulder down so it neither rises nor slips back — and that the abs, not the back muscles, are what hold it down.'],
  backflat: ['アーチェリーの立ち方の土台です。背中が反らない「お尻にえくぼ・腹筋で背骨をまっすぐ」の感覚を作ります。', 'The foundation of an archery stance: builds the feel of a flat spine with the abs engaged and no back arch.'],
  sleg: ['弓を持ち上げても重心が両足の真ん中に残る感覚をつくります（記事では片足立ちで射つ練習も紹介）。', 'Builds the feel of keeping your weight centered while lifting the bow (the article even suggests shooting on one leg).'],
  sumohold: ['リリースで体がぶれないよう、足腰と体幹をまとめて締める力を養います（四股立ちで射つ練習の下地）。', 'Builds the leg and trunk tension that keeps your body from moving at release.'],
  plank: ['体幹が安定すると、射型が崩れにくくなります。', 'A stable core keeps your shooting form from breaking down.'],
  birddog: ['体幹と左右のバランスを鍛え、立ち姿勢の安定に効きます。', 'Trains core and left-right balance for a steadier stance.'],
  legraise: ['腹筋を鍛え、射型を支える体幹の力になります。', 'Strengthens the abs that support your shooting posture.'],
  pushup: ['肩甲骨を安定させる前鋸筋と、弓を押す側の肩の安定に効きます。', 'Builds the serratus and bow-side shoulder stability.'],
};

// ===== 描画 =====
function solve(p) {
  const H = p.h, dx = p.s[0] - H[0], dy = p.s[1] - H[1], dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl;
  const S = [H[0] + ux * SEG.T, H[1] + uy * SEG.T];
  const head = [S[0] + ux * 12, S[1] + uy * 12];
  const [em, hd] = ik(S, p.d, SEG.U, SEG.F, p.eb);
  const [km, an] = ik(H, p.f, SEG.TH, SEG.SH, p.kb);
  const leg2 = p.g ? ik(H, p.g, SEG.TH, SEG.SH, p.gb || p.kb) : null;
  const arm2 = p.h2 ? ik(S, p.h2, SEG.U, SEG.F, p.eb2 || p.eb) : null;
  return { H, S, head, em, hd, km, an, leg2, arm2 };
}
const ln = (a, b, c, w, o) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${o ? ` opacity="${o}"` : ''}/>`;
const BODY = 'var(--tx)', PROP = 'var(--sub)', ACC = 'var(--ac)';

function toeOf(p, an, km) {
  if (p.ft) return p.ft;
  if (p.fa) { const dx = an[0] - km[0], dy = an[1] - km[1], l = Math.hypot(dx, dy) || 1; return [an[0] + dx / l * 9, an[1] + dy / l * 9]; }
  return [an[0] + 9, Math.min(136, an[1] + 3)];
}
function weight(eq, hd) {
  if (eq === 'db') return `<circle cx="${hd[0].toFixed(1)}" cy="${hd[1].toFixed(1)}" r="6" fill="${ACC}"/>`;
  if (eq === 'bb') return `<circle cx="${hd[0].toFixed(1)}" cy="${hd[1].toFixed(1)}" r="9" fill="none" stroke="${ACC}" stroke-width="4"/>`;
  if (eq === 'wheel') return `<circle cx="${hd[0].toFixed(1)}" cy="${hd[1].toFixed(1)}" r="7" fill="none" stroke="${ACC}" stroke-width="4"/>`;
  return '';
}
function propsSVG(list, hd) {
  let o = '';
  for (const q of list || []) {
    if (q[0] === 'rect') o += `<rect x="${q[1]}" y="${q[2]}" width="${q[3]}" height="${q[4]}" rx="3" fill="var(--line)"/>`;
    else if (q[0] === 'line') o += ln([q[1], q[2]], [q[3], q[4]], PROP, 3);
    else if (q[0] === 'cable') o += ln([q[1], q[2]], hd, PROP, 1.5, .8);
  }
  return o;
}
function faceSVG(hc, ux, uy, flip, mood) {
  const sg = flip ? -1 : 1, nx = -uy * sg, ny = ux * sg;
  const at = (f, v) => [(hc[0] + nx * f + ux * v).toFixed(1), (hc[1] + ny * f + uy * v).toFixed(1)];
  let o = '';
  const e = at(3.4, 1.8);
  o += `<circle cx="${e[0]}" cy="${e[1]}" r="1.5" fill="${BODY}"/>`;
  if (mood === 'cheer') { const m = at(4.4, -2.8); o += `<circle cx="${m[0]}" cy="${m[1]}" r="1.9" fill="${BODY}"/>`; }
  else if (mood === 'hard') { const a1 = at(4.4, -1.6), b1 = at(4.4, -4.2); o += `<line x1="${a1[0]}" y1="${a1[1]}" x2="${b1[0]}" y2="${b1[1]}" stroke="${BODY}" stroke-width="1.4" stroke-linecap="round"/>`; }
  else { const a1 = at(3.6, -1.8), c1 = at(5.6, -3.2), b1 = at(3.6, -4.6); o += `<path d="M${a1[0]} ${a1[1]} Q${c1[0]} ${c1[1]} ${b1[0]} ${b1[1]}" fill="none" stroke="${BODY}" stroke-width="1.3" stroke-linecap="round"/>`; }
  if (mood === 'hard' || mood === 'rest') { const sw = at(-4.5, 8.5); o += `<circle cx="${sw[0]}" cy="${sw[1]}" r="1.8" fill="#7dd3fc"/>`; }
  return o;
}
function faceFront(mood) {
  let o = `<circle cx="96.5" cy="13" r="1.4" fill="${BODY}"/><circle cx="103.5" cy="13" r="1.4" fill="${BODY}"/>`;
  if (mood === 'cheer') o += `<path d="M96.5 16.5 Q100 22 103.5 16.5 Z" fill="${BODY}"/>`;
  else if (mood === 'hard') o += `<line x1="97.5" y1="18.5" x2="102.5" y2="18.5" stroke="${BODY}" stroke-width="1.3" stroke-linecap="round"/>`;
  else o += `<path d="M96.5 17 Q100 21 103.5 17" fill="none" stroke="${BODY}" stroke-width="1.3" stroke-linecap="round"/>`;
  if (mood === 'hard' || mood === 'rest') o += `<circle cx="108.5" cy="9" r="1.7" fill="#7dd3fc"/>`;
  return o;
}
function figFront(p, ex, mood) {
  const rad = x => x * Math.PI / 180, O = [];
  const sy = p.sy || 0;
  let o = ln([88, 30 - sy], [112, 30 - sy], BODY, 5) + ln([100, 30 - sy], [100, 74], BODY, 5) + ln([92, 74], [108, 74], BODY, 5) +
    ln([93, 74], [93, 134], BODY, 5) + ln([107, 74], [107, 134], BODY, 5) + `<circle cx="100" cy="14" r="8" fill="none" stroke="${BODY}" stroke-width="4"/>` + faceFront(mood);
  const hands = [];
  for (const sg of [-1, 1]) {
    const sh = [100 + sg * 12, 30 - sy], e = [sh[0] + sg * Math.sin(rad(p.a)) * SEG.U, sh[1] + Math.cos(rad(p.a)) * SEG.U];
    const hd = [e[0] + sg * Math.sin(rad(p.c)) * SEG.F, e[1] + Math.cos(rad(p.c)) * SEG.F];
    o += ln(sh, e, BODY, 5) + ln(e, hd, BODY, 5) + weight(ex.eq, hd);
    hands.push(hd);
  }
  if (ex.band) o += ln(hands[0], hands[1], ACC, 2.5);
  return o;
}
function figSVG(p, ex, mood) {
  const bg = '<line x1="0" y1="138" x2="200" y2="138" stroke="var(--line)" stroke-width="2"/>';
  if (p.fv) return bg + figFront(p, ex, mood);
  const r = solve(p), pl = p.pl ? ln([p.pl[0], p.pl[1]], [p.pl[2], p.pl[3]], PROP, 4) : '';
  let o = bg + propsSVG(ex.pr, r.hd) + pl;
  if (r.leg2) {
    const t2 = toeOf(p, r.leg2[1], r.leg2[0]);
    o += ln(r.H, r.leg2[0], BODY, 5, .45) + ln(r.leg2[0], r.leg2[1], BODY, 5, .45) + ln(r.leg2[1], t2, BODY, 5, .45);
  }
  const toe = toeOf(p, r.an, r.km);
  o += ln(r.H, r.km, BODY, 5) + ln(r.km, r.an, BODY, 5) + ln(r.an, toe, BODY, 5);
  if (r.arm2) o += ln(r.S, r.arm2[0], BODY, 5, .45) + ln(r.arm2[0], r.arm2[1], BODY, 5, .45);
  o += ln(r.H, r.S, BODY, 6);
  o += `<circle cx="${r.head[0].toFixed(1)}" cy="${r.head[1].toFixed(1)}" r="8" fill="none" stroke="${BODY}" stroke-width="4"/>`;
  { const du = Math.hypot(r.S[0] - r.H[0], r.S[1] - r.H[1]) || 1; o += faceSVG(r.head, (r.S[0] - r.H[0]) / du, (r.S[1] - r.H[1]) / du, ex.flip, mood); }
  o += ln(r.S, r.em, BODY, 5) + ln(r.em, r.hd, BODY, 5) + weight(ex.eq, r.hd);
  return o;
}
function mix(a, b, t) {
  const o = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const va = a[k] !== undefined ? a[k] : b[k], vb = b[k] !== undefined ? b[k] : a[k];
    if (Array.isArray(va) && typeof va[0] === 'number') o[k] = va.map((x, i) => x + (vb[i] - x) * t);
    else if (typeof va === 'number' && !['kb', 'eb', 'gb', 'fv', 'fa'].includes(k)) o[k] = va + (vb - va) * t;
    else o[k] = t < .5 ? va : vb;
  }
  return o;
}

// ===== モーダル =====
let animRaf = 0;
function closeInfo() { cancelAnimationFrame(animRaf); const m = document.getElementById('info'); if (m) m.remove(); }
function showInfo(id) {
  const ex = ANIM[id], tx = TXT[id];
  if (!ex || !tx) return;
  closeInfo();
  const en = L() === 'en', e = BYID[id];
  const m = document.createElement('div');
  m.id = 'info';
  m.innerHTML = `<div class="sheet"><div class="row"><b style="font-size:18px">${esc(exName(id))}</b><button class="btn sm sec" id="icl">${t('close')}</button></div>
    <div class="muted">${partName(e[2])}</div>
    <svg id="isvg" viewBox="0 -20 200 170" style="width:100%;max-height:44vh;margin:8px 0;background:#0b1220;border-radius:10px"></svg>
    <div style="margin-bottom:8px"><b>${t('how')}</b><div>${en ? tx[2] : tx[0]}</div></div>
    <div><b style="color:var(--ac)">${t('tip')}</b><div>${en ? tx[3] : tx[1]}</div></div>${ARN[id] ? `<div style="margin-top:8px;padding:8px;border-radius:8px;background:#111827"><b>🏹 ${t('archNote')}</b><div>${en ? ARN[id][1] : ARN[id][0]}</div></div>` : ''}</div>`;
  document.body.appendChild(m);
  m.onclick = ev => { if (ev.target === m) closeInfo(); };
  document.getElementById('icl').onclick = closeInfo;
  const svg = document.getElementById('isvg'), t0 = performance.now(), CY = 3200;
  const ease = x => x * x * (3 - 2 * x);
  const loop = now => {
    const u = ((now - t0) % CY) / CY * 3200; let k;
    if (u < 500) k = 0; else if (u < 1600) k = ease((u - 500) / 1100); else if (u < 2100) k = 1; else k = 1 - ease((u - 2100) / 1100);
    svg.innerHTML = figSVG(mix(ex.a, ex.b, k), ex);
    animRaf = requestAnimationFrame(loop);
  };
  animRaf = requestAnimationFrame(loop);
}

// ===== 重心チェック（開発用）：重心の真下が、足・手などの接地範囲に入っているか =====
function balanceOf(p, ex) {
  if (p.fv || ex.free) return null;
  const r = solve(p), M = [];
  const add = (pt, m) => M.push([pt[0], pt[1], m]);
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const ld = ex.eq === 'bb' ? 3 : ex.eq === 'db' ? 1.5 : 0;
  add(r.head, 8); add(mid(r.H, r.S), 48);
  const legs = [[r.km, r.an], r.leg2 ? [r.leg2[0], r.leg2[1]] : [r.km, r.an]];
  for (const [k, an] of legs) { add(mid(r.H, k), 10); add(mid(k, an), 4.6); }
  const arms = [[r.em, r.hd, 1], r.arm2 ? [r.arm2[0], r.arm2[1], 0] : [r.em, r.hd, 1]];
  for (const [e, h, w] of arms) { add(mid(r.S, e), 2.7); add(mid(e, h), 2.2); if (w) add(h, ld); }
  const tot = M.reduce((s, m) => s + m[2], 0), cx = M.reduce((s, m) => s + m[0] * m[2], 0) / tot;
  // 接地点
  const tops = (ex.pr || []).filter(q => q[0] === 'rect').map(q => ({ x1: q[1], x2: q[1] + q[3], y: q[2] }));
  const pl = p.pl ? [p.pl] : [];
  const pts = [r.H, r.S, r.head, r.km, r.an, r.hd, r.arm2 && r.arm2[1], r.leg2 && r.leg2[1], r.leg2 && r.leg2[0], toeOf(p, r.an, r.km), r.leg2 && toeOf(p, r.leg2[1], r.leg2[0])].filter(Boolean);
  const heel = [r.an[0] - 3, r.an[1]];
  pts.push(heel);
  const contact = [];
  for (const q of pts) {
    if (q[1] >= 127) contact.push(q[0]);
    else for (const t of tops) if (q[0] >= t.x1 - 2 && q[0] <= t.x2 + 2 && Math.abs(q[1] - t.y) <= 6) contact.push(q[0]);
  }
  const tm = mid(r.H, r.S); if (tm[1] >= 120) contact.push(tm[0]);
  if (r.H[1] >= 127) contact.push(r.H[0] - 6, r.H[0] + 4);
  for (const q of [r.hd, r.arm2 && r.arm2[1]]) if (q && q[1] >= 120) contact.push(q[0]);
  const t1 = toeOf(p, r.an, r.km); if (t1[1] >= 127) contact.push(t1[0] - 6);
  if (p.pl) contact.push(...[r.an[0], r.an[0] + 9]);
  if (!contact.length) return { cx, lo: NaN, hi: NaN, ok: false, note: '接地なし' };
  const lo = Math.min(...contact) - 3, hi = Math.max(...contact) + 3;
  return { cx, lo, hi, ok: cx >= lo && cx <= hi };
}
function checkBalance() {
  const bad = [];
  for (const id of Object.keys(ANIM)) for (const k of ['a', 'b']) {
    const b = balanceOf(ANIM[id][k], ANIM[id]);
    if (b && !b.ok) bad.push(`${id}.${k} COM=${b.cx.toFixed(0)} 接地=[${isNaN(b.lo) ? '-' : b.lo.toFixed(0)},${isNaN(b.hi) ? '-' : b.hi.toFixed(0)}]`);
  }
  return bad;
}

['bench', 'dbpress', 'dbfly', 'dbpullover', 'crunch', 'backflat'].forEach(id => { ANIM[id].flip = 1; });
