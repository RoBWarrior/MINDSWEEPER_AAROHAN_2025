// // api/game2.js
// // Improved Math crossword generator + validator (guaranteed valid slots)

// const express = require('express');
// const router = express.Router();
// const { randomUUID } = require('crypto');

// const SIZE = 7; // keep in sync with frontend
// const OPS = ['+', '-', '*', '/'];

// const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// // Tuned config
// const TARGET_PLACEMENTS = SIZE >= 7 ? 16 : 10;
// const MAX_PLACED_ATTEMPTS = TARGET_PLACEMENTS * 4;
// const MIN_PREFILLED_PERCENT = SIZE >= 7 ? 0.30 : 0.20;
// const MAX_GENERATE_TRIES = 18;

// const games = new Map();

// /* ---------------- Expression helpers ---------------- */

// function evalExprLeftToRight(expr) {
//   if (typeof expr !== 'string') return null;
//   if (!/^[0-9+\-*/]+$/.test(expr)) return null;
//   const nums = [];
//   const ops = [];
//   let cur = '';
//   for (let i = 0; i < expr.length; i++) {
//     const ch = expr[i];
//     if (ch >= '0' && ch <= '9') cur += ch;
//     else {
//       if (cur.length === 0) return null;
//       nums.push(Number(cur));
//       ops.push(ch);
//       cur = '';
//     }
//   }
//   if (cur.length === 0) return null;
//   nums.push(Number(cur));
//   if (nums.length !== ops.length + 1) return null;
//   let acc = nums[0];
//   for (let i = 0; i < ops.length; i++) {
//     const op = ops[i];
//     const nxt = nums[i + 1];
//     if (op === '+') acc = acc + nxt;
//     else if (op === '-') acc = acc - nxt;
//     else if (op === '*') acc = acc * nxt;
//     else if (op === '/') {
//       if (nxt === 0) return null;
//       acc = Math.trunc(acc / nxt);
//     } else return null;
//   }
//   return acc;
// }

// function validateEquationString(s) {
//   if (typeof s !== 'string') return { ok: false, reason: 'not_string' };
//   if (s.indexOf('=') === -1) return { ok: false, reason: 'no_eq' };
//   if ((s.match(/=/g) || []).length !== 1) return { ok: false, reason: 'multiple_eq' };
//   const [left, right] = s.split('=');
//   if (!left || !right) return { ok: false, reason: 'empty_side' };
//   const lv = evalExprLeftToRight(left);
//   const rv = evalExprLeftToRight(right);
//   if (lv === null || rv === null) return { ok: false, reason: 'invalid_expr' };
//   if (lv !== rv) return { ok: false, reason: 'mismatch', leftVal: lv, rightVal: rv };
//   return { ok: true, leftVal: lv, rightVal: rv };
// }

// /* ---------------- Equation builder & placement ---------------- */

// function makeEquation(maxLen) {
//   for (let attempt = 0; attempt < 120; attempt++) {
//     const terms = randInt(1, 3);
//     const parts = [];
//     for (let t = 0; t < terms; t++) {
//       const digits = randInt(1, 2);
//       let num = '';
//       for (let d = 0; d < digits; d++) num += String(randInt(d === 0 ? 1 : 0, 9));
//       parts.push(num);
//       if (t < terms - 1) parts.push(pick(OPS));
//     }
//     const left = parts.join('');
//     const val = evalExprLeftToRight(left);
//     if (val === null) continue;
//     const s = `${left}=${val}`;
//     if (s.length <= maxLen && s.length >= 3) return s;
//   }
//   return null;
// }

// function tryPlaceString(grid, r, c, s, horizontal) {
//   const S = grid.length;
//   const len = s.length;
//   if (horizontal) {
//     if (c + len > S) return false;
//     for (let i = 0; i < len; i++) {
//       const ch = grid[r][c + i];
//       if (ch === '#') return false;
//       if (ch !== null && ch !== s[i]) return false;
//     }
//     for (let i = 0; i < len; i++) grid[r][c + i] = s[i];
//     return true;
//   } else {
//     if (r + len > S) return false;
//     for (let i = 0; i < len; i++) {
//       const ch = grid[r + i][c];
//       if (ch === '#') return false;
//       if (ch !== null && ch !== s[i]) return false;
//     }
//     for (let i = 0; i < len; i++) grid[r + i][c] = s[i];
//     return true;
//   }
// }

