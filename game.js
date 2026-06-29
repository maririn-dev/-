/**
 * 戦国守 ─ せんごくしゅ ─
 * game.js  ─  全ゲームロジック
 *
 * 機能:
 *  - 武将選択・ゲーム開始/続行
 *  - 城攻め（歴史クイズで勝敗判定）
 *  - 武士トレード＋謀反システム
 *  - 年終了・ゲーム終了判定
 *  - LocalStorage セーブ/ロード
 *  - 設定管理・記録画面
 */

'use strict';

/* ==============================================
   定数・マスターデータ
   ============================================== */

/** 武将マスター */
const WARRIORS = [
  { id: 'nobunaga', name: '織田信長', reading: 'おだのぶなが', emoji: '🔥', region: '尾張', basePower: 90, castleStart: '清洲城' },
  { id: 'hideyoshi', name: '豊臣秀吉', reading: 'とよとみひでよし', emoji: '🌸', region: '近江', basePower: 80, castleStart: '長浜城' },
  { id: 'ieyasu',  name: '徳川家康', reading: 'とくがわいえやす', emoji: '🐢', region: '三河', basePower: 75, castleStart: '岡崎城' },
  { id: 'shingen',  name: '武田信玄', reading: 'たけだしんげん', emoji: '🐉', region: '甲斐', basePower: 85, castleStart: '躑躅ヶ崎館' },
  { id: 'kenshin',  name: '上杉謙信', reading: 'うえすぎけんしん', emoji: '⚡', region: '越後', basePower: 88, castleStart: '春日山城' },
  { id: 'mitsuhide', name: '明智光秀', reading: 'あけちみつひで', emoji: '🌕', region: '丹波', basePower: 78, castleStart: '亀山城' },
  { id: 'masamune', name: '伊達政宗', reading: 'だてまさむね', emoji: '🌙', region: '陸奥', basePower: 82, castleStart: '米沢城' },
  { id: 'yukimura', name: '真田幸村', reading: 'さなだゆきむら', emoji: '🍁', region: '信濃', basePower: 83, castleStart: '上田城' },
];

/** 城マスター（全国の実在城） */
const ALL_CASTLES = [
  { id: 'kiyosu',    name: '清洲城',     emoji: '🏯', region: '尾張', power: 70 },
  { id: 'nagahama',  name: '長浜城',     emoji: '🏯', region: '近江', power: 65 },
  { id: 'okazaki',   name: '岡崎城',     emoji: '🏯', region: '三河', power: 68 },
  { id: 'tsutsujigasaki', name: '躑躅ヶ崎館', emoji: '🏯', region: '甲斐', power: 80 },
  { id: 'kasugayama', name: '春日山城',  emoji: '🏯', region: '越後', power: 78 },
  { id: 'kameyama',  name: '亀山城',     emoji: '🏯', region: '丹波', power: 62 },
  { id: 'yonezawa',  name: '米沢城',     emoji: '🏯', region: '陸奥', power: 72 },
  { id: 'ueda',      name: '上田城',     emoji: '🏯', region: '信濃', power: 74 },
  { id: 'osaka',     name: '大坂城',     emoji: '🏯', region: '摂津', power: 100 },
  { id: 'himeji',    name: '姫路城',     emoji: '🏯', region: '播磨', power: 90 },
  { id: 'edo',       name: '江戸城',     emoji: '🏯', region: '武蔵', power: 95 },
  { id: 'nagoya',    name: '名古屋城',   emoji: '🏯', region: '尾張', power: 88 },
  { id: 'kumamoto',  name: '熊本城',     emoji: '🏯', region: '肥後', power: 85 },
  { id: 'matsuyama', name: '松山城',     emoji: '🏯', region: '伊予', power: 70 },
  { id: 'matsumoto', name: '松本城',     emoji: '🏯', region: '信濃', power: 75 },
  { id: 'tsuruga',   name: '鶴ヶ城',     emoji: '🏯', region: '陸奥', power: 72 },
  { id: 'nijo',      name: '二条城',     emoji: '🏯', region: '山城', power: 82 },
  { id: 'inuyama',   name: '犬山城',     emoji: '🏯', region: '尾張', power: 68 },
  { id: 'marugame',  name: '丸亀城',     emoji: '🏯', region: '讃岐', power: 65 },
  { id: 'hiroshima', name: '広島城',     emoji: '🏯', region: '安芸', power: 78 },
];

/** 雇用可能な武士マスター */
const HIRE_WARRIORS = [
  { id: 'w1', name: '前田利家', emoji: '⚔', power: 30, riskLevel: 0.1, cost: '─' },
  { id: 'w2', name: '黒田官兵衛', emoji: '🧠', power: 40, riskLevel: 0.15, cost: '─' },
  { id: 'w3', name: '島津義弘', emoji: '🐗', power: 50, riskLevel: 0.2, cost: '─' },
  { id: 'w4', name: '本多忠勝', emoji: '🛡', power: 35, riskLevel: 0.08, cost: '─' },
  { id: 'w5', name: '石田三成', emoji: '📜', power: 28, riskLevel: 0.25, cost: '─' },
  { id: 'w6', name: '加藤清正', emoji: '🐯', power: 45, riskLevel: 0.12, cost: '─' },
  { id: 'w7', name: '福島正則', emoji: '🪓', power: 42, riskLevel: 0.18, cost: '─' },
  { id: 'w8', name: '竹中半兵衛', emoji: '🌿', power: 38, riskLevel: 0.05, cost: '─' },
];

