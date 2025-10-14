// // api/game2.js
// // Improved Math crossword generator + validator
// // GET  /api/generate-crossword
// // POST /api/validate-crossword  { gameId, userGrid }

// const express = require('express');
// const router = express.Router();
// const { randomUUID } = require('crypto');

// const SIZE = 7; // fixed size (keep in sync with frontend)
// const OPS = ['+', '-', '*', '/'];

// const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// //
// // Configuration tuned for 7x7: more placements and stronger prefilled fraction
// //
// const TARGET_PLACEMENTS = SIZE >= 7 ? 16 : 10; // target number of equations placed
// const MAX_PLACED_ATTEMPTS = TARGET_PLACEMENTS * 4;
// const MIN_PREFILLED_PERCENT = SIZE >= 7 ? 0.30 : 0.20; // fraction of placed-chars prefilled
// const MAX_GENERATE_TRIES = 12; // try generating up to this many times to reach constraints

// // In-memory storage of puzzles and their full solutions (small demo; switch to DB in prod)
// const games = new Map();

// /* ----------------------------
//    Expression evaluation helpers
//    ---------------------------- */

// // Evaluate left-to-right with integer truncating division
// function evalExprLeftToRight(expr) {
//   if (typeof expr !== 'string') return null;
//   // only digits and + - * /
//   if (!/^[0-9+\-*/]+$/.test(expr)) return null;
//   // parse tokens
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

// // Validate an equation string like "12+3=15" (no spaces)
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

// /* ----------------------------
//    Equation builder & placement
//    ---------------------------- */

// // Build a left expression and compute its right side. Keep final "left=right" <= maxLen.
// function makeEquation(maxLen) {
//   // Try builds (random)
//   for (let attempt = 0; attempt < 80; attempt++) {
//     const terms = randInt(1, 3); // number of numeric terms on left
//     const parts = [];
//     for (let t = 0; t < terms; t++) {
//       const digits = randInt(1, 2); // 1 or 2 digit numbers
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

// // Try to place string s in grid at r,c horizontally or vertically (grid uses null or '#' or char)
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

// // After we build a solution grid (with chars and '#' blacks), collect all contiguous sequences (non-#) length >= 3 as slots
// function collectSlots(solutionGrid) {
//   const S = solutionGrid.length;
//   const across = [];
//   for (let r = 0; r < S; r++) {
//     let c = 0;
//     while (c < S) {
//       while (c < S && solutionGrid[r][c] === '#') c++;
//       const start = c;
//       let s = '';
//       while (c < S && solutionGrid[r][c] !== '#') {
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
//       while (r < S && solutionGrid[r][c] === '#') r++;
//       const start = r;
//       let s = '';
//       while (r < S && solutionGrid[r][c] !== '#') {
//         s += solutionGrid[r][c];
//         r++;
//       }
//       const len = r - start;
//       if (len >= 3) down.push({ c, r0: start, s, len });
//     }
//   }
//   return { across, down };
// }

// /* ----------------------------
//    Generator: tries until constraints satisfied
//    ---------------------------- */

// function generateCrosswordOnce() {
//   const S = SIZE;
//   // start empty grid (null)
//   const grid = Array.from({ length: S }, () => Array.from({ length: S }, () => null));
//   const placements = [];

//   // Attempt random placements up to a limit
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

//   // Fill remaining nulls with '#' (probabilistic, but ensure placements preserved)
//   for (let r = 0; r < S; r++) {
//     for (let c = 0; c < S; c++) {
//       if (grid[r][c] === null) {
//         grid[r][c] = Math.random() < 0.42 ? '#' : null; // some blanks left
//       }
//     }
//   }
//   // Ensure placed words stay intact
//   for (const p of placements) {
//     for (let i = 0; i < p.s.length; i++) {
//       if (p.horizontal) grid[p.r][p.c + i] = p.s[i];
//       else grid[p.r + i][p.c] = p.s[i];
//     }
//   }

//   // If some cells still null (not black and not letter) turn them into blanks (null) for puzzle
//   for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) {
//     if (grid[r][c] === null) grid[r][c] = null;
//   }