// /* ---------------- collectSlots (defensive) ---------------- */

// function collectSlots(solutionGrid) {
//   const S = solutionGrid.length;
//   const isBlock = (cell) => cell === '#' || cell === null || cell === undefined;
//   const across = [];
//   for (let r = 0; r < S; r++) {
//     let c = 0;
//     while (c < S) {
//       while (c < S && isBlock(solutionGrid[r][c])) c++;
//       const start = c;
//       let s = '';
//       while (c < S && !isBlock(solutionGrid[r][c])) {
//         s += solutionGrid[r][c];
//         c++;
//       }
//       const len = c - start;
//       if (len >= 3) across.push({ r, c0: start, s, len });
//     }
//   }
//   const down = [];
//   for (let c = 0; c < S; c++) {
//     let r = 0;
//     while (r < S) {
//       while (r < S && isBlock(solutionGrid[r][c])) r++;
//       const start = r;
//       let s = '';
//       while (r < S && !isBlock(solutionGrid[r][c])) {
//         s += solutionGrid[r][c];
//         r++;
//       }
//       const len = r - start;
//       if (len >= 3) down.push({ c, r0: start, s, len });
//     }
//   }
//   return { across, down };
// }

// /* ---------------- generator (guarantees valid slots) ---------------- */

// function generateCrosswordOnce() {
//   const S = SIZE;
//   const grid = Array.from({ length: S }, () => Array.from({ length: S }, () => null));
//   const placements = [];

//   let placed = 0;
//   for (let attempt = 0; attempt < MAX_PLACED_ATTEMPTS && placed < TARGET_PLACEMENTS; attempt++) {
//     const horizontal = Math.random() < 0.5;
//     const eq = makeEquation(S);
//     if (!eq) continue;
//     const r = randInt(0, S - (horizontal ? 1 : eq.length));
//     const c = randInt(0, S - (horizontal ? eq.length : 1));
//     const ok = tryPlaceString(grid, r, c, eq, horizontal);
//     if (ok) {
//       placements.push({ r, c, s: eq, horizontal });
//       placed++;
//     }
//   }

//   // canonical solution: convert remaining null -> '#'
//   const solution = Array.from({ length: S }, (_, r) =>
//     Array.from({ length: S }, (_, c) => (grid[r][c] === null ? '#' : grid[r][c]))
//   );

//   // collect slots and validate every slot is a valid equation
//   const slots = collectSlots(solution);
//   for (const a of slots.across) {
//     const v = validateEquationString(a.s);
//     if (!v.ok) return null;
//   }
//   for (const d of slots.down) {
//     const v = validateEquationString(d.s);
//     if (!v.ok) return null;
//   }

//   // placedChars & choose prefilled
//   const placedChars = [];
//   for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) {
//     if (solution[r][c] !== '#' && solution[r][c] !== null) placedChars.push({ r, c, v: solution[r][c] });
//   }
//   const targetPrefilled = Math.max(Math.round(placedChars.length * MIN_PREFILLED_PERCENT), Math.min(6, Math.round(placedChars.length * MIN_PREFILLED_PERCENT)));
//   for (let i = placedChars.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     const tmp = placedChars[i]; placedChars[i] = placedChars[j]; placedChars[j] = tmp;
//   }
//   const prefilled = [];
//   for (let i = 0; i < Math.min(targetPrefilled, placedChars.length); i++) prefilled.push({ r: placedChars[i].r, c: placedChars[i].c, value: placedChars[i].v });

//   // build puzzle to show player: '#' for black, prefilled chars shown, others null
//   const puzzle = Array.from({ length: S }, () => Array.from({ length: S }, () => null));
//   const preSet = new Set(prefilled.map(p => `${p.r},${p.c}`));
//   for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) {
//     if (solution[r][c] === '#') puzzle[r][c] = '#';
//     else if (preSet.has(`${r},${c}`)) puzzle[r][c] = prefilled.find(x => x.r === r && x.c === c).value;
//     else puzzle[r][c] = null;
//   }