/** 歴史クイズデータベース */
const QUIZ_DB = [
  {
    q: '本能寺の変が起きたのは何年？',
    choices: ['1573年', '1582年', '1600年', '1615年'],
    correct: 1,
    hint: '信長が倒れた年じゃ'
  },
  {
    q: '関ヶ原の戦いが起きたのは何年？',
    choices: ['1582年', '1590年', '1600年', '1615年'],
    correct: 2,
    hint: '天下分け目の戦いじゃ'
  },
  {
    q: '豊臣秀吉が初めて使った城はどれ？',
    choices: ['大坂城', '長浜城', '姫路城', '伏見城'],
    correct: 1,
    hint: '近江の城じゃ'
  },
  {
    q: '武田信玄の旗印といえば何？',
    choices: ['疾如風', '天下布武', '愛', '無'],
    correct: 0,
    hint: '孫子の兵法からとったとも言われる'
  },
  {
    q: '織田信長が桶狭間の戦いで破ったのは誰？',
    choices: ['今川義元', '武田信玄', '斎藤道三', '浅井長政'],
    correct: 0,
    hint: '東海道の大名じゃ'
  },
  {
    q: '上杉謙信が本拠としていた国はどこ？',
    choices: ['甲斐', '信濃', '越後', '越前'],
    correct: 2,
    hint: '日本海側の国じゃ'
  },
  {
    q: '姫路城の別名は何？',
    choices: ['烏城', '白鷺城', '金鯱城', '鶴ヶ城'],
    correct: 1,
    hint: '白い鳥にたとえられるぞ'
  },
  {
    q: '大坂夏の陣が終わったのは何年？',
    choices: ['1600年', '1605年', '1610年', '1615年'],
    correct: 3,
    hint: '豊臣家が滅んだ年じゃ'
  },
  {
    q: '徳川家康が征夷大将軍に任命されたのは何年？',
    choices: ['1600年', '1603年', '1608年', '1615年'],
    correct: 1,
    hint: '江戸幕府が始まった年じゃ'
  },
  {
    q: '伊達政宗の異名は？',
    choices: ['甲斐の虎', '越後の龍', '独眼竜', '鬼島津'],
    correct: 2,
    hint: '片目が特徴的な武将じゃ'
  },
  {
    q: '長篠の戦いで信長が用いた戦法は？',
    choices: ['騎馬隊突撃', '鉄砲三段撃ち', '水攻め', '火攻め'],
    correct: 1,
    hint: '新しい兵器を使った革新的な戦法じゃ'
  },
  {
    q: '明智光秀が謀反を起こした際の言葉とされるのは？',
    choices: ['天下布武', '是非に及ばず', '敵は本能寺にあり', '人間五十年'],
    correct: 2,
    hint: '家臣たちに告げた言葉じゃ'
  },
  {
    q: '真田幸村が最後に戦った場所は？',
    choices: ['関ヶ原', '大坂城', '長篠', '姉川'],
    correct: 1,
    hint: '大坂の陣で勇戦した'
  },
  {
    q: '島津義弘が活躍した有名な戦いは？',
    choices: ['川中島', '桶狭間', '関ヶ原', '長篠'],
    correct: 2,
    hint: '天下分け目の戦いで敵中突破した'
  },
  {
    q: '秀吉が行った「太閤検地」の目的は？',
    choices: ['人口調査', '土地と収穫量の統一測量', '城の建設', '外国との貿易'],
    correct: 1,
    hint: '土地の管理をするためじゃ'
  },
  {
    q: '豊臣秀吉の出身地はどこ？',
    choices: ['尾張', '近江', '摂津', '山城'],
    correct: 0,
    hint: '信長と同じ国の出身じゃ'
  },
  {
    q: '信長が天下布武の印章を使い始めたのはいつ頃？',
    choices: ['桶狭間以前', '桶狭間後', '上洛後', '本能寺直前'],
    correct: 2,
    hint: '京に上った後のことじゃ'
  },
  {
    q: '武田信玄と上杉謙信が繰り返し戦った場所は？',
    choices: ['関ヶ原', '川中島', '長篠', '姉川'],
    correct: 1,
    hint: '信濃の地で何度も激突した'
  },
  {
    q: '熊本城を築いたのは誰？',
    choices: ['加藤清正', '島津義弘', '黒田官兵衛', '細川忠興'],
    correct: 0,
    hint: '朝鮮出兵でも有名な武将じゃ'
  },
  {
    q: '日本初の天守閣とされる城は？',
    choices: ['姫路城', '安土城', '松本城', '大坂城'],
    correct: 1,
    hint: '信長が琵琶湖のほとりに築いた城じゃ'
  },
];

/** AI（CPU）武将名 */
const CPU_WARRIOR_NAMES = [
  '毛利元就', '今川義元', '北条氏康', '長宗我部元親',
  '大友宗麟', '龍造寺隆信', '尼子晴久', '斎藤道三',
];

/* ==============================================
   ゲーム状態
   ============================================== */

/** デフォルトのゲームステート */
const DEFAULT_STATE = () => ({
  phase: 'home',          // 'home' | 'battle' | 'end'
  warrior: null,          // 選択した武将オブジェクト
  playerPower: 0,         // 現在の戦力
  playerCastles: [],      // 所有城IDリスト
  allCastles: [],         // 全城情報（所有者情報込み）
  myWarriors: [],         // 武士団リスト
  currentYear: 1,         // 現在の年（1〜maxYears）
  maxYears: 5,            // 年数上限
  battlesThisYear: 0,     // 今年の出陣回数
  maxBattlesPerYear: 3,   // 年間最大出陣回数
  usedQuizIds: [],        // 使用済みクイズIDセット
  yearLog: [],            // 各年のログ
});

let gameState = DEFAULT_STATE();

/** 設定 */
let settings = {
  se: true,
  maxYears: 5,
  difficulty: 'normal',
  fontSize: 'large',
};

/** セーブキー */
const SAVE_KEY    = 'sengoku_save_v1';
const SETTING_KEY = 'sengoku_settings_v1';
const RANKING_KEY = 'sengoku_ranking_v1';

/* ==============================================
   ユーティリティ
   ============================================== */

/**
 * ランダム整数 [min, max]
 */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 配列からランダム要素を取得
 */
function randPick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

/**
 * 配列をシャッフル（Fisher–Yates）
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * トースト通知表示
 */
