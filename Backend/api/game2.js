// const express = require('express');
// const router = express.Router();
// const { v4: uuidv4 } = require('uuid');

// const MathCrosswordGame = require('../models/MathCrosswordGame');

// // Utility helpers
// function createEmptyGrid(size) {
//   return Array.from({ length: size }, () => Array.from({ length: size }, () => ' '));
// }
// function randInt(min, max) {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }
// function shuffleArray(a) {
//   for (let i = a.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [a[i], a[j]] = [a[j], a[i]];
//   }
//   return a;
// }

// // Create a simple arithmetic equation string (digits and +-*)
// function makeEquation(maxNumber = 99) {
//   const ops = ['+', '-', '*'];
//   const op = ops[Math.floor(Math.random() * ops.length)];
//   const a = randInt(1, maxNumber);
//   const b = randInt(1, Math.max(1, Math.min(maxNumber, Math.floor(maxNumber/2))));
//   let lhs, rhs;
//   if (op === '+') {
//     lhs = `${a}+${b}`;
//     rhs = String(a + b);
//   } else if (op === '-') {
//     lhs = `${a}-${b}`;
//     rhs = String(a - b);
//   } else {
//     lhs = `${a}*${b}`;
//     rhs = String(a * b);
//   }
//   return `${lhs}=${rhs}`;
// }

// // Try to place a sequence (string) into the grid, horizontal or vertical
// function tryPlace(grid, seq) {
//   const N = grid.length;
//   const len = seq.length;
//   const tries = 300;
//   for (let t = 0; t < tries; t++) {
//     const vertical = Math.random() < 0.5;
//     const maxR = vertical ? N - len : N - 1;
//     const maxC = vertical ? N - 1 : N - len;
//     const r0 = randInt(0, Math.max(0, maxR));
//     const c0 = randInt(0, Math.max(0, maxC));

//     let fits = true;
//     for (let k = 0; k < len; k++) {
//       const r = vertical ? r0 + k : r0;
//       const c = vertical ? c0 : c0 + k;
//       const cell = grid[r][c];
//       if (cell === ' ') continue;
//       if (cell !== seq[k]) {
//         fits = false;
//         break;
//       }
//     }
//     if (!fits) continue;

//     for (let k = 0; k < len; k++) {
//       const r = vertical ? r0 + k : r0;
//       const c = vertical ? c0 : c0 + k;
//       grid[r][c] = seq[k];
//     }
//     return { r: r0, c: c0, vertical, len };
//   }
//   return null;
// }

// // Build puzzle: place several equations into grid
// function buildPuzzle(size = 12, count = 6) {
//   const grid = createEmptyGrid(size).map(row => row.map(_ => ' '));
//   const placed = [];
//   let attempts = 0;
//   while (placed.length < count && attempts < count * 50) {
//     attempts++;
//     const eq = makeEquation(20);
//     const seq = eq.split('');
//     const meta = tryPlace(grid, seq);
//     if (meta) {
//       placed.push({ eq, ...meta });
//     }
//   }

//   if (placed.length === 0) {
//     const eq = makeEquation(10);
//     const seq = eq.split('');
//     const mid = Math.floor((size - seq.length) / 2);
//     for (let k = 0; k < seq.length; k++) {
//       grid[Math.floor(size / 2)][mid + k] = seq[k];
//     }
//     placed.push({ eq, r: Math.floor(size / 2), c: mid, vertical: false, len: seq.length });
//   }

//   const solution = grid.map(row => row.map(ch => (typeof ch === 'string' ? ch : ' ')));
//   return { grid: solution, placed };
// }

// // Extract prefilled positions: either percent or count
// function selectPrefills(placed, percentOrCount) {
//   const cells = [];
//   for (const place of placed) {
//     const { r, c, vertical, len } = place;
//     for (let k = 0; k < len; k++) {
//       const rr = vertical ? r + k : r;
//       const cc = vertical ? c : c + k;
//       cells.push({ r: rr, c: cc });
//     }
//   }
//   const map = new Map();
//   for (const x of cells) map.set(`${x.r},${x.c}`, x);
//   const unique = Array.from(map.values());
//   shuffleArray(unique);