//   return { puzzle, solution, placements, prefilled, slots };
// }

// function generateCrossword() {
//   for (let t = 0; t < MAX_GENERATE_TRIES; t++) {
//     const res = generateCrosswordOnce();
//     if (!res) continue;
//     const placedCount = res.placements.length;
//     const S = SIZE;
//     let placedChars = 0;
//     let prefilledChars = res.prefilled.length;
//     for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) {
//       if (res.solution[r][c] !== '#' && res.solution[r][c] !== null) placedChars++;
//     }
//     const prefilledRatio = placedChars > 0 ? prefilledChars / placedChars : 0;
//     const slots = collectSlots(res.solution);
//     if (placedCount >= Math.max(4, Math.floor(TARGET_PLACEMENTS * 0.6)) && prefilledRatio >= MIN_PREFILLED_PERCENT * 0.6 && (slots.across.length + slots.down.length) > 0) {
//       const gameId = typeof randomUUID === 'function' ? randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
//       const meta = { size: SIZE, solution: res.solution, puzzle: res.puzzle, placements: res.placements, prefilled: res.prefilled, slots };
//       games.set(gameId, meta);
//       return { gameId, size: SIZE, grid: res.puzzle, prefilled: res.prefilled, solution: res.solution, metaSummary: { placements: res.placements.length, slotsCount: slots.across.length + slots.down.length, prefilledCount: res.prefilled.length } };
//     }
//   }

//   const fallback = generateCrosswordOnce();
//   if (!fallback) throw new Error('Could not generate crossword');
//   const gameId = typeof randomUUID === 'function' ? randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
//   games.set(gameId, { size: SIZE, solution: fallback.solution, puzzle: fallback.puzzle, placements: fallback.placements, prefilled: fallback.prefilled, slots: fallback.slots });
//   return { gameId, size: SIZE, grid: fallback.puzzle, prefilled: fallback.prefilled, solution: fallback.solution, metaSummary: { placements: fallback.placements.length, slotsCount: fallback.slots.across.length + fallback.slots.down.length, prefilledCount: fallback.prefilled.length } };
// }

// /* ---------------- Routes ---------------- */

// router.get('/generate-crossword', (req, res) => {
//   try {
//     const data = generateCrossword();
//     return res.json({ gameId: data.gameId, size: data.size, grid: data.grid, prefilled: data.prefilled, solution: data.solution, summary: data.metaSummary });
//   } catch (err) {
//     console.error('generate-crossword error', err);
//     return res.status(500).json({ error: 'Failed to generate crossword' });
//   }
// });

// router.post('/validate-crossword', (req, res) => {
//   try {
//     const { gameId, userGrid } = req.body;
//     if (!gameId || !games.has(gameId)) return res.status(400).json({ valid: false, solved: false, message: 'Unknown or expired gameId' });
//     const meta = games.get(gameId);
//     const S = meta.size;
//     if (!Array.isArray(userGrid) || userGrid.length !== S) return res.status(400).json({ valid: false, solved: false, message: 'Invalid userGrid' });

//     // Validate allowed characters & black cells
//     for (let r = 0; r < S; r++) {
//       if (!Array.isArray(userGrid[r]) || userGrid[r].length !== S) return res.status(400).json({ valid:false, solved:false, message:'Invalid grid row' });
//       for (let c = 0; c < S; c++) {
//         const solChar = meta.solution[r][c];
//         const u = userGrid[r][c];
//         if (solChar === '#') {
//           if (u !== '#') return res.status(400).json({ valid:false, solved:false, message:`Grid mismatch at ${r},${c} — expected black` });
//         } else {
//           if (u === null || u === undefined || u === '') continue;
//           if (!/^[0-9+\-*/=]$/.test(String(u))) return res.status(400).json({ valid:false, solved:false, message:`Invalid character at ${r},${c}: ${u}` });
//         }
//       }
//     }

//     // Collect slots
//     const slots = collectSlots(meta.solution);
//     const problems = [];