function showToast(msg, duration = 2800) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), duration);
}

/**
 * SE再生（ビープ音をWeb Audio APIで生成）
 */
function playSE(type) {
  if (!settings.se) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    // タイプ別
    const seMap = {
      win:       { freq: 880, dur: 0.3, type: 'square' },
      lose:      { freq: 220, dur: 0.4, type: 'sawtooth' },
      click:     { freq: 440, dur: 0.1, type: 'square' },
      rebellion: { freq: 110, dur: 0.6, type: 'sawtooth' },
      fanfare:   { freq: 660, dur: 0.5, type: 'triangle' },
    };
    const se = seMap[type] || seMap.click;
    osc.type = se.type;
    osc.frequency.setValueAtTime(se.freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + se.dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + se.dur);
  } catch (_) { /* 対応なし */ }
}

/* ==============================================
   画面切り替え
   ============================================== */

/** 画面IDに対応するDOM */
const SCREENS = [
  'screen-loading', 'screen-home', 'screen-select',
  'screen-battle', 'screen-settings', 'screen-ranking'
];

/**
 * 指定した画面をアクティブにする
 */
function showScreen(id) {
  SCREENS.forEach(s => {
    const el = document.getElementById(s);
    el.classList.remove('active');
    el.style.display = '';
  });
  const target = document.getElementById(id);
  target.classList.add('active');
  target.style.display = 'flex';
}

/* ==============================================
   LocalStorage
   ============================================== */

/** ゲーム状態を保存 */
function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
  } catch (e) { console.warn('save failed', e); }
}

/** ゲーム状態を読み込み（戻り値: true=成功） */
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data && data.phase === 'battle') {
      gameState = { ...DEFAULT_STATE(), ...data };
      return true;
    }
  } catch (e) { console.warn('load failed', e); }
  return false;
}

/** 設定を保存 */
function saveSettings() {
  try {
    localStorage.setItem(SETTING_KEY, JSON.stringify(settings));
  } catch (e) {}
}

/** 設定を読み込み */
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTING_KEY);
    if (raw) settings = { ...settings, ...JSON.parse(raw) };
  } catch (e) {}
}