//   // Collect all across/down slots from this solution
//   const slots = collectSlots(grid);

//   // Validate that **every** slot is a valid equation in the solution (this is crucial)
//   for (const a of slots.across) {
//     const v = validateEquationString(a.s);
//     if (!v.ok) {
//       // invalid across; generation attempt failed
//       return null;
//     }
//   }
//   for (const d of slots.down) {
//     const v = validateEquationString(d.s);
//     if (!v.ok) {
//       return null;
//     }
//   }

//   // Determine prefilled characters: pick a subset of placed-chars
//   const placedChars = [];
//   for (let r = 0; r < S; r++) {
//     for (let c = 0; c < S; c++) {
//       if (grid[r][c] !== '#' && grid[r][c] !== null) placedChars.push({ r, c, v: grid[r][c] });
//     }
//   }
//   // Decide target prefilled count
//   const targetPrefilled = Math.max( Math.round(placedChars.length * MIN_PREFILLED_PERCENT), Math.min(6, Math.round(placedChars.length * MIN_PREFILLED_PERCENT)) );
//   const prefilled = [];
//   // Shuffle placedChars and take first targetPrefilled
//   for (let i = placedChars.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1)); const tmp = placedChars[i]; placedChars[i] = placedChars[j]; placedChars[j] = tmp;
//   }
//   for (let i = 0; i < Math.min(targetPrefilled, placedChars.length); i++) {
//     prefilled.push({ r: placedChars[i].r, c: placedChars[i].c, value: placedChars[i].v });
//   }

//   // Build puzzle grid for client: '#' for black, prefilled chars shown, others null
//   const puzzle = Array.from({ length: S }, () => Array.from({ length: S }, () => null));
//   const preSet = new Set(prefilled.map(p => `${p.r},${p.c}`));
//   for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) {
//     if (grid[r][c] === '#') puzzle[r][c] = '#';
//     else if (preSet.has(`${r},${c}`)) {
//       const p = prefilled.find(x => x.r === r && x.c === c);
//       puzzle[r][c] = p.value;
//     } else {
//       puzzle[r][c] = null;
//     }
//   }

//   return { puzzle, solution: grid, placements, prefilled, slots };
// }

// function generateCrossword() {
//   // Try several times to meet constraints (enough placements and prefilled fraction)
//   for (let t = 0; t < MAX_GENERATE_TRIES; t++) {
//     const res = generateCrosswordOnce();
//     if (!res) continue;

//     const placedCount = res.placements.length;
//     const S = SIZE;
//     // calculate placed-character count
//     let placedChars = 0;
//     let prefilledChars = res.prefilled.length;
//     for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) {
//       if (res.solution[r][c] !== '#' && res.solution[r][c] !== null) placedChars++;
//     }
//     const prefilledRatio = placedChars > 0 ? prefilledChars / placedChars : 0;

//     // some acceptance criteria:
//     // - placedCount must be >= TARGET_PLACEMENTS * 0.6 (tolerate some failure)
//     // - prefilledRatio >= MIN_PREFILLED_PERCENT * 0.6
//     // - collected slots non-zero
//     const slots = collectSlots(res.solution);
//     if (placedCount >= Math.max(4, Math.floor(TARGET_PLACEMENTS * 0.6)) && prefilledRatio >= MIN_PREFILLED_PERCENT * 0.6 && (slots.across.length + slots.down.length) > 0) {
//       // success — produce gameId + store meta
//       const gameId = typeof randomUUID === 'function' ? randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
//       const meta = {
//         size: SIZE,
//         solution: res.solution, // full char-level solution
//         puzzle: res.puzzle,
//         placements: res.placements,
//         prefilled: res.prefilled,
//         slots
//       };
//       games.set(gameId, meta);
//       return { gameId, size: SIZE, grid: res.puzzle, prefilled: res.prefilled, metaSummary: { placements: res.placements.length, slotsCount: slots.across.length + slots.down.length, prefilledCount: res.prefilled.length } };
//     }
//     // else continue trying
//   }
//   // if generation fails, as a last resort try returning something (rare)
//   const fallback = generateCrosswordOnce();
//   if (!fallback) throw new Error('Could not generate crossword');
//   const gameId = typeof randomUUID === 'function' ? randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
//   games.set(gameId, { size: SIZE, solution: fallback.solution, puzzle: fallback.puzzle, placements: fallback.placements, prefilled: fallback.prefilled, slots: fallback.slots });
//   return { gameId, size: SIZE, grid: fallback.puzzle, prefilled: fallback.prefilled, metaSummary: { placements: fallback.placements.length, slotsCount: fallback.slots.across.length + fallback.slots.down.length, prefilledCount: fallback.prefilled.length } };
// }

