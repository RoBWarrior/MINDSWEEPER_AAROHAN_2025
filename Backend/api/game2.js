// api/game2.js
// Arithmetic crossword: SxS numbers grid, horizontal & vertical operators.
// GET  /api/generate-game?size=3
// POST /api/validate-game   { gameId, numbersGrid, hOperators, vOperators, email? }

const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');

let Game = null;
let User = null;
try { Game = require('../models/Game'); } catch (e) {}
try { User = require('../models/User'); } catch (e) {}

const POINTS_BY_SIZE = { 3: 3, 4: 5, 5: 8, 6: 12 };
const OPS = ['+', '-', '*', '/']; // generator will prefer + - * but validator accepts /

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function evalLeftToRight(numbers, ops) {
  if (!Array.isArray(numbers) || numbers.length === 0) return null;
  let cur = Number(numbers[0]);
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    const next = Number(numbers[i + 1]);
    if (op === '+') cur = cur + next;
    else if (op === '-') cur = cur - next;
    else if (op === '*') cur = cur * next;
    else if (op === '/') {
      if (next === 0) return null;
      // integer division to match frontend behavior
      cur = Math.trunc(cur / next);
    } else return null;
  }
  return cur;
}

function generateGrid(size = 3) {
  const S = Math.max(2, Math.min(7, Number(size) || 3)); // limit to 2..7
  // create numbers grid SxS (values 1..9)
  const numbersGrid = Array.from({ length: S }, () => Array.from({ length: S }, () => randInt(1, 9)));

  // horizontal operators: S rows x (S-1) columns
  const hOperators = Array.from({ length: S }, () => Array.from({ length: Math.max(0, S - 1) }, () => {
    // prefer + - * for generator stability
    return ['+', '-', '*'][Math.floor(Math.random() * 3)];
  }));

  // vertical operators: (S-1) rows x S columns
  const vOperators = Array.from({ length: Math.max(0, S - 1) }, () => Array.from({ length: S }, () => {
    return ['+', '-', '*'][Math.floor(Math.random() * 3)];
  }));

  // compute across (rows) targets
  const across = [];
  for (let r = 0; r < S; r++) {
    const rowNums = numbersGrid[r].slice();
    const rowOps = hOperators[r].slice();
    const target = evalLeftToRight(rowNums, rowOps);
    across.push({ r, target });
  }

  // compute down (columns) targets
  const down = [];
  for (let c = 0; c < S; c++) {
    const colNums = [];
    for (let r = 0; r < S; r++) colNums.push(numbersGrid[r][c]);
    const colOps = [];
    for (let r = 0; r < S - 1; r++) colOps.push(vOperators[r][c]);
    const target = evalLeftToRight(colNums, colOps);
    down.push({ c, target });
  }

  // Build pools: flatten numbers and ops, then shuffle (client will remove preplaced ones)
  const poolNumbers = numbersGrid.flat();
  const poolHOps = hOperators.flat();
  const poolVOps = vOperators.flat();
  const poolOperators = [...poolHOps, ...poolVOps];

  // Preplace some cells: pick deterministic safe indices similar to previous behavior
  const preplaced = { numbers: [], hOps: [], vOps: [] };
  if (S > 1) preplaced.numbers.push({ r: 0, c: 0, value: numbersGrid[0][0] });
  if (S > 2) preplaced.numbers.push({ r: 1, c: 1, value: numbersGrid[1][1] });
  if (S > 3) preplaced.hOps.push({ r: 0, c: 0, value: hOperators[0][0] });
  if (S > 4) preplaced.vOps.push({ r: 0, c: 1, value: vOperators[0][1] });

  const gameId = typeof randomUUID === 'function' ? randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;

  return {
    gameId,
    size: S,
    numbersGrid,
    hOperators,
    vOperators,
    across,
    down,
    poolNumbers,
    poolOperators,
    preplaced,
    createdAt: Date.now()
  };
}

// GET /api/generate-game?size=3
router.get('/generate-game', async (req, res) => {
  try {
    const size = req.query.size ? Number(req.query.size) : 3;
    const game = generateGrid(size);

    // persist if Game model exists (optional)
    if (Game) {
      try {
        await Game.create({
          gameId: game.gameId,
          meta: 'arith-crossword-grid',
          size: game.size,
          numbersGrid: game.numbersGrid,
          hOperators: game.hOperators,
          vOperators: game.vOperators,
          across: game.across,
          down: game.down,
          preplaced: game.preplaced,
          createdAt: Date.now()
        });
      } catch (e) {
        console.warn('Could not persist game:', e.message || e);
      }
    }

    // send fields front-end expects
    return res.json({
      gameId: game.gameId,
      size: game.size,
      numbersGrid: game.numbersGrid,
      hOperators: game.hOperators,
      vOperators: game.vOperators,
      across: game.across,
      down: game.down,
      poolNumbers: game.poolNumbers,
      poolOperators: game.poolOperators,
      preplaced: game.preplaced
    });
  } catch (err) {
    console.error('generate-game err', err);
    return res.status(500).json({ error: 'Failed to generate game' });
  }
});