/** 記録を取得 */
function getRanking() {
  try {
    const raw = localStorage.getItem(RANKING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

/** 記録に追加（上位10件を保存） */
function saveRanking(entry) {
  try {
    const ranking = getRanking();
    ranking.push(entry);
    ranking.sort((a, b) => b.castles - a.castles || b.power - a.power);
    const top10 = ranking.slice(0, 10);
    localStorage.setItem(RANKING_KEY, JSON.stringify(top10));
  } catch (e) {}
}

/* ==============================================
   ゲーム初期化
   ============================================== */

/**
 * 全城を初期化（AI所有/空き地をランダムに配置）
 */
function initCastles(playerWarrior) {
  const castles = ALL_CASTLES.map(c => ({ ...c, ownerId: null, ownerName: '空き城' }));

  // プレイヤー開始城
  const startIdx = castles.findIndex(c => c.name === playerWarrior.castleStart);
  if (startIdx !== -1) {
    castles[startIdx].ownerId = 'player';
    castles[startIdx].ownerName = playerWarrior.name;
  } else {
    castles[0].ownerId = 'player';
    castles[0].ownerName = playerWarrior.name;
  }

  // AIに城を配布（城数の40%をAIに）
  const unownedIdxs = castles.map((c, i) => i).filter(i => !castles[i].ownerId);
  const aiCount = Math.floor(unownedIdxs.length * 0.4);
  shuffle(unownedIdxs).slice(0, aiCount).forEach(i => {
    const cpuName = randPick(CPU_WARRIOR_NAMES);
    castles[i].ownerId = 'cpu_' + i;
    castles[i].ownerName = cpuName;
  });

  return castles;
}

/**
 * 新しいゲームを開始する
 */
function startNewGame(warrior) {
  const castles = initCastles(warrior);
  const playerCastleIds = castles.filter(c => c.ownerId === 'player').map(c => c.id);

  gameState = {
    ...DEFAULT_STATE(),
    phase: 'battle',
    warrior,
    playerPower: warrior.basePower,
    playerCastles: playerCastleIds,
    allCastles: castles,
    myWarriors: [],
    currentYear: 1,
    maxYears: settings.maxYears,
    battlesThisYear: 0,
    maxBattlesPerYear: getDifficultyConfig().maxBattles,
    usedQuizIds: [],
    yearLog: [],
  };

  saveGame();
  showBattleScreen();
}

/**
 * 難易度設定を返す
 */
function getDifficultyConfig() {
  const map = {
    easy:   { maxBattles: 4, rebellionMult: 0.6 },
    normal: { maxBattles: 3, rebellionMult: 1.0 },
    hard:   { maxBattles: 2, rebellionMult: 1.4 },
  };
  return map[settings.difficulty] || map.normal;
}

/* ==============================================
   バトル画面描画
   ============================================== */

/** バトル画面を表示・描画する */
function showBattleScreen() {
  showScreen('screen-battle');
  renderBattleHeader();
  renderMap();
  renderTradeTab();
  renderStatusTab();
  switchTab('map');
}

/** バトルヘッダー更新 */
function renderBattleHeader() {
  const { warrior, playerCastles, playerPower, currentYear, maxYears } = gameState;
  document.getElementById('b-player-name').textContent = warrior ? warrior.name : '─';
  document.getElementById('b-year').textContent = `${currentYear}年目 / ${maxYears}年`;
  document.getElementById('b-castles').textContent = `城: ${playerCastles.length}`;
  document.getElementById('b-power').textContent = `戦力: ${playerPower}`;
}

/**
 * 地図タブを描画
 */
function renderMap() {
  const { allCastles, playerCastles, battlesThisYear, maxBattlesPerYear } = gameState;
  const mapEl = document.getElementById('castle-map');
  mapEl.innerHTML = '';

  allCastles.forEach(castle => {
    const isMine = castle.ownerId === 'player';
    const isEmpty = !castle.ownerId;
    const isEnemy = !isMine;

    const node = document.createElement('div');
    node.className = `castle-node ${isMine ? 'mine' : 'enemy'}`;
    node.dataset.castleId = castle.id;

    // 出陣可否
    const canAttack = isEnemy && battlesThisYear < maxBattlesPerYear;

    node.innerHTML = `
      <div class="castle-emoji">${castle.emoji}</div>
      <div class="castle-name">${castle.name}</div>
      <div class="castle-owner-label">${castle.region}</div>
      <div class="castle-owner-name" style="color:${isMine ? 'var(--red-deep)' : 'var(--wood)'}">
        ${castle.ownerName}
      </div>
      <div class="castle-power-label">防御力: ${castle.power}</div>
      ${isMine ? '<div class="mine-badge">🎌 我が城</div>' : ''}
      ${canAttack ? '<div class="mine-badge" style="background:var(--red-main);color:var(--paper);border-color:var(--red-deep);margin-top:4px;">⚔ 攻める</div>' : ''}
      ${!isMine && !canAttack && battlesThisYear >= maxBattlesPerYear ? '<div style="font-size:12px;color:var(--wood);margin-top:4px;">今年は出陣済み</div>' : ''}
    `;

    // 攻撃クリックイベント
    if (canAttack) {
      node.addEventListener('click', () => onAttackCastle(castle));
    }

    mapEl.appendChild(node);
  });

  // 年終了ボタンのテキスト更新
  const btnEndYear = document.getElementById('btn-end-year');
  if (gameState.currentYear >= gameState.maxYears) {
    btnEndYear.textContent = '🏆 ゲーム終了';
  } else {
    btnEndYear.textContent = `📅 ${gameState.currentYear}年を終える`;
  }
}

/**
 * タブ切り替え
 */
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(tc => {
    tc.classList.toggle('active', tc.id === 'tab-' + tabId);
  });
}

/* ==============================================
   城攻め（クイズ）
   ============================================== */

/** 現在攻撃中の城 */
let currentAttackCastle = null;

/**
 * 城を攻める → クイズモーダルを表示
 */
function onAttackCastle(castle) {
  playSE('click');
  currentAttackCastle = castle;
  showQuizModal(castle);
}

/**
 * クイズをランダムに選択（未使用優先）
 */
function pickQuiz() {
  const unused = QUIZ_DB.filter((_, i) => !gameState.usedQuizIds.includes(i));
  const pool = unused.length > 0 ? unused : QUIZ_DB;
  const idx = QUIZ_DB.indexOf(randPick(pool));
  gameState.usedQuizIds.push(idx);
  // 全問使ったらリセット
  if (gameState.usedQuizIds.length >= QUIZ_DB.length) {
    gameState.usedQuizIds = [];
  }
  return { ...QUIZ_DB[idx], idx };
}

/**
 * クイズモーダルを表示
 */
function showQuizModal(castle) {
  const quiz = pickQuiz();
  const power = gameState.playerPower;

  // 戦力が高いと選択肢を絞れる（4択→2択）
  // basePowerが80以上なら2択まで絞れる
  let choiceCount = 4;
  if (power >= 80) choiceCount = 2;
  else if (power >= 60) choiceCount = 3;

  // 正解を含む choiceCount 個の選択肢をセット
  const correctText = quiz.choices[quiz.correct];
  let shownChoices;
  if (choiceCount >= 4) {
    // 全選択肢
    shownChoices = quiz.choices.map((text, i) => ({ text, isCorrect: i === quiz.correct }));
  } else {
    // 正解 + ランダムに誤答を追加
    const wrongs = quiz.choices
      .map((text, i) => ({ text, isCorrect: i === quiz.correct }))
      .filter(c => !c.isCorrect);
    shownChoices = shuffle(wrongs).slice(0, choiceCount - 1);
    shownChoices.push({ text: correctText, isCorrect: true });
    shownChoices = shuffle(shownChoices);
  }

  // ヒント
  let hintText = '';
  if (power >= 50) hintText = `💡 ヒント: ${quiz.hint}`;
  else if (power >= 70) hintText = `💡 ヒント（絞り込み）: 選択肢を${choiceCount}択に絞ったぞ！`;

  // UI 更新
  document.getElementById('quiz-battle-info').textContent =
    `⚔ ${gameState.warrior.name} vs ${castle.ownerName}「${castle.name}」攻略戦`;
  document.getElementById('quiz-question').textContent = quiz.q;
  document.getElementById('quiz-hint').textContent =
    `戦力: ${power} / ${choiceCount}択で出陣！ ${hintText}`;

  const choicesEl = document.getElementById('quiz-choices');
  choicesEl.innerHTML = '';
  shownChoices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'quiz-choice-btn';
    btn.textContent = choice.text;
    btn.addEventListener('click', () => onQuizAnswer(choice.isCorrect, btn, choicesEl));
    choicesEl.appendChild(btn);
  });

  document.getElementById('quiz-feedback').classList.add('hidden');
  document.getElementById('modal-quiz').classList.remove('hidden');
}

/**
 * クイズ回答処理
 */
function onQuizAnswer(isCorrect, clickedBtn, choicesEl) {
  // 全ボタンを無効化
  choicesEl.querySelectorAll('.quiz-choice-btn').forEach(b => {
    b.disabled = true;
    if (b === clickedBtn) {
      b.classList.add(isCorrect ? 'correct' : 'wrong');
    }
  });

  const feedbackEl = document.getElementById('quiz-feedback');
  feedbackEl.classList.remove('hidden', 'win', 'lose');

  if (isCorrect) {
    playSE('win');
    feedbackEl.classList.add('win');
    feedbackEl.textContent = '🎉 正解！城を奪い取ったぞ！';
    // 城を獲得
    setTimeout(() => {
      captureCastle(currentAttackCastle);
      closeQuizModal();
    }, 1800);
  } else {
    playSE('lose');
    feedbackEl.classList.add('lose');
    feedbackEl.textContent = '💀 不正解…撃退された！';
    // 戦力ペナルティ
    setTimeout(() => {
      const penalty = Math.floor(currentAttackCastle.power * 0.1);
      gameState.playerPower = Math.max(10, gameState.playerPower - penalty);
      closeQuizModal();
      showToast(`敗北…戦力が${penalty}減った`);
    }, 1800);
  }
}