//     for (const a of slots.across) {
//       const { r, c0, len } = a;
//       let raw = '';
//       let incomplete = false;
//       for (let i = 0; i < len; i++) {
//         const ch = userGrid[r][c0 + i];
//         if (ch === null || ch === undefined || ch === '') { incomplete = true; raw += ' '; } else raw += String(ch);
//       }
//       const compact = raw.replace(/\s+/g, '');
//       if (incomplete) { problems.push({ dir:'across', r, c0, len, str: raw, reason: 'incomplete' }); continue; }
//       const v = validateEquationString(compact);
//       if (!v.ok) problems.push({ dir:'across', r, c0, len, str: compact, reason: v.reason, leftVal: v.leftVal, rightVal: v.rightVal });
//     }

//     for (const d of slots.down) {
//       const { c, r0, len } = d;
//       let raw = '';
//       let incomplete = false;
//       for (let i = 0; i < len; i++) {
//         const ch = userGrid[r0 + i][c];
//         if (ch === null || ch === undefined || ch === '') { incomplete = true; raw += ' '; } else raw += String(ch);
//       }
//       const compact = raw.replace(/\s+/g, '');
//       if (incomplete) { problems.push({ dir:'down', c, r0, len, str: raw, reason: 'incomplete' }); continue; }
//       const v = validateEquationString(compact);
//       if (!v.ok) problems.push({ dir:'down', c, r0, len, str: compact, reason: v.reason, leftVal: v.leftVal, rightVal: v.rightVal });
//     }

//     const solved = problems.length === 0;
//     return res.json({ valid: true, solved, problems, slotsCount: slots.across.length + slots.down.length });
//   } catch (err) {
//     console.error('validate-crossword error', err);
//     return res.status(500).json({ valid:false, solved:false, message:'Server error' });
//   }
// });

// module.exports = router;





// routes/game2.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const MathCrosswordGame = require('../models/MathCrosswordGame');

// Utility helpers
function createEmptyGrid(size) {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => ' '));
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Create a simple arithmetic equation string (digits and +-*)
function makeEquation(maxNumber = 99) {
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const a = randInt(1, maxNumber);
  const b = randInt(1, Math.max(1, Math.min(maxNumber, Math.floor(maxNumber/2))));
  let lhs, rhs;
  if (op === '+') {
    lhs = `${a}+${b}`;
    rhs = String(a + b);
  } else if (op === '-') {
    lhs = `${a}-${b}`;
    rhs = String(a - b);
  } else {
    lhs = `${a}*${b}`;
    rhs = String(a * b);
  }
  return `${lhs}=${rhs}`;
}

// Try to place a sequence (string) into the grid, horizontal or vertical
function tryPlace(grid, seq) {
  const N = grid.length;
  const len = seq.length;
  const tries = 300;
  for (let t = 0; t < tries; t++) {
    const vertical = Math.random() < 0.5;
    const maxR = vertical ? N - len : N - 1;
    const maxC = vertical ? N - 1 : N - len;
    const r0 = randInt(0, Math.max(0, maxR));
    const c0 = randInt(0, Math.max(0, maxC));

    let fits = true;
    for (let k = 0; k < len; k++) {
      const r = vertical ? r0 + k : r0;
      const c = vertical ? c0 : c0 + k;
      const cell = grid[r][c];
      if (cell === ' ') continue;
      if (cell !== seq[k]) {
        fits = false;
        break;
      }
    }
    if (!fits) continue;

    for (let k = 0; k < len; k++) {
      const r = vertical ? r0 + k : r0;
      const c = vertical ? c0 : c0 + k;
      grid[r][c] = seq[k];
    }
    return { r: r0, c: c0, vertical, len };
  }
  return null;
}

