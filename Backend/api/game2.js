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

  const nodes = [];
  const maxLevel = Math.max(...Object.keys(levels).map(k => Number(k)));
  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    const group = levels[lvl] || [];
    const count = group.length;
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

/**
 * buildTreeWithSolution
 * - n: number of nodes
 * - maxAttempts: how many different tree topologies to try
 * For each topology we randomly permute an arithmetic progression of n consecutive odd integers and
 * check if every edge difference is unique (distinct).
 */
function buildTreeWithSolution(n = 7, maxAttempts = 200) {
  // Helper to create random tree parent array of size n
  function randomParentArray(n) {
    const nodeOrder = Array.from({ length: n }, (_, i) => i);
    shuffle(nodeOrder);
    const parent = Array(n).fill(-1);
    for (let i = 1; i < n; i++) {
      const node = nodeOrder[i];
      const connectTo = nodeOrder[Math.floor(Math.random() * i)];
      parent[node] = connectTo;
    }
    return parent;
  }

  // Helper to build edges list from parent array
  function edgesFromParent(parent) {
    const edges = [];
    for (let i = 0; i < parent.length; i++) {
      const p = parent[i];
      if (p !== -1) {
        const a = Math.min(i, p), b = Math.max(i, p);
        edges.push({ u: a, v: b });
      }
    }
    return edges;
  }

  // Try multiple random tree topologies
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const parent = randomParentArray(n);
    const edges = edgesFromParent(parent);

    // We'll attempt many random permutations of a consecutive-odd sequence
    // Choose a random odd start within a safe range to keep numbers reasonable
    // (start between 1 and 99 such that max doesn't get too large)
    const maxStart = Math.max(1, 99 - 2 * (n - 1));
    const startOddCandidates = [];
    for (let s = 1; s <= maxStart; s += 2) startOddCandidates.push(s);
    // try several starts
    shuffle(startOddCandidates);

    const trialsForAssignment = 800;
    for (let startTry = 0; startTry < Math.min(startOddCandidates.length, 10); startTry++) {
      const startOdd = startOddCandidates[startTry];
      const baseValues = Array.from({ length: n }, (_, i) => startOdd + 2 * i); // consecutive odd numbers

      // perform permutations
      for (let t = 0; t < trialsForAssignment; t++) {
        const vals = baseValues.slice();
        shuffle(vals);
        const assignment = {};
        for (let i = 0; i < n; i++) assignment[i] = vals[i];

        // compute diffs for edges and check they are all distinct
        const seenDiffs = new Set();
        let ok = true;
        for (const e of edges) {
          const a = e.u, b = e.v;
          const va = Math.max(Number(assignment[a]), Number(assignment[b]));
          const vb = Math.min(Number(assignment[a]), Number(assignment[b]));
          const diff = va - vb; // positive integer, should be even
          if (diff <= 0) { ok = false; break; }
          if (seenDiffs.has(diff)) { ok = false; break; }
          seenDiffs.add(diff);
        }

        if (!ok) continue;

        // success
        const nodes = layoutRadialFromParent(parent, 300, 300, 80);
        return { nodes, edges, solution: assignment, parent, n, startOdd };
      }
    }
    // else try another tree topology
  }

  // Fallback: deterministic construction for small n:
  // Build a simple chain and assign ascending consecutive odds to nodes in a way that makes edge diffs unique:
  // For a chain of n nodes, adjacent differences will be {2}. So fallback will build a "star-like" construction
  // to try to produce unique diffs. This is a last-resort safe construction for small n.
  const fallbackParent = Array(n).fill(-1);
  for (let i = 1; i < n; i++) fallbackParent[i] = 0; // star centered at node 0
  const fallbackEdges = edgesFromParent(fallbackParent);
  // assign values so that differences from center are distinct: center highest value, leaves descending
  const startOdd = 1;
  const baseValues = Array.from({ length: n }, (_, i) => startOdd + 2 * i);
  // put largest at center (node 0), assign others to leaves
  const assignment = {};
  assignment[0] = baseValues[n - 1];
  let idx = 0;
  for (let i = 1; i < n; i++) assignment[i] = baseValues[idx++];

  const nodes = layoutRadialFromParent(fallbackParent, 300, 300, 80);
  return { nodes, edges: fallbackEdges, solution: assignment, parent: fallbackParent, n, startOdd };
}

// GET /api/generate-graph?n=7  (keeps same path so frontend unchanged)
router.get('/generate-graph', async (req, res) => {
  try {
    // accept n as query param (integer >=2 )
    let n = parseInt(req.query.n, 10);
    if (!Number.isInteger(n) || n < 2) n = 7;

    const { nodes, edges, solution } = buildTreeWithSolution(n, 300);
    const gameId = uuidv4();
    const doc = new MathGraphGame({
      gameId,
      nodes,
      edges,
      solution, // secret
      n,
      createdAt: new Date()
    });
    await doc.save();

    // return only topology (not secret)
    res.json({ success: true, gameId, _id: doc._id, nodes, edges, type: 'tree', n });
  } catch (err) {
    console.error('generate-tree error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate tree.' });
  }
});