/**
 * 城を取得する処理
 */
function captureCastle(castle) {
  const { warrior } = gameState;
  castle.ownerId = 'player';
  castle.ownerName = warrior.name;
  if (!gameState.playerCastles.includes(castle.id)) {
    gameState.playerCastles.push(castle.id);
  }
  // 戦力増加
  gameState.playerPower += Math.floor(castle.power * 0.2);
  gameState.battlesThisYear++;

  showToast(`🎌「${castle.name}」を攻略！\n戦力+${Math.floor(castle.power * 0.2)}`);
  saveGame();
  showBattleScreen();
}

/** クイズモーダルを閉じる */
function closeQuizModal() {
  document.getElementById('modal-quiz').classList.add('hidden');
  renderBattleHeader();
  renderMap();
  renderStatusTab();
}

/* ==============================================
   武士トレード
   ============================================== */

/** トレード対象の武士 */
let pendingTradeWarrior = null;

/**
 * トレードタブを描画
 */
function renderTradeTab() {
  const listEl = document.getElementById('trade-warriors-list');
  listEl.innerHTML = '';

  // 雇用可能な武士リスト（既に雇用中の武士は除外）
  const myIds = gameState.myWarriors.map(w => w.id);
  const available = HIRE_WARRIORS.filter(w => !myIds.includes(w.id));

  if (available.length === 0) {
    listEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--wood);font-weight:700;">雇える武士はおらぬ</div>';
  } else {
    available.forEach(w => {
      const card = document.createElement('div');
      card.className = 'trade-card';
      const riskPct = Math.round(w.riskLevel * getDifficultyConfig().rebellionMult * 100);
      card.innerHTML = `
        <div class="trade-card-emoji">${w.emoji}</div>
        <div class="trade-card-info">
          <div class="trade-card-name">${w.name}</div>
          <div class="trade-card-power">戦力 +${w.power}</div>
          <div class="trade-card-risk">謀反確率: ${riskPct}%</div>
        </div>
        <div>
          <button class="btn btn-gold" style="padding:8px 14px;font-size:var(--font-sm);width:auto;">
            雇う
          </button>
        </div>
      `;
      card.querySelector('button').addEventListener('click', (e) => {
        e.stopPropagation();
        onTradeClick(w);
      });
      listEl.appendChild(card);
    });
  }

  // 自分の武士団
  renderMyWarriors();
}

/** 自武士団を描画 */
function renderMyWarriors() {
  const el = document.getElementById('my-warriors-list');
  el.innerHTML = '';
  if (gameState.myWarriors.length === 0) {
    el.innerHTML = '<div style="color:var(--wood);font-size:var(--font-sm);padding:8px;">武士はおらぬ</div>';
    return;
  }
  gameState.myWarriors.forEach(w => {
    const card = document.createElement('div');
    card.className = 'my-warrior-card';
    card.innerHTML = `
      <div class="my-warrior-emoji">${w.emoji}</div>
      <div class="my-warrior-name">${w.name}</div>
      <div class="my-warrior-power">戦力 +${w.power}</div>
    `;
    el.appendChild(card);
  });
}

/**
 * 武士を雇うボタンを押した時
 */
function onTradeClick(warrior) {
  playSE('click');
  pendingTradeWarrior = warrior;
  const riskPct = Math.round(warrior.riskLevel * getDifficultyConfig().rebellionMult * 100);

  document.getElementById('trade-detail').innerHTML = `
    <div style="text-align:center;font-size:40px;margin-bottom:8px;">${warrior.emoji}</div>
    <div style="text-align:center;font-size:var(--font-lg);font-weight:900;color:var(--red-deep);margin-bottom:12px;">${warrior.name}</div>
    <div style="line-height:2;">
      戦力増加: <strong>+${warrior.power}</strong><br>
      謀反確率: <span class="trade-risk-badge">${riskPct}%</span>
    </div>
    <div style="margin-top:12px;background:var(--red-light);padding:8px 12px;border:2px solid var(--red-main);font-size:var(--font-sm);color:var(--red-deep);font-weight:700;">
      ⚠ 謀反が起きると戦力が大幅に減る！<br>それでも雇うか？
    </div>
  `;
  document.getElementById('modal-trade').classList.remove('hidden');
}

/**
 * トレード確定
 */
function confirmTrade() {
  if (!pendingTradeWarrior) return;
  playSE('click');

  const warrior = pendingTradeWarrior;
  const riskVal = warrior.riskLevel * getDifficultyConfig().rebellionMult;

  // 謀反チェック
  if (Math.random() < riskVal) {
    // 謀反発生！
    document.getElementById('modal-trade').classList.add('hidden');
    triggerRebellion(warrior);
  } else {
    // 正常雇用
    gameState.myWarriors.push(warrior);
    gameState.playerPower += warrior.power;
    document.getElementById('modal-trade').classList.add('hidden');
    pendingTradeWarrior = null;
    showToast(`${warrior.name}を雇った！\n戦力+${warrior.power}`);
    saveGame();
    renderBattleHeader();
    renderTradeTab();
    renderStatusTab();
  }
}

/**
 * 謀反発生処理
 */