//   // Default: 50% of available cells (and at least 2 if possible)
//   if (typeof percentOrCount === 'number') {
//     if (percentOrCount > 0 && percentOrCount <= 100) {
//       const keep = Math.max(2, Math.floor((percentOrCount / 100) * unique.length));
//       return unique.slice(0, Math.min(unique.length, keep));
//     }
//     if (percentOrCount >= 1 && percentOrCount < 1000) {
//       const keep = Math.min(unique.length, Math.max(0, Math.floor(percentOrCount)));
//       return unique.slice(0, keep);
//     }
//   }
//   const fallbackKeep = Math.max(2, Math.floor(0.5 * unique.length)); // 50% fallback
//   return unique.slice(0, fallbackKeep);
// }

// // ================== ROUTES ==================

// // GET /api/generate-crossword?size=12&count=6&prefill=50
// router.get('/generate-crossword', async (req, res) => {
//   try {
//     const size = Math.max(7, Math.min(20, parseInt(req.query.size || '12', 10)));
//     const count = Math.max(1, Math.min(20, parseInt(req.query.count || '6', 10)));
//     const prefillParam = req.query.prefill; // percent 0..100 or count

//     const { grid, placed } = buildPuzzle(size, count);

//     const pfCells = selectPrefills(placed, prefillParam ? Number(prefillParam) : undefined);
//     const prefilled = pfCells.map(p => ({ r: p.r, c: p.c, value: grid[p.r][p.c] }));

//     const gameId = uuidv4();
//     const doc = new MathCrosswordGame({
//       gameId,
//       size,
//       puzzle: grid,
//       solution: grid,
//       prefilled,
//       createdAt: new Date()
//     });
//     await doc.save();

//     res.json({
//       success: true,
//       gameId,
//       _id: doc._id,
//       grid,
//       prefilled
//     });
//   } catch (err) {
//     console.error('generate-crossword error:', err);
//     res.status(500).json({ success: false, message: 'Failed to generate crossword.' });
//   }
// });

// // Safe evaluator and helpers (same as before)
// const allowedExprChars = /^[0-9+\-*/().\s]+$/;
// function safeEvalNumber(expr) {
//   const cleaned = String(expr).replace(/\s+/g, '');
//   if (!allowedExprChars.test(cleaned)) {
//     throw new Error('Expression contains invalid characters');
//   }
//   // eslint-disable-next-line no-new-func
//   const val = Function(`"use strict"; return (${cleaned});`)();
//   if (typeof val !== 'number' || !isFinite(val)) throw new Error('Invalid numeric result');
//   return val;
// }
// function gatherLineTokens(grid, r, c, dr, dc) {
//   let i = r, j = c;
//   while (
//     i - dr >= 0 && j - dc >= 0 &&
//     i - dr < grid.length && j - dc < grid[0].length &&
//     grid[i - dr][j - dc] !== ' '
//   ) {
//     i -= dr; j -= dc;
//   }
//   const tokens = [];
//   while (i >= 0 && j >= 0 && i < grid.length && j < grid[0].length && grid[i][j] !== ' ') {
//     tokens.push({ r: i, c: j, ch: grid[i][j] });
//     i += dr; j += dc;
//   }
//   return tokens;
// }
// function findEquations(grid) {
//   const eqs = [];
//   const R = grid.length, C = grid[0].length;
//   for (let r = 0; r < R; r++) {
//     let c = 0;
//     while (c < C) {
//       if (grid[r][c] === ' ') { c++; continue; }
//       const seq = gatherLineTokens(grid, r, c, 0, 1);
//       c += seq.length;
//       const str = seq.map(t => String(t.ch)).join('');
//       if (str.includes('=')) eqs.push({ dir: 'row', r, cStart: seq[0].c, text: str });
//     }
//   }
//   for (let c = 0; c < C; c++) {
//     let r = 0;
//     while (r < R) {
//       if (grid[r][c] === ' ') { r++; continue; }
//       const seq = gatherLineTokens(grid, r, c, 1, 0);
//       r += seq.length;
//       const str = seq.map(t => String(t.ch)).join('');
//       if (str.includes('=')) eqs.push({ dir: 'col', c, rStart: seq[0].r, text: str });
//     }
//   }
//   return eqs;
// }