// POST /api/validate-graph
// New rules:
// - userNodes must contain n numbers
// - numbers must be consecutive odd integers (any starting odd), unique
// - for each edge compute diff = bigger - smaller ; all diffs must be distinct
router.post('/validate-graph', async (req, res) => {
  try {
    const { gameId, userNodes, email } = req.body;

    // fetch game to get n and edges if available
    let game = null;
    if (gameId) game = await MathGraphGame.findOne({ gameId }).lean();

    const n = (game && Number.isInteger(game.n)) ? game.n : (Array.isArray(userNodes) ? userNodes.length : 7);
    if (!Array.isArray(userNodes) || userNodes.length !== n) {
      return res.json({ valid: false, message: `Provide ${n} node values (consecutive odd integers).` });
    }

    // basic checks: integer, odd, >=1 (you can relax >=1 if negatives allowed), uniqueness
    const seen = new Set();
    let minVal = Infinity, maxVal = -Infinity;
    for (let i = 0; i < userNodes.length; i++) {
      const v = userNodes[i];
      if (typeof v === 'undefined' || v === null) {
        return res.json({ valid: false, message: `Node ${i} is empty.` });
      }
      const num = Number(v);
      if (!Number.isInteger(num)) {
        return res.json({ valid: false, message: `Node ${i} must be an integer.` });
      }
      // ensure odd (consecutive odd integers are required)
      if (Math.abs(num % 2) !== 1) {
        return res.json({ valid: false, message: `Node ${i} must be an odd integer.` });
      }
      if (seen.has(num)) {
        return res.json({ valid: false, message: `Value ${num} is used more than once.` });
      }
      seen.add(num);
      if (num < minVal) minVal = num;
      if (num > maxVal) maxVal = num;
    }

    // check they form n consecutive odd integers
    // consecutive odd arithmetic progression with step 2 => max-min == 2*(n-1)
    if ((maxVal - minVal) !== 2 * (n - 1)) {
      return res.json({ valid: false, message: `Values must be n=${n} consecutive odd integers (range mismatch).` });
    }
    // check every value fits progression minVal + 2*k
    for (const num of seen) {
      if (((num - minVal) % 2) !== 0) {
        return res.json({ valid: false, message: `Values are not consecutive odd integers.` });
      }
    }

    // get edges (either from saved game or from body)
    const edges = (game && Array.isArray(game.edges)) ? game.edges : (req.body.edges || []);

    // compute edge diffs and check uniqueness
    const badEdges = [];
    const seenDiffs = new Set();
    for (const e of edges) {
      const a = e.u, b = e.v;
      const va = Number(userNodes[a]);
      const vb = Number(userNodes[b]);
      const big = Math.max(va, vb);
      const small = Math.min(va, vb);
      const diff = big - small; // positive
      if (diff <= 0) {
        badEdges.push({ u: a, v: b, reason: 'non-positive-diff' });
        continue;
      }
      if (seenDiffs.has(diff)) {
        badEdges.push({ u: a, v: b, reason: 'duplicate-diff', diff });
        continue;
      }
      seenDiffs.add(diff);
    }

    if (badEdges.length === 0) {
      const awardedPoints = 15; // keep the same scoring or adjust by n if you want
      if (email) {
        const userDoc = await User.findOne({ email });
        if (userDoc) {
          userDoc.points = (userDoc.points || 0) + awardedPoints;
          await userDoc.save();
        }
        await MathGraphGame.deleteOne({ gameId });
      }

      // generate new game for next round (same n)
      const { nodes: newNodes, edges: newEdges } = buildTreeWithSolution(n, 300);
      const newGameId = uuidv4();
      const newDoc = new MathGraphGame({
        gameId: newGameId,
        nodes: newNodes,
        edges: newEdges,
        solution: {}, // secret
        n,
        createdAt: new Date()
      });
      await newDoc.save();

      return res.json({
        valid: true,
        message: `Correct — all edge differences are distinct. +${awardedPoints} points!`,
        awardedPoints,
        badEdges: [],
        newGame: { gameId: newGameId, nodes: newNodes, edges: newEdges, n }
      });
    }

    return res.json({
      valid: false,
      message: `Found ${badEdges.length} invalid edges (duplicate or non-positive differences).`,
      badEdges
    });
  } catch (err) {
    console.error('validate-graph error:', err);
    res.status(500).json({ valid: false, message: 'Server error during validation.' });
  }
});

module.exports = router;