function triggerRebellion(warrior) {
  playSE('rebellion');
  const penalty = Math.floor(gameState.playerPower * 0.35);
  gameState.playerPower = Math.max(10, gameState.playerPower - penalty);

  // 所有城も一つ失う可能性
  let lostCastle = null;
  if (gameState.playerCastles.length > 1 && Math.random() < 0.5) {
    const lostId = gameState.playerCastles[randInt(1, gameState.playerCastles.length - 1)];
    gameState.playerCastles = gameState.playerCastles.filter(id => id !== lostId);
    const lostC = gameState.allCastles.find(c => c.id === lostId);
    if (lostC) {
      lostC.ownerId = 'cpu_rebel';
      lostC.ownerName = warrior.name + '（謀反）';
      lostCastle = lostC;
    }
  }

  document.getElementById('rebellion-detail').innerHTML = `
    <div style="font-size:48px;margin-bottom:8px;">💀</div>
    <strong>${warrior.name}</strong>が謀反を起こした！<br><br>
    戦力が <strong style="font-size:var(--font-xl);">-${penalty}</strong> 減った！<br>
    ${lostCastle ? `<br>「<strong>${lostCastle.name}</strong>」を奪われた！` : ''}
    <br><br>現在の戦力: <strong>${gameState.playerPower}</strong>
  `;
  pendingTradeWarrior = null;
  saveGame();
  document.getElementById('modal-rebellion').classList.remove('hidden');
}

/* ==============================================
   状勢タブ
   ============================================== */

/** 状勢タブを描画 */
function renderStatusTab() {
  const { allCastles, playerCastles, myWarriors, currentYear, maxYears } = gameState;

  // 所有城
  const castleListEl = document.getElementById('status-castle-list');
  castleListEl.innerHTML = '';
  const myCastles = allCastles.filter(c => playerCastles.includes(c.id));
  if (myCastles.length === 0) {
    castleListEl.innerHTML = '<div style="color:var(--wood);padding:8px;">城がない</div>';
  } else {
    myCastles.forEach(c => {
      const row = document.createElement('div');
      row.className = 'status-castle-row';
      row.innerHTML = `
        <span class="status-castle-emoji">${c.emoji}</span>
        <span class="status-castle-name">${c.name}</span>
        <span class="status-castle-region">${c.region}</span>
      `;
      castleListEl.appendChild(row);
    });
  }

  // 武士団
  const warriorListEl = document.getElementById('status-warrior-list');
  warriorListEl.innerHTML = '';
  if (myWarriors.length === 0) {
    warriorListEl.innerHTML = '<div style="color:var(--wood);padding:8px;">武士はおらぬ</div>';
  } else {
    myWarriors.forEach(w => {
      const row = document.createElement('div');
      row.className = 'status-warrior-row';
      row.innerHTML = `
        <span class="status-warrior-emoji">${w.emoji}</span>
        <span class="status-warrior-name">${w.name}</span>
        <span class="status-warrior-power">+${w.power}</span>
      `;
      warriorListEl.appendChild(row);
    });
  }

  // 進行状況
  const progressEl = document.getElementById('status-progress');
  progressEl.innerHTML = '';
  for (let y = 1; y <= maxYears; y++) {
    const row = document.createElement('div');
    row.className = 'progress-year-row';
    const dot = document.createElement('div');
    dot.className = 'progress-year-dot';
    if (y < currentYear) dot.classList.add('done');
    else if (y === currentYear) dot.classList.add('current');
    const label = document.createElement('span');
    label.className = 'progress-year-label';
    label.textContent = `${y}年目${y < currentYear ? '（終了）' : y === currentYear ? '（現在）' : ''}`;
    row.appendChild(dot);
    row.appendChild(label);
    progressEl.appendChild(row);
  }
}

/* ==============================================
   年終了処理
   ============================================== */

/**
 * 年を終える
 */
function endYear() {
  playSE('click');
  const { currentYear, maxYears, playerCastles, playerPower } = gameState;

  // ログに記録
  gameState.yearLog.push({
    year: currentYear,
    castles: playerCastles.length,
    power: playerPower,
  });

  // AI行動（ランダムに城を移動）
  doAITurn();

  const isLastYear = currentYear >= maxYears;

  if (isLastYear) {
    // ゲーム終了
    endGame();
    return;
  }

  // 年終了サマリー
  document.getElementById('year-end-title').textContent = `📅 ${currentYear}年が終わった`;
  document.getElementById('year-end-summary').innerHTML = `
    <strong>${currentYear}年目の結果</strong><br>
    所有城数: <strong>${playerCastles.length}城</strong><br>
    現在の戦力: <strong>${playerPower}</strong><br>
    武士団: <strong>${gameState.myWarriors.length}人</strong><br>
    <br>
    次は <strong>${currentYear + 1}年目</strong> じゃ。
  `;
  document.getElementById('modal-year-end').classList.remove('hidden');
}

/**
 * AI（CPU）のターン処理
 * ─ 空き城を取ったり、プレイヤーの城を狙う
 */
function doAITurn() {
  const { allCastles, playerCastles } = gameState;

  // 空き城にAIが入る
  const emptyCastles = allCastles.filter(c => !c.ownerId);
  emptyCastles.forEach(c => {
    if (Math.random() < 0.6) {
      const cpuName = randPick(CPU_WARRIOR_NAMES);
      c.ownerId = 'cpu_ai';
      c.ownerName = cpuName;
    }
  });

  // 一定確率でプレイヤーの城を攻める（難易度反映）
  const diff = getDifficultyConfig();
  const attackChance = diff.rebellionMult * 0.15;
  if (playerCastles.length > 1 && Math.random() < attackChance) {
    // 一番防御力の低い城を狙う
    const vulnerable = allCastles
      .filter(c => playerCastles.includes(c.id))
      .sort((a, b) => a.power - b.power)[0];
    if (vulnerable) {
      const attacker = randPick(CPU_WARRIOR_NAMES);
      vulnerable.ownerId = 'cpu_ai';
      vulnerable.ownerName = attacker;
      gameState.playerCastles = gameState.playerCastles.filter(id => id !== vulnerable.id);
      showToast(`⚠ ${attacker}が「${vulnerable.name}」を奪った！`);
    }
  }
}

/**
 * 次の年へ進む
 */