// /* ----------------------------
//    Routes
//    ---------------------------- */

// router.get('/generate-crossword', (req, res) => {
//   try {
//     const data = generateCrossword();
//     return res.json({ gameId: data.gameId, size: data.size, grid: data.grid, prefilled: data.prefilled, summary: data.metaSummary });
//   } catch (err) {
//     console.error('generate-crossword error', err);
//     return res.status(500).json({ error: 'Failed to generate crossword' });
//   }
// });

// // Validate: ensure user is playing the correct game and validate equations
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
//         // userGrid must contain '#' where solution has '#'
//         if (solChar === '#') {
//           if (u !== '#') return res.status(400).json({ valid:false, solved:false, message:`Grid mismatch at ${r},${c} — expected black` });
//         } else {
//           // allowed: digit, + - * / = or empty/space (incomplete)
//           if (u === null || u === undefined || u === '') continue;
//           if (!/^[0-9+\-*/=]$/.test(String(u))) return res.status(400).json({ valid:false, solved:false, message:`Invalid character at ${r},${c}: ${u}` });
//         }
//       }
//     }

//     // Collect slots using meta.solution as canonical layout (so we don't accidentally use stray blanks)
//     const slots = collectSlots(meta.solution);
//     const problems = [];

//     // Validate across slots: build strings from userGrid if all positions filled, else allow partial but report as problem
//     for (const a of slots.across) {
//       const { r, c0, len } = a;
//       let raw = '';
//       let incomplete = false;
//       for (let i = 0; i < len; i++) {
//         const ch = userGrid[r][c0 + i];
//         if (ch === null || ch === undefined || ch === '') { incomplete = true; raw += ' '; } else raw += String(ch);
//       }
//       const compact = raw.replace(/\s+/g, '');
//       // If incomplete treat as problem (not solved)
//       if (incomplete) {
//         problems.push({ dir:'across', r, c0, len, str: raw, reason: 'incomplete' });
//         continue;
//       }
//       const v = validateEquationString(compact);
//       if (!v.ok) problems.push({ dir:'across', r, c0, len, str: compact, reason: v.reason, leftVal: v.leftVal, rightVal: v.rightVal });
//     }

//     // Validate down slots
//     for (const d of slots.down) {
//       const { c, r0, len } = d;
//       let raw = '';
//       let incomplete = false;
//       for (let i = 0; i < len; i++) {
//         const ch = userGrid[r0 + i][c];
//         if (ch === null || ch === undefined || ch === '') { incomplete = true; raw += ' '; } else raw += String(ch);
//       }
//       const compact = raw.replace(/\s+/g, '');
//       if (incomplete) {
//         problems.push({ dir:'down', c, r0, len, str: raw, reason: 'incomplete' });
//         continue;
//       }
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




// api/game2.js
// Improved Math crossword generator + validator (guaranteed valid slots)

const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');

const SIZE = 7; // keep in sync with frontend
const OPS = ['+', '-', '*', '/'];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Tuned config
const TARGET_PLACEMENTS = SIZE >= 7 ? 16 : 10;
const MAX_PLACED_ATTEMPTS = TARGET_PLACEMENTS * 4;
const MIN_PREFILLED_PERCENT = SIZE >= 7 ? 0.30 : 0.20;
const MAX_GENERATE_TRIES = 18;

const games = new Map();

/* ---------------- Expression helpers ---------------- */