// Build puzzle: place several equations into grid
function buildPuzzle(size = 12, count = 6) {
  const grid = createEmptyGrid(size).map(row => row.map(_ => ' '));
  const placed = [];
  let attempts = 0;
  while (placed.length < count && attempts < count * 50) {
    attempts++;
    const eq = makeEquation(20);
    const seq = eq.split('');
    const meta = tryPlace(grid, seq);
    if (meta) {
      placed.push({ eq, ...meta });
    }
  }

  if (placed.length === 0) {
    const eq = makeEquation(10);
    const seq = eq.split('');
    const mid = Math.floor((size - seq.length) / 2);
    for (let k = 0; k < seq.length; k++) {
      grid[Math.floor(size / 2)][mid + k] = seq[k];
    }
    placed.push({ eq, r: Math.floor(size / 2), c: mid, vertical: false, len: seq.length });
  }

  const solution = grid.map(row => row.map(ch => (typeof ch === 'string' ? ch : ' ')));
  return { grid: solution, placed };
}

// Extract prefilled positions: either percent or count
function selectPrefills(placed, percentOrCount) {
  const cells = [];
  for (const place of placed) {
    const { r, c, vertical, len } = place;
    for (let k = 0; k < len; k++) {
      const rr = vertical ? r + k : r;
      const cc = vertical ? c : c + k;
      cells.push({ r: rr, c: cc });
    }
  }
  const map = new Map();
  for (const x of cells) map.set(`${x.r},${x.c}`, x);
  const unique = Array.from(map.values());
  shuffleArray(unique);

  // Default: 50% of available cells (and at least 2 if possible)
  if (typeof percentOrCount === 'number') {
    if (percentOrCount > 0 && percentOrCount <= 100) {
      const keep = Math.max(2, Math.floor((percentOrCount / 100) * unique.length));
      return unique.slice(0, Math.min(unique.length, keep));
    }
    if (percentOrCount >= 1 && percentOrCount < 1000) {
      const keep = Math.min(unique.length, Math.max(0, Math.floor(percentOrCount)));
      return unique.slice(0, keep);
    }
  }
  const fallbackKeep = Math.max(2, Math.floor(0.5 * unique.length)); // 50% fallback
  return unique.slice(0, fallbackKeep);
}

// ================== ROUTES ==================

// GET /api/generate-crossword?size=12&count=6&prefill=50
router.get('/generate-crossword', async (req, res) => {
  try {
    const size = Math.max(7, Math.min(20, parseInt(req.query.size || '12', 10)));
    const count = Math.max(1, Math.min(20, parseInt(req.query.count || '6', 10)));
    const prefillParam = req.query.prefill; // percent 0..100 or count

    const { grid, placed } = buildPuzzle(size, count);

    const pfCells = selectPrefills(placed, prefillParam ? Number(prefillParam) : undefined);
    const prefilled = pfCells.map(p => ({ r: p.r, c: p.c, value: grid[p.r][p.c] }));

    const gameId = uuidv4();
    const doc = new MathCrosswordGame({
      gameId,
      size,
      puzzle: grid,
      solution: grid,
      prefilled,
      createdAt: new Date()
    });
    await doc.save();

    res.json({
      success: true,
      gameId,
      _id: doc._id,
      grid,
      prefilled
    });
  } catch (err) {
    console.error('generate-crossword error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate crossword.' });
  }
});

// Safe evaluator and helpers (same as before)
const allowedExprChars = /^[0-9+\-*/().\s]+$/;
function safeEvalNumber(expr) {
  const cleaned = String(expr).replace(/\s+/g, '');
  if (!allowedExprChars.test(cleaned)) {
    throw new Error('Expression contains invalid characters');
  }
  // eslint-disable-next-line no-new-func
  const val = Function(`"use strict"; return (${cleaned});`)();
  if (typeof val !== 'number' || !isFinite(val)) throw new Error('Invalid numeric result');
  return val;
}
function gatherLineTokens(grid, r, c, dr, dc) {
  let i = r, j = c;
  while (
    i - dr >= 0 && j - dc >= 0 &&
    i - dr < grid.length && j - dc < grid[0].length &&
    grid[i - dr][j - dc] !== ' '
  ) {
    i -= dr; j -= dc;
  }
  const tokens = [];
  while (i >= 0 && j >= 0 && i < grid.length && j < grid[0].length && grid[i][j] !== ' ') {
    tokens.push({ r: i, c: j, ch: grid[i][j] });
    i += dr; j += dc;
  }
  return tokens;
}
function findEquations(grid) {
  const eqs = [];
  const R = grid.length, C = grid[0].length;
  for (let r = 0; r < R; r++) {
    let c = 0;
    while (c < C) {
      if (grid[r][c] === ' ') { c++; continue; }
      const seq = gatherLineTokens(grid, r, c, 0, 1);
      c += seq.length;
      const str = seq.map(t => String(t.ch)).join('');
      if (str.includes('=')) eqs.push({ dir: 'row', r, cStart: seq[0].c, text: str });
    }
  }
  for (let c = 0; c < C; c++) {
    let r = 0;
    while (r < R) {
      if (grid[r][c] === ' ') { r++; continue; }
      const seq = gatherLineTokens(grid, r, c, 1, 0);
      r += seq.length;
      const str = seq.map(t => String(t.ch)).join('');
      if (str.includes('=')) eqs.push({ dir: 'col', c, rStart: seq[0].r, text: str });
    }
  }
  return eqs;
}