// // POST /api/validate-crossword
// router.post('/validate-crossword', async (req, res) => {
//   try {
//     const { gameId, userGrid, email } = req.body;

//     // Basic validation
//     if (!Array.isArray(userGrid) || userGrid.length === 0) {
//       return res.json({ valid: false, message: 'No grid provided for validation.' });
//     }

//     // --- Try fetching the game from DB ---
//     const game = gameId ? await MathCrosswordGame.findOne({ gameId }).lean() : null;

//     // If game found, validate with stored solution
//     if (game) {
//       const solution = game.solution || game.puzzle;

//       if (!Array.isArray(solution) || solution.length !== userGrid.length) {
//         return res.json({ valid: false, message: 'Submitted grid shape does not match stored game.' });
//       }

//       // Validate cell-by-cell
//       for (let r = 0; r < solution.length; r++) {
//         for (let c = 0; c < solution[r].length; c++) {
//           if (solution[r][c] === ' ') continue;
//           const sol = String(solution[r][c]);
//           const user = userGrid?.[r]?.[c];
//           if (user === null || typeof user === 'undefined') {
//             return res.json({ valid: false, message: 'Some cells are empty.' });
//           }
//           if (String(user) !== sol) {
//             return res.json({ valid: false, message: 'Incorrect — some cells are wrong.' });
//           }
//         }
//       }

//       // ✅ User solved correctly — award points
//       const awardedPoints = 10;

//       if (email) {
//         const User = require('../models/User');
//         const userDoc = await User.findOne({ email });
//         if (userDoc) {
//           userDoc.points = (userDoc.points || 0) + awardedPoints;
//           await userDoc.save();
//         }
//       }

//       // --- Prepare a new game for next round ---
//       const { grid: newGrid, placed } = buildPuzzle(game.size || 12, 6);
//       const pfCells = selectPrefills(placed, 50); // default 50% prefill
//       const prefilled = pfCells.map(p => ({ r: p.r, c: p.c, value: newGrid[p.r][p.c] }));

//       const newGameId = uuidv4();
//       const newDoc = new MathCrosswordGame({
//         gameId: newGameId,
//         size: newGrid.length,
//         puzzle: newGrid,
//         solution: newGrid,
//         prefilled,
//         createdAt: new Date()
//       });
//       await newDoc.save();

//       return res.json({
//         valid: true,
//         message: 'Correct! Well done.',
//         awardedPoints,
//         newGame: { gameId: newGameId, grid: newGrid, prefilled }
//       });
//     }

//     // --- If no stored game found, validate by parsing the equations ---
//     const grid = userGrid.map(row =>
//       row.map(cell => (cell === null || typeof cell === 'undefined' ? ' ' : String(cell)))
//     );

//     const equations = findEquations(grid);
//     if (equations.length === 0) {
//       return res.json({ valid: false, message: 'No equations found in provided grid.' });
//     }

//     for (const e of equations) {
//       const text = e.text;
//       const idx = text.indexOf('=');
//       if (idx === -1) continue;
//       const lhs = text.slice(0, idx);
//       const rhs = text.slice(idx + 1);
//       try {
//         const lval = safeEvalNumber(lhs);
//         const rval = safeEvalNumber(rhs);
//         if (Math.abs(lval - rval) > 1e-9) {
//           return res.json({ valid: false, message: `Equation ${text} is incorrect.` });
//         }
//       } catch (err) {
//         return res.json({ valid: false, message: `Invalid expression in ${text}: ${err.message}` });
//       }
//     }

//     // ✅ If reached here — all parsed equations correct
//     const awardedPoints = 10;

//     if (email) {
//       const User = require('../models/User');
//       const userDoc = await User.findOne({ email });
//       if (userDoc) {
//         userDoc.points = (userDoc.points || 0) + awardedPoints;
//         await userDoc.save();
//       }
//     }

//     return res.json({ valid: true, message: 'Correct (validated by parsing equations).', awardedPoints });
//   } catch (err) {
//     console.error('validate-crossword error:', err);
//     res.status(500).json({ valid: false, message: 'Server error during validation.' });
//   }
// });

// module.exports = router;





// routes/graphTree.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const MathGraphGame = require('../models/MathGraphGame');
const User = require('../models/User');