function evalExprLeftToRight(expr) {
  if (typeof expr !== 'string') return null;
  if (!/^[0-9+\-*/]+$/.test(expr)) return null;
  const nums = [];
  const ops = [];
  let cur = '';
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch >= '0' && ch <= '9') cur += ch;
    else {
      if (cur.length === 0) return null;
      nums.push(Number(cur));
      ops.push(ch);
      cur = '';
    }
  }
  if (cur.length === 0) return null;
  nums.push(Number(cur));
  if (nums.length !== ops.length + 1) return null;
  let acc = nums[0];
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    const nxt = nums[i + 1];
    if (op === '+') acc = acc + nxt;
    else if (op === '-') acc = acc - nxt;
    else if (op === '*') acc = acc * nxt;
    else if (op === '/') {
      if (nxt === 0) return null;
      acc = Math.trunc(acc / nxt);
    } else return null;
  }
  return acc;
}

function validateEquationString(s) {
  if (typeof s !== 'string') return { ok: false, reason: 'not_string' };
  if (s.indexOf('=') === -1) return { ok: false, reason: 'no_eq' };
  if ((s.match(/=/g) || []).length !== 1) return { ok: false, reason: 'multiple_eq' };
  const [left, right] = s.split('=');
  if (!left || !right) return { ok: false, reason: 'empty_side' };
  const lv = evalExprLeftToRight(left);
  const rv = evalExprLeftToRight(right);
  if (lv === null || rv === null) return { ok: false, reason: 'invalid_expr' };
  if (lv !== rv) return { ok: false, reason: 'mismatch', leftVal: lv, rightVal: rv };
  return { ok: true, leftVal: lv, rightVal: rv };
}

/* ---------------- Equation builder & placement ---------------- */

function makeEquation(maxLen) {
  for (let attempt = 0; attempt < 120; attempt++) {
    const terms = randInt(1, 3);
    const parts = [];
    for (let t = 0; t < terms; t++) {
      const digits = randInt(1, 2);
      let num = '';
      for (let d = 0; d < digits; d++) num += String(randInt(d === 0 ? 1 : 0, 9));
      parts.push(num);
      if (t < terms - 1) parts.push(pick(OPS));
    }
    const left = parts.join('');
    const val = evalExprLeftToRight(left);
    if (val === null) continue;
    const s = `${left}=${val}`;
    if (s.length <= maxLen && s.length >= 3) return s;
  }
  return null;
}

function tryPlaceString(grid, r, c, s, horizontal) {
  const S = grid.length;
  const len = s.length;
  if (horizontal) {
    if (c + len > S) return false;
    for (let i = 0; i < len; i++) {
      const ch = grid[r][c + i];
      if (ch === '#') return false;
      if (ch !== null && ch !== s[i]) return false;
    }
    for (let i = 0; i < len; i++) grid[r][c + i] = s[i];
    return true;
  } else {
    if (r + len > S) return false;
    for (let i = 0; i < len; i++) {
      const ch = grid[r + i][c];
      if (ch === '#') return false;
      if (ch !== null && ch !== s[i]) return false;
    }
    for (let i = 0; i < len; i++) grid[r + i][c] = s[i];
    return true;
  }
}

/* ---------------- collectSlots (defensive) ---------------- */

function collectSlots(solutionGrid) {
  const S = solutionGrid.length;
  const isBlock = (cell) => cell === '#' || cell === null || cell === undefined;
  const across = [];
  for (let r = 0; r < S; r++) {
    let c = 0;
    while (c < S) {
      while (c < S && isBlock(solutionGrid[r][c])) c++;
      const start = c;
      let s = '';
      while (c < S && !isBlock(solutionGrid[r][c])) {
        s += solutionGrid[r][c];
        c++;
      }
      const len = c - start;
      if (len >= 3) across.push({ r, c0: start, s, len });
    }
  }
  const down = [];
  for (let c = 0; c < S; c++) {
    let r = 0;
    while (r < S) {
      while (r < S && isBlock(solutionGrid[r][c])) r++;
      const start = r;
      let s = '';
      while (r < S && !isBlock(solutionGrid[r][c])) {
        s += solutionGrid[r][c];
        r++;
      }
      const len = r - start;
      if (len >= 3) down.push({ c, r0: start, s, len });
    }
  }
  return { across, down };
}