// POST /api/validate-game
// Body: { gameId, numbersGrid, hOperators, vOperators, email? }
router.post('/validate-game', async (req, res) => {
  try {
    const { gameId, numbersGrid, hOperators, vOperators, email } = req.body;
    if (!gameId) return res.status(400).json({ validGame:false, solved:false, message:'Missing gameId' });
    if (!Array.isArray(numbersGrid) || numbersGrid.length < 1) return res.status(400).json({ validGame:false, solved:false, message:'Missing numbersGrid' });

    const S = numbersGrid.length;

    // basic normalization and validation
    if (!Array.isArray(hOperators) || hOperators.length !== S) return res.status(400).json({ validGame:false, solved:false, message:'Invalid hOperators' });
    if (!Array.isArray(vOperators) || vOperators.length !== Math.max(0, S - 1)) return res.status(400).json({ validGame:false, solved:false, message:'Invalid vOperators' });

    // compute across and down results
    const acrossResults = [];
    for (let r = 0; r < S; r++) {
      const rowNums = numbersGrid[r].map(x => Number(x));
      const rowOps = hOperators[r].map(x => String(x));
      const val = evalLeftToRight(rowNums, rowOps);
      acrossResults.push({ r, val });
    }

    const downResults = [];
    for (let c = 0; c < S; c++) {
      const colNums = [];
      for (let r = 0; r < S; r++) colNums.push(Number(numbersGrid[r][c]));
      const colOps = [];
      for (let r = 0; r < S - 1; r++) colOps.push(String(vOperators[r][c]));
      const val = evalLeftToRight(colNums, colOps);
      downResults.push({ c, val });
    }

    // If game persisted, fetch expected targets for strict validation
    let stored = null;
    if (Game) {
      try { stored = await Game.findOne({ gameId }); } catch (e) { stored = null; }
    }

    let solved = true;
    let problems = [];
    if (stored && stored.across && stored.down) {
      // compare to stored targets
      for (let r = 0; r < stored.across.length; r++) {
        const expected = Number(stored.across[r].target);
        const got = acrossResults[r].val;
        if (expected !== got) { solved = false; problems.push({ type:'across', r, expected, got }); }
      }
      for (let c = 0; c < stored.down.length; c++) {
        const expected = Number(stored.down[c].target);
        const got = downResults[c].val;
        if (expected !== got) { solved = false; problems.push({ type:'down', c, expected, got }); }
      }
    } else {
      // stored not available -> assume solved if no nulls and across/down results are consistent (not null)
      for (let r = 0; r < acrossResults.length; r++) {
        if (acrossResults[r].val === null) { solved = false; problems.push({ type:'across', r, got: null }); }
      }
      for (let c = 0; c < downResults.length; c++) {
        if (downResults[c].val === null) { solved = false; problems.push({ type:'down', c, got: null }); }
      }
    }

    if (!solved) {
      return res.json({ validGame:true, solved:false, message:'Not solved', problems, acrossResults, downResults });
    }

    // solved -> award points if User exists
    let awardedPoints = 0, newTotal = null;
    const pts = POINTS_BY_SIZE[S] ?? 0;
    if (email && User) {
      try {
        const updated = await User.findOneAndUpdate({ email }, { $inc: { points: pts } }, { new: true });
        if (updated) { awardedPoints = pts; newTotal = updated.points; }
      } catch (e) { console.warn('points update failed', e.message||e); }
    }

    // create new puzzle to return
    const newGame = generateGrid(S);
    if (Game) {
      try {
        await Game.create({
          gameId: newGame.gameId,
          meta: 'arith-crossword-grid',
          size: newGame.size,
          numbersGrid: newGame.numbersGrid,
          hOperators: newGame.hOperators,
          vOperators: newGame.vOperators,
          across: newGame.across,
          down: newGame.down,
          preplaced: newGame.preplaced,
          createdAt: Date.now()
        });
      } catch (e) { console.warn('persist newGame failed', e.message||e); }
    }

    return res.json({
      validGame:true, solved:true,
      message: awardedPoints>0 ? `Solved! ${awardedPoints} points awarded.` : 'Solved!',
      awardedPoints, newTotalPoints: newTotal,
      newGame: {
        gameId: newGame.gameId,
        size: newGame.size,
        numbersGrid: newGame.numbersGrid,
        hOperators: newGame.hOperators,
        vOperators: newGame.vOperators,
        across: newGame.across,
        down: newGame.down,
        poolNumbers: newGame.poolNumbers,
        poolOperators: newGame.poolOperators,
        preplaced: newGame.preplaced
      }
    });

  } catch (err) {
    console.error('validate-game error', err);
    return res.status(500).json({ validGame:false, solved:false, message:'Server error' });
  }
});

module.exports = router;