// Helper: shuffle array in place
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build radial coordinates from a parent array (levels)
function layoutRadialFromParent(parent, cx = 300, cy = 300, radiusStep = 80) {
  // Build adjacency
  const n = parent.length;
  const adj = Array.from({ length: n }, () => []);
  let root = 0;
  for (let i = 0; i < n; i++) {
    if (typeof parent[i] === 'number' && parent[i] !== -1) {
      adj[i].push(parent[i]);
      adj[parent[i]].push(i);
    } else {
      root = i;
    }
  }

  // BFS to compute depth/level and group nodes by depth
  const depth = Array(n).fill(-1);
  const q = [root];
  depth[root] = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const u = q[qi];
    for (const v of adj[u]) {
      if (depth[v] === -1) {
        depth[v] = depth[u] + 1;
        q.push(v);
      }
    }
  }

  const levels = {};
  for (let i = 0; i < n; i++) {
    if (depth[i] === -1) depth[i] = 0;
    if (!levels[depth[i]]) levels[depth[i]] = [];
    levels[depth[i]].push(i);
  }

  // place nodes per level, spread horizontally
  const nodes = [];
  const maxLevel = Math.max(...Object.keys(levels).map(k => Number(k)));
  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    const group = levels[lvl] || [];
    const count = group.length;
    // angular slice or horizontal spread - we use horizontal spread per level
    const width = Math.max(220, count * 80);
    const startX = cx - width / 2;
    for (let i = 0; i < group.length; i++) {
      const id = group[i];
      const x = Math.round(startX + (i + 0.5) * (width / count));
      const y = Math.round(cy - maxLevel * radiusStep / 2 + lvl * radiusStep);
      nodes[id] = { id, x, y };
    }
  }
  return nodes;
}

// Attempt to build a tree and a valid secret assignment (1..13) such that
// no edge connects numbers that differ by 1. Retry a few times.
function buildTreeWithSolution(n = 13, maxAttempts = 200) {
  const values = Array.from({ length: n }, (_, i) => i + 1); // 1..13
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // shuffle node ids; we'll create a random tree topology (random parent list)
    const nodeOrder = Array.from({ length: n }, (_, i) => i);
    shuffle(nodeOrder);

    // Build random parent array to produce a tree:
    // parent[root] = -1, others parent chosen among earlier nodes to ensure connectedness
    const parent = Array(n).fill(-1);
    for (let i = 1; i < n; i++) {
      const node = nodeOrder[i];
      const connectTo = nodeOrder[Math.floor(Math.random() * i)]; // connect to any earlier node
      parent[node] = connectTo;
    }

    // Now try to assign values so that for every edge (u,parent[u]) |val[u]-val[parent]| !== 1.
    // We'll randomly permute values and check; if a conflict arises we retry permutations.
    const trialsForAssignment = 400;
    for (let t = 0; t < trialsForAssignment; t++) {
      shuffle(values);
      const solution = {};
      for (let i = 0; i < n; i++) solution[i] = values[i];
      // validate all edges
      let ok = true;
      for (let i = 0; i < n; i++) {
        const p = parent[i];
        if (p === -1) continue;
        if (Math.abs(solution[i] - solution[p]) === 1) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;

      // success: build edges list and layout
      const edges = [];
      for (let i = 0; i < n; i++) {
        const p = parent[i];
        if (p !== -1) {
          const a = Math.min(i, p), b = Math.max(i, p);
          edges.push({ u: a, v: b });
        }
      }

      const nodes = layoutRadialFromParent(parent, 300, 300, 80);
      return { nodes, edges, solution };
    }
    // otherwise retry building a different tree topology
  }

  // If all attempts fail (extremely unlikely), fallback to partition-based safe tree:
  // create two groups (odd/even) and build a chain spanning tree within group then connect them by a safe connector
  // (This fallback ensures a valid solution exists)
  const fallbackParent = Array(n).fill(-1);
  // split 7 odd, 6 even by index (not ideal random but safe)
  const indices = Array.from({ length: n }, (_, i) => i);
  shuffle(indices);
  const groupOdd = indices.slice(0, 7);
  const groupEven = indices.slice(7);
  // connect each group as chain
  for (let i = 1; i < groupOdd.length; i++) fallbackParent[groupOdd[i]] = groupOdd[i - 1];
  for (let i = 1; i < groupEven.length; i++) fallbackParent[groupEven[i]] = groupEven[i - 1];
  // connect the two groups via first element
  fallbackParent[groupEven[0]] = groupOdd[0];

  const oddNumbers = [1,3,5,7,9,11,13];
  const evenNumbers = [2,4,6,8,10,12];
  shuffle(oddNumbers); shuffle(evenNumbers);
  const sol = {};
  groupOdd.forEach((nodeIdx, i) => sol[nodeIdx] = oddNumbers[i]);
  groupEven.forEach((nodeIdx, i) => sol[nodeIdx] = evenNumbers[i]);

  const edges = [];
  for (let i = 0; i < n; i++) {
    const p = fallbackParent[i];
    if (p !== -1) edges.push({ u: Math.min(i, p), v: Math.max(i, p) });
  }
  const nodes = layoutRadialFromParent(fallbackParent, 300, 300, 80);
  return { nodes, edges, solution: sol };
}