function proceedNextYear() {
  gameState.currentYear++;
  gameState.battlesThisYear = 0;
  document.getElementById('modal-year-end').classList.add('hidden');
  saveGame();
  showBattleScreen();
  playSE('click');
  showToast(`⚔ ${gameState.currentYear}年目が始まった！`);
}

/* ==============================================
   ゲーム終了
   ============================================== */

/**
 * ゲームを終了し結果を表示
 */
function endGame() {
  playSE('fanfare');
  const { warrior, playerCastles, playerPower, maxYears, yearLog } = gameState;

  // 最終城数でランク判定
  const castleCount = playerCastles.length;
  let resultTitle, resultEmoji, resultMsg;
  if (castleCount >= 10) {
    resultTitle = '天下統一！';
    resultEmoji = '👑';
    resultMsg = '汝は真の覇者となった！歴史に名を刻んだぞ！';
  } else if (castleCount >= 6) {
    resultTitle = '大勝利！';
    resultEmoji = '🏆';
    resultMsg = '見事な戦績じゃ！更なる高みを目指せ！';
  } else if (castleCount >= 3) {
    resultTitle = '健闘した！';
    resultEmoji = '⚔';
    resultMsg = '悪くない。されど天下はまだ遠い。';
  } else {
    resultTitle = '敗北…';
    resultEmoji = '💀';
    resultMsg = '城を守れなかった。再起を期せ！';
  }

  document.getElementById('game-end-title').textContent = `${resultEmoji} ${resultTitle}`;
  document.getElementById('game-end-content').innerHTML = `
    <div class="result-big">${resultEmoji}</div>
    <div style="font-size:var(--font-xl);font-weight:900;color:var(--red-deep);margin:8px 0;">${warrior.name}</div>
    <div style="margin:12px 0;background:var(--paper-dark);border:2px solid var(--wood);padding:12px;text-align:left;line-height:2;">
      最終城数: <strong>${castleCount}城</strong><br>
      最終戦力: <strong>${playerPower}</strong><br>
      武士団数: <strong>${gameState.myWarriors.length}人</strong><br>
      ゲーム年数: <strong>${maxYears}年</strong>
    </div>
    <div style="font-weight:700;color:var(--red-deep);font-size:var(--font-lg);">${resultMsg}</div>
  `;

  // 記録を保存
  saveRanking({
    name: warrior.name,
    emoji: warrior.emoji,
    castles: castleCount,
    power: playerPower,
    years: maxYears,
    date: new Date().toLocaleDateString('ja-JP'),
  });

  // セーブを削除（ゲーム終了）
  localStorage.removeItem(SAVE_KEY);
  gameState.phase = 'end';

  document.getElementById('modal-game-end').classList.remove('hidden');
}

/* ==============================================
   ホーム画面
   ============================================== */

/** ホーム画面を描画 */
function renderHomeScreen() {
  const hasSave = loadGame();
  document.getElementById('btn-continue').disabled = !hasSave;

  // プレイヤー情報（セーブがある場合）
  if (hasSave && gameState.warrior) {
    document.getElementById('home-player-name').textContent = gameState.warrior.name;
    document.getElementById('home-castle-count').textContent = gameState.playerCastles.length;
    document.getElementById('home-power').textContent = gameState.playerPower;
    document.getElementById('home-years-left').textContent = gameState.maxYears - gameState.currentYear + 1;

    // 所有城チップ
    const chipList = document.getElementById('home-castle-list');
    chipList.innerHTML = '';
    const myCastles = gameState.allCastles.filter(c => gameState.playerCastles.includes(c.id));
    if (myCastles.length === 0) {
      chipList.innerHTML = '<span style="color:var(--wood)">なし</span>';
    } else {
      myCastles.forEach(c => {
        const chip = document.createElement('span');
        chip.className = 'castle-chip';
        chip.textContent = c.name;
        chipList.appendChild(chip);
      });
    }
  } else {
    document.getElementById('home-player-name').textContent = '─';
    document.getElementById('home-castle-count').textContent = '0';
    document.getElementById('home-power').textContent = '0';
    document.getElementById('home-years-left').textContent = settings.maxYears;
    document.getElementById('home-castle-list').innerHTML = '<span style="color:var(--wood)">なし</span>';
  }

  showScreen('screen-home');
}

/* ==============================================
   武将選択画面
   ============================================== */

/** 武将選択画面を描画 */
function renderWarriorSelect() {
  const grid = document.getElementById('warrior-grid');
  grid.innerHTML = '';
  WARRIORS.forEach(w => {
    const card = document.createElement('div');
    card.className = 'warrior-card';
    const pct = (w.basePower / 100) * 100;
    card.innerHTML = `
      <div class="warrior-emoji">${w.emoji}</div>
      <div class="warrior-name">${w.name}</div>
      <div class="warrior-reading">${w.reading}</div>
      <div class="warrior-power-bar-wrap">
        <div class="warrior-power-bar" style="width:${pct}%"></div>
      </div>
      <div class="warrior-power-label">戦力: ${w.basePower}</div>
      <div class="warrior-region">📍 ${w.region}出身</div>
    `;
    card.addEventListener('click', () => {
      playSE('click');
      if (confirm(`「${w.name}」でゲームを始めますか？\n（${w.reading}）`)) {
        startNewGame(w);
      }
    });
    grid.appendChild(card);
  });
  showScreen('screen-select');
}

/* ==============================================
   設定画面
   ============================================== */

/** 設定画面を描画・初期化 */
function initSettingsScreen() {
  document.getElementById('toggle-se').checked = settings.se;
  document.getElementById('select-max-years').value = String(settings.maxYears);
  document.getElementById('select-difficulty').value = settings.difficulty;
  document.getElementById('select-font-size').value = settings.fontSize;
  showScreen('screen-settings');
}

/** 設定を保存して適用 */
function applySettings() {
  settings.se = document.getElementById('toggle-se').checked;
  settings.maxYears = parseInt(document.getElementById('select-max-years').value, 10);
  settings.difficulty = document.getElementById('select-difficulty').value;
  settings.fontSize = document.getElementById('select-font-size').value;
  saveSettings();
  applyFontSize();
}