/* ---------------- generator (guarantees valid slots) ---------------- */

function generateCrosswordOnce() {
  const S = SIZE;
  const grid = Array.from({ length: S }, () => Array.from({ length: S }, () => null));
  const placements = [];

  let placed = 0;
  for (let attempt = 0; attempt < MAX_PLACED_ATTEMPTS && placed < TARGET_PLACEMENTS; attempt++) {
    const horizontal = Math.random() < 0.5;
    const eq = makeEquation(S);
    if (!eq) continue;
    const r = randInt(0, S - (horizontal ? 1 : eq.length));
    const c = randInt(0, S - (horizontal ? eq.length : 1));
    const ok = tryPlaceString(grid, r, c, eq, horizontal);
    if (ok) {
      placements.push({ r, c, s: eq, horizontal });
      placed++;
    }
  }

  // canonical solution: convert remaining null -> '#'
  const solution = Array.from({ length: S }, (_, r) =>
    Array.from({ length: S }, (_, c) => (grid[r][c] === null ? '#' : grid[r][c]))
  );

  // collect slots and validate every slot is a valid equation
  const slots = collectSlots(solution);
  for (const a of slots.across) {
    const v = validateEquationString(a.s);
    if (!v.ok) return null;
  }
  for (const d of slots.down) {
    const v = validateEquationString(d.s);
    if (!v.ok) return null;
  }

  // placedChars & choose prefilled
  const placedChars = [];
  for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) {
    if (solution[r][c] !== '#' && solution[r][c] !== null) placedChars.push({ r, c, v: solution[r][c] });
  }
  const targetPrefilled = Math.max(Math.round(placedChars.length * MIN_PREFILLED_PERCENT), Math.min(6, Math.round(placedChars.length * MIN_PREFILLED_PERCENT)));
  for (let i = placedChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = placedChars[i]; placedChars[i] = placedChars[j]; placedChars[j] = tmp;
  }
  const prefilled = [];
  for (let i = 0; i < Math.min(targetPrefilled, placedChars.length); i++) prefilled.push({ r: placedChars[i].r, c: placedChars[i].c, value: placedChars[i].v });

  // build puzzle to show player: '#' for black, prefilled chars shown, others null
  const puzzle = Array.from({ length: S }, () => Array.from({ length: S }, () => null));
  const preSet = new Set(prefilled.map(p => `${p.r},${p.c}`));
  for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) {
    if (solution[r][c] === '#') puzzle[r][c] = '#';
    else if (preSet.has(`${r},${c}`)) puzzle[r][c] = prefilled.find(x => x.r === r && x.c === c).value;
    else puzzle[r][c] = null;
  }

  return { puzzle, solution, placements, prefilled, slots };
}

function generateCrossword() {
  for (let t = 0; t < MAX_GENERATE_TRIES; t++) {
    const res = generateCrosswordOnce();
    if (!res) continue;
    const placedCount = res.placements.length;
    const S = SIZE;
    let placedChars = 0;
    let prefilledChars = res.prefilled.length;
    for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) {
      if (res.solution[r][c] !== '#' && res.solution[r][c] !== null) placedChars++;
    }
    const prefilledRatio = placedChars > 0 ? prefilledChars / placedChars : 0;
    const slots = collectSlots(res.solution);
    if (placedCount >= Math.max(4, Math.floor(TARGET_PLACEMENTS * 0.6)) && prefilledRatio >= MIN_PREFILLED_PERCENT * 0.6 && (slots.across.length + slots.down.length) > 0) {
      const gameId = typeof randomUUID === 'function' ? randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
      const meta = { size: SIZE, solution: res.solution, puzzle: res.puzzle, placements: res.placements, prefilled: res.prefilled, slots };
      games.set(gameId, meta);
      return { gameId, size: SIZE, grid: res.puzzle, prefilled: res.prefilled, solution: res.solution, metaSummary: { placements: res.placements.length, slotsCount: slots.across.length + slots.down.length, prefilledCount: res.prefilled.length } };
    }
  }

  const fallback = generateCrosswordOnce();
  if (!fallback) throw new Error('Could not generate crossword');
  const gameId = typeof randomUUID === 'function' ? randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
  games.set(gameId, { size: SIZE, solution: fallback.solution, puzzle: fallback.puzzle, placements: fallback.placements, prefilled: fallback.prefilled, slots: fallback.slots });
  return { gameId, size: SIZE, grid: fallback.puzzle, prefilled: fallback.prefilled, solution: fallback.solution, metaSummary: { placements: fallback.placements.length, slotsCount: fallback.slots.across.length + fallback.slots.down.length, prefilledCount: fallback.prefilled.length } };
}

