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
    const { gameId, userGrid, email } = req.body;

    // Basic validation
    if (!Array.isArray(userGrid) || userGrid.length === 0) {
      return res.json({ valid: false, message: 'No grid provided for validation.' });
    }

    // --- Try fetching the game from DB ---
    const game = gameId ? await MathCrosswordGame.findOne({ gameId }).lean() : null;

    // If game found, validate with stored solution
    if (game) {
      const solution = game.solution || game.puzzle;

      if (!Array.isArray(solution) || solution.length !== userGrid.length) {
        return res.json({ valid: false, message: 'Submitted grid shape does not match stored game.' });
      }

      // Validate cell-by-cell
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

      // ✅ User solved correctly — award points
      const awardedPoints = 10;

      if (email) {
        const User = require('../models/User');
        const userDoc = await User.findOne({ email });
        if (userDoc) {
          userDoc.points = (userDoc.points || 0) + awardedPoints;
          await userDoc.save();
        }
      }

      // --- Prepare a new game for next round ---
      const { grid: newGrid, placed } = buildPuzzle(game.size || 12, 6);
      const pfCells = selectPrefills(placed, 50); // default 50% prefill
      const prefilled = pfCells.map(p => ({ r: p.r, c: p.c, value: newGrid[p.r][p.c] }));

      const newGameId = uuidv4();
      const newDoc = new MathCrosswordGame({
        gameId: newGameId,
        size: newGrid.length,
        puzzle: newGrid,
        solution: newGrid,
        prefilled,
        createdAt: new Date()
      });
      await newDoc.save();

      return res.json({
        valid: true,
        message: 'Correct! Well done.',
        awardedPoints,
        newGame: { gameId: newGameId, grid: newGrid, prefilled }
      });
    }

    // --- If no stored game found, validate by parsing the equations ---
    const grid = userGrid.map(row =>
      row.map(cell => (cell === null || typeof cell === 'undefined' ? ' ' : String(cell)))
    );

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
        return res.json({ valid: false, message: `Invalid expression in ${text}: ${err.message}` });
      }
    }

    // ✅ If reached here — all parsed equations correct
    const awardedPoints = 10;

    if (email) {
      const User = require('../models/User');
      const userDoc = await User.findOne({ email });
      if (userDoc) {
        userDoc.points = (userDoc.points || 0) + awardedPoints;
        await userDoc.save();
      }
    }

    return res.json({ valid: true, message: 'Correct (validated by parsing equations).', awardedPoints });
  } catch (err) {
    console.error('validate-crossword error:', err);
    res.status(500).json({ valid: false, message: 'Server error during validation.' });
  }
});

module.exports = router;