/** フォントサイズをbodyクラスで切り替え */
function applyFontSize() {
  document.body.classList.remove('font-normal', 'font-large', 'font-xlarge');
  document.body.classList.add('font-' + settings.fontSize);
}

/* ==============================================
   記録画面
   ============================================== */

/** 記録一覧を描画 */
function renderRanking() {
  const list = getRanking();
  const el = document.getElementById('ranking-list');
  el.innerHTML = '';
  if (list.length === 0) {
    el.innerHTML = '<div class="ranking-empty">まだ記録がない。<br>戦に出よ！</div>';
    return;
  }
  list.forEach((entry, i) => {
    const rankEmoji = ['🥇', '🥈', '🥉'][i] || '🏅';
    const item = document.createElement('div');
    item.className = 'ranking-item';
    item.innerHTML = `
      <div class="ranking-rank">${rankEmoji}</div>
      <div class="ranking-info">
        <div class="ranking-name">${entry.emoji || '🎌'} ${entry.name}</div>
        <div class="ranking-detail">戦力: ${entry.power} / ${entry.years}年 / ${entry.date}</div>
      </div>
      <div class="ranking-castles">🏯 ${entry.castles}城</div>
    `;
    el.appendChild(item);
  });
  showScreen('screen-ranking');
}

/* ==============================================
   イベントリスナー登録
   ============================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── ローディング ── */
  const bar = document.getElementById('loading-bar');
  const msg = document.getElementById('loading-msg');
  const loadMsgs = ['武将を召集中…', '城を配置中…', '軍備を整えています…', '出陣準備完了！'];
  let pct = 0;
  const loadTimer = setInterval(() => {
    pct += randInt(10, 22);
    if (pct > 100) pct = 100;
    bar.style.width = pct + '%';
    msg.textContent = loadMsgs[Math.min(Math.floor(pct / 25), 3)];
    if (pct >= 100) {
      clearInterval(loadTimer);
      setTimeout(() => {
        loadSettings();
        applyFontSize();
        renderHomeScreen();
      }, 400);
    }
  }, 160);

  /* ── ホーム画面ボタン ── */
  document.getElementById('btn-new-game').addEventListener('click', () => {
    playSE('click');
    renderWarriorSelect();
  });

  document.getElementById('btn-continue').addEventListener('click', () => {
    playSE('click');
    if (loadGame()) {
      showBattleScreen();
    } else {
      showToast('セーブデータが見つからない');
    }
  });

  document.getElementById('btn-settings-home').addEventListener('click', () => {
    playSE('click');
    initSettingsScreen();
  });

  document.getElementById('btn-ranking-home').addEventListener('click', () => {
    playSE('click');
    renderRanking();
  });

  /* ── 武将選択 ── */
  document.getElementById('btn-select-back').addEventListener('click', () => {
    playSE('click');
    renderHomeScreen();
  });

  /* ── バトル画面タブ ── */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSE('click');
      switchTab(btn.dataset.tab);
      if (btn.dataset.tab === 'trade') renderTradeTab();
      if (btn.dataset.tab === 'status') renderStatusTab();
    });
  });

  /* ── 年終了ボタン ── */
  document.getElementById('btn-end-year').addEventListener('click', () => {
    endYear();
  });

  /* ── クイズモーダルは動的に生成するため、ここでは何もしない ── */

  /* ── トレードモーダル ── */
  document.getElementById('btn-trade-confirm').addEventListener('click', () => {
    confirmTrade();
  });
  document.getElementById('btn-trade-cancel').addEventListener('click', () => {
    playSE('click');
    pendingTradeWarrior = null;
    document.getElementById('modal-trade').classList.add('hidden');
  });

  /* ── 謀反モーダル ── */
  document.getElementById('btn-rebellion-ok').addEventListener('click', () => {
    playSE('click');
    document.getElementById('modal-rebellion').classList.add('hidden');
    renderBattleHeader();
    renderTradeTab();
    renderStatusTab();
    renderMap();
  });

  /* ── 年終了モーダル ── */
  document.getElementById('btn-next-year').addEventListener('click', () => {
    proceedNextYear();
  });

  /* ── ゲーム終了モーダル ── */
  document.getElementById('btn-game-end-home').addEventListener('click', () => {
    playSE('click');
    document.getElementById('modal-game-end').classList.add('hidden');
    gameState = DEFAULT_STATE();
    renderHomeScreen();
  });

  /* ── 設定画面 ── */
  // 各設定変更時に即時適用
  ['toggle-se', 'select-max-years', 'select-difficulty', 'select-font-size'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      applySettings();
    });
  });

  document.getElementById('btn-settings-back').addEventListener('click', () => {
    playSE('click');
    applySettings();
    renderHomeScreen();
  });

  document.getElementById('btn-delete-save').addEventListener('click', () => {
    if (confirm('セーブデータを削除しますか？')) {
      localStorage.removeItem(SAVE_KEY);
      gameState = DEFAULT_STATE();
      showToast('セーブデータを削除した');
      renderHomeScreen();
    }
  });

  document.getElementById('btn-reset-ranking').addEventListener('click', () => {
    if (confirm('記録をリセットしますか？')) {
      localStorage.removeItem(RANKING_KEY);
      showToast('記録をリセットした');
    }
  });

  /* ── 記録画面 ── */
  document.getElementById('btn-ranking-back').addEventListener('click', () => {
    playSE('click');
    renderHomeScreen();
  });

  /* ── モーダル外クリックで閉じる（クイズ以外） ── */
  ['modal-trade'].forEach(id => {
    document.getElementById(id).addEventListener('click', (e) => {
      if (e.target.id === id) {
        document.getElementById(id).classList.add('hidden');
        pendingTradeWarrior = null;
      }
    });
  });

}); // DOMContentLoaded end