/* ---------------- Routes ---------------- */

router.get('/generate-crossword', (req, res) => {
  try {
    const data = generateCrossword();
    return res.json({ gameId: data.gameId, size: data.size, grid: data.grid, prefilled: data.prefilled, solution: data.solution, summary: data.metaSummary });
  } catch (err) {
    console.error('generate-crossword error', err);
    return res.status(500).json({ error: 'Failed to generate crossword' });
  }
});

router.post('/validate-crossword', (req, res) => {
  try {
    const { gameId, userGrid } = req.body;
    if (!gameId || !games.has(gameId)) return res.status(400).json({ valid: false, solved: false, message: 'Unknown or expired gameId' });
    const meta = games.get(gameId);
    const S = meta.size;
    if (!Array.isArray(userGrid) || userGrid.length !== S) return res.status(400).json({ valid: false, solved: false, message: 'Invalid userGrid' });

    // Validate allowed characters & black cells
    for (let r = 0; r < S; r++) {
      if (!Array.isArray(userGrid[r]) || userGrid[r].length !== S) return res.status(400).json({ valid:false, solved:false, message:'Invalid grid row' });
      for (let c = 0; c < S; c++) {
        const solChar = meta.solution[r][c];
        const u = userGrid[r][c];
        if (solChar === '#') {
          if (u !== '#') return res.status(400).json({ valid:false, solved:false, message:`Grid mismatch at ${r},${c} — expected black` });
        } else {
          if (u === null || u === undefined || u === '') continue;
          if (!/^[0-9+\-*/=]$/.test(String(u))) return res.status(400).json({ valid:false, solved:false, message:`Invalid character at ${r},${c}: ${u}` });
        }
      }
    }

    // Collect slots
    const slots = collectSlots(meta.solution);
    const problems = [];

    for (const a of slots.across) {
      const { r, c0, len } = a;
      let raw = '';
      let incomplete = false;
      for (let i = 0; i < len; i++) {
        const ch = userGrid[r][c0 + i];
        if (ch === null || ch === undefined || ch === '') { incomplete = true; raw += ' '; } else raw += String(ch);
      }
      const compact = raw.replace(/\s+/g, '');
      if (incomplete) { problems.push({ dir:'across', r, c0, len, str: raw, reason: 'incomplete' }); continue; }
      const v = validateEquationString(compact);
      if (!v.ok) problems.push({ dir:'across', r, c0, len, str: compact, reason: v.reason, leftVal: v.leftVal, rightVal: v.rightVal });
    }

    for (const d of slots.down) {
      const { c, r0, len } = d;
      let raw = '';
      let incomplete = false;
      for (let i = 0; i < len; i++) {
        const ch = userGrid[r0 + i][c];
        if (ch === null || ch === undefined || ch === '') { incomplete = true; raw += ' '; } else raw += String(ch);
      }
      const compact = raw.replace(/\s+/g, '');
      if (incomplete) { problems.push({ dir:'down', c, r0, len, str: raw, reason: 'incomplete' }); continue; }
      const v = validateEquationString(compact);
      if (!v.ok) problems.push({ dir:'down', c, r0, len, str: compact, reason: v.reason, leftVal: v.leftVal, rightVal: v.rightVal });
    }

    const solved = problems.length === 0;
    return res.json({ valid: true, solved, problems, slotsCount: slots.across.length + slots.down.length });
  } catch (err) {
    console.error('validate-crossword error', err);
    return res.status(500).json({ valid:false, solved:false, message:'Server error' });
  }
});

module.exports = router;