// GET /api/generate-graph  (keeps same path so frontend unchanged)
router.get('/generate-graph', async (req, res) => {
  try {
    const { nodes, edges, solution } = buildTreeWithSolution(13, 200);
    const gameId = uuidv4();
    const doc = new MathGraphGame({
      gameId,
      nodes,
      edges,
      solution, // secret
      createdAt: new Date()
    });
    await doc.save();

    // return only topology
    res.json({ success: true, gameId, _id: doc._id, nodes, edges, type: 'tree' });
  } catch (err) {
    console.error('generate-tree error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate tree.' });
  }
});

// POST /api/validate-graph remains the same as before but still works for trees.
// If you want, you can rename endpoints; keeping same path means frontend unchanged.
router.post('/validate-graph', async (req, res) => {
  try {
    const { gameId, userNodes, email } = req.body;
    if (!Array.isArray(userNodes) || userNodes.length !== 13) {
      return res.json({ valid: false, message: 'Provide 13 node values (1..13).' });
    }

    const seen = new Set();
    for (let i = 0; i < userNodes.length; i++) {
      const v = userNodes[i];
      if (typeof v === 'undefined' || v === null) {
        return res.json({ valid: false, message: `Node ${i} is empty.` });
      }
      const num = Number(v);
      if (!Number.isInteger(num) || num < 1 || num > 13) {
        return res.json({ valid: false, message: `Node ${i} must be integer 1..13.` });
      }
      if (seen.has(num)) {
        return res.json({ valid: false, message: `Value ${num} is used more than once.` });
      }
      seen.add(num);
    }

    const game = gameId ? await MathGraphGame.findOne({ gameId }).lean() : null;
    const edges = (game && Array.isArray(game.edges)) ? game.edges : (req.body.edges || []);

    const badEdges = [];
    for (const e of edges) {
      const a = e.u, b = e.v;
      const va = Number(userNodes[a]);
      const vb = Number(userNodes[b]);
      if (Math.abs(va - vb) === 1) badEdges.push({ u: a, v: b });
    }

    if (badEdges.length === 0) {
      const awardedPoints = 15;
      if (email) {
        const userDoc = await User.findOne({ email });
        if (userDoc) {
          userDoc.points = (userDoc.points || 0) + awardedPoints;
          await userDoc.save();
        }
      }

      const { nodes: newNodes, edges: newEdges } = buildTreeWithSolution(13, 200);
      const newGameId = uuidv4();
      const newDoc = new MathGraphGame({
        gameId: newGameId,
        nodes: newNodes,
        edges: newEdges,
        solution: {}, // secret
        createdAt: new Date()
      });
      await newDoc.save();

      return res.json({
        valid: true,
        message: 'Correct — no adjacent nodes differ by 1. +15 points!',
        awardedPoints,
        badEdges: [],
        newGame: { gameId: newGameId, nodes: newNodes, edges: newEdges }
      });
    }

    return res.json({
      valid: false,
      message: `Found ${badEdges.length} edges whose endpoints differ by 1.`,
      badEdges
    });
  } catch (err) {
    console.error('validate-graph error:', err);
    res.status(500).json({ valid: false, message: 'Server error during validation.' });
  }
});

module.exports = router;