// POST /api/validate-crossword
router.post('/validate-crossword', async (req, res) => {
  try {
    const { gameId, userGrid } = req.body;

    if (gameId) {
      const game = await MathCrosswordGame.findOne({ gameId }).lean();
      if (game) {
        const solution = game.solution || game.puzzle;
        if (!Array.isArray(userGrid) || userGrid.length !== solution.length) {
          return res.json({ valid: false, message: 'Submitted grid shape does not match stored game.' });
        }
        for (let r = 0; r < solution.length; r++) {
          for (let c = 0; c < solution[r].length; c++) {
            if (solution[r][c] === ' ') continue;
            const sol = String(solution[r][c]);
            const user = userGrid?.[r]?.[c];
            if (user === null || typeof user === 'undefined') {
              return res.json({ valid: false, message: 'Some cells are empty.' });
            }
            if (String(user) !== sol) {
              return res.json({ valid: false, message: 'Incorrect — some cells are wrong.' });
            }
          }
        }

        const awardedPoints = 10;
        // create a new game to return (small generator call)
        const { grid: newGrid, placed } = buildPuzzle(game.size || 12, 6);
        const pfCells = selectPrefills(placed, 50); // default 50% for next game
        const prefilled = pfCells.map(p => ({ r: p.r, c: p.c, value: newGrid[p.r][p.c] }));
        const newGameId = uuidv4();
        const doc = new MathCrosswordGame({
          gameId: newGameId,
          size: newGrid.length,
          puzzle: newGrid,
          solution: newGrid,
          prefilled,
          createdAt: new Date()
        });
        await doc.save();

        return res.json({
          valid: true,
          message: 'Correct! Well done.',
          awardedPoints,
          newGame: { gameId: newGameId, grid: newGrid, prefilled }
        });
      } else {
        // fallthrough to merged-grid validation
      }
    }

    if (!Array.isArray(userGrid) || userGrid.length === 0) {
      return res.json({ valid: false, message: 'No grid provided for validation.' });
    }

    const grid = userGrid.map(row => row.map(cell => (cell === null || typeof cell === 'undefined') ? ' ' : String(cell)));
    const equations = findEquations(grid);
    if (equations.length === 0) {
      return res.json({ valid: false, message: 'No equations found in provided grid.' });
    }

    for (const e of equations) {
      const text = e.text;
      const idx = text.indexOf('=');
      if (idx === -1) continue;
      const lhs = text.slice(0, idx);
      const rhs = text.slice(idx + 1);
      try {
        const lval = safeEvalNumber(lhs);
        const rval = safeEvalNumber(rhs);
        if (Math.abs(lval - rval) > 1e-9) {
          return res.json({ valid: false, message: `Equation ${text} is incorrect.` });
        }
      } catch (err) {
        return res.json({ valid: false, message: `Invalid expression in equation ${text}: ${err.message}` });
      }
    }

    return res.json({ valid: true, message: 'Correct (validated by parsing equations).', awardedPoints: 10 });
  } catch (err) {
    console.error('validate-crossword error:', err);
    res.status(500).json({ valid: false, message: 'Server error during validation.' });
  }
});

module.exports = router;
