// import React, { useCallback, useEffect, useState } from 'react';
// import axios from 'axios';

// // Keep in sync with backend SIZE
// const SIZE = 7;
// const ALLOWED = /^[0-9+\-*/=]$/;
// const storageKey = `math_cross_${SIZE}`;

// /* -------------------------
//    Client-side helpers (mirror server)
//    ------------------------- */

// function evalExprLeftToRight_client(expr) {
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

// function validateEquationString_client(s) {
//   if (typeof s !== 'string') return { ok: false, reason: 'not_string' };
//   if (s.indexOf('=') === -1) return { ok: false, reason: 'no_eq' };
//   if ((s.match(/=/g) || []).length !== 1) return { ok: false, reason: 'multiple_eq' };
//   const [left, right] = s.split('=');
//   if (!left || !right) return { ok: false, reason: 'empty_side' };
//   const lv = evalExprLeftToRight_client(left);
//   const rv = evalExprLeftToRight_client(right);
//   if (lv === null || rv === null) return { ok: false, reason: 'invalid_expr' };
//   if (lv !== rv) return { ok: false, reason: 'mismatch', leftVal: lv, rightVal: rv };
//   return { ok: true, leftVal: lv, rightVal: rv };
// }

// function collectSlots_client(solutionGrid) {
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

// /* -------------------------
//    Local fallback generator (now mirrors server)
//    ------------------------- */

// function localGenerate() {
//   const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
//   const OPS = ['+', '-', '*', '/'];

//   const evalExpr = (s) => {
//     if (!s) return null;
//     // same logic as server (left-to-right)
//     const nums = []; const ops = [];
//     let cur = '';
//     for (let i=0;i<s.length;i++){
//       const ch = s[i];
//       if (/\d/.test(ch)) cur += ch;
//       else if (OPS.includes(ch)) {
//         if (cur === '') return null;
//         nums.push(Number(cur)); ops.push(ch); cur = '';
//       } else return null;
//     }
//     if (cur === '') return null;
//     nums.push(Number(cur));
//     let acc = nums[0];
//     for (let i=0;i<ops.length;i++){
//       const op = ops[i], nxt = nums[i+1];
//       if (op==='+') acc+=nxt; else if (op==='-') acc-=nxt; else if (op==='*') acc*=nxt; else if (op==='/'){ if (nxt===0) return null; acc = Math.trunc(acc/nxt);}
//     }
//     return acc;
//   };

//   function makeEq(maxLen) {
//     for (let attempt=0; attempt<120; attempt++){
//       const terms = randInt(1,3);
//       const parts = [];
//       for (let t=0;t<terms;t++){
//         const digits = randInt(1,2);
//         let num = '';
//         for (let d=0;d<digits;d++) num += String(randInt(d===0?1:0,9));
//         parts.push(num);
//         if (t<terms-1) parts.push(OPS[Math.floor(Math.random()*OPS.length)]);
//       }
//       const left = parts.join('');
//       const val = evalExpr(left);
//       if (val === null) continue;
//       const s = `${left}=${val}`;
//       if (s.length <= maxLen && s.length >= 3) return s;
//     }
//     return null;
//   }

//   const TARGET_PLACED = SIZE >= 7 ? 16 : 10;
//   const MAX_ATTEMPTS = TARGET_PLACED * 4;
//   const MIN_PREFILLED_PERCENT = SIZE >= 7 ? 0.30 : 0.20;

//   for (let tryGen = 0; tryGen < 18; tryGen++) {
//     const grid = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));
//     const placements = [];
//     let placed = 0;

//     for (let attempt = 0; attempt < MAX_ATTEMPTS && placed < TARGET_PLACED; attempt++) {
//       const horizontal = Math.random() < 0.5;
//       const eq = makeEq(SIZE);
//       if (!eq) continue;
//       const r = randInt(0, SIZE - (horizontal ? 1 : eq.length));
//       const c = randInt(0, SIZE - (horizontal ? eq.length : 1));
//       // check conflict & place
//       let ok = true;
//       for (let i=0;i<eq.length;i++){
//         const rr = horizontal ? r : r + i;
//         const cc = horizontal ? c + i : c;
//         if (grid[rr][cc] === '#') ok = false;
//         if (grid[rr][cc] !== null && grid[rr][cc] !== eq[i]) ok = false;
//       }
//       if (!ok) continue;
//       for (let i=0;i<eq.length;i++){
//         const rr = horizontal ? r : r + i;
//         const cc = horizontal ? c + i : c;
//         grid[rr][cc] = eq[i];
//       }
//       placements.push({ r, c, eq, horizontal });
//       placed++;
//     }

//     // canonical solution: convert remaining null -> '#'
//     const solution = Array.from({ length: SIZE }, (_, r) =>
//       Array.from({ length: SIZE }, (_, c) => (grid[r][c] === null ? '#' : grid[r][c]))
//     );

//     // collect slots and validate them
//     const slots = collectSlots_client(solution);
//     let okAll = true;
//     for (const a of slots.across) {
//       const v = validateEquationString_client(a.s);
//       if (!v.ok) { okAll = false; break; }
//     }
//     if (!okAll) continue;
//     for (const d of slots.down) {
//       const v = validateEquationString_client(d.s);
//       if (!v.ok) { okAll = false; break; }
//     }
//     if (!okAll) continue;

//     // determine placedChars and prefilled subset
//     const placedChars = [];
//     for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++){
//       if (solution[r][c] !== '#' && solution[r][c] !== null) placedChars.push({ r, c, v: solution[r][c] });
//     }
//     const targetPrefilled = Math.max(Math.round(placedChars.length * MIN_PREFILLED_PERCENT), Math.min(6, Math.round(placedChars.length * MIN_PREFILLED_PERCENT)));
//     for (let i = placedChars.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       const tmp = placedChars[i]; placedChars[i] = placedChars[j]; placedChars[j] = tmp;
//     }
//     const prefilled = [];
//     for (let i=0;i<Math.min(targetPrefilled, placedChars.length); i++) prefilled.push({ r: placedChars[i].r, c: placedChars[i].c, value: placedChars[i].v });

//     // puzzle: '#' for black, prefilled chars shown, others null
//     const puzzle = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));
//     const preSet = new Set(prefilled.map(p => `${p.r},${p.c}`));
//     for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++){
//       if (solution[r][c] === '#') puzzle[r][c] = '#';
//       else if (preSet.has(`${r},${c}`)) puzzle[r][c] = prefilled.find(x => x.r === r && x.c === c).value;
//       else puzzle[r][c] = null;
//     }

//     // success: return both puzzle and solution (client can validate offline)
//     return { gameId: `local-${Date.now().toString(36)}`, size: SIZE, grid: puzzle, solution };
//   }

//   // fallback: if generation fails, build something small but valid (very rare)
//   // create a single across equation in row 0
//   const single = '1+1=2';
//   const grid = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => '#'));
//   for (let i=0;i<single.length && i<SIZE;i++) grid[0][i] = single[i];
//   const puzzle = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => '#'));
//   for (let i=0;i<single.length && i<SIZE;i++) puzzle[0][i] = single[i];
//   return { gameId: `local-${Date.now().toString(36)}`, size: SIZE, grid: puzzle, solution: grid };
// }

// /* ---------------------- main component ---------------------- */

// export default function Game2() {
//   const [gameId, setGameId] = useState(null);
//   const [puzzleGrid, setPuzzleGrid] = useState(null); // '#' | char | null
//   const [userGrid, setUserGrid] = useState(null);     // '#' | char | null
//   const [message, setMessage] = useState('');
//   const [debug, setDebug] = useState(null);
//   const [solutionGrid, setSolutionGrid] = useState(null); // canonical solution when available
//   const [localMode, setLocalMode] = useState(false);

//   const fetchPuzzle = useCallback(async () => {
//     setMessage('Loading crossword...');
//     try {
//       const res = await axios.get('/api/generate-crossword', { timeout: 5000 });
//       const d = res.data;
//       // Accept `grid` or `puzzle`, and accept `solution` if provided
//       let rawGrid = null;
//       if (d && Array.isArray(d.grid)) rawGrid = d.grid;
//       else if (d && Array.isArray(d.puzzle)) rawGrid = d.puzzle;
//       else {
//         console.warn('Unexpected /api/generate-crossword payload:', d);
//         throw new Error('unexpected payload');
//       }
//       // validate shape
//       if (!Array.isArray(rawGrid) || rawGrid.length !== SIZE || !Array.isArray(rawGrid[0])) {
//         console.warn('Invalid grid shape from server:', rawGrid);
//         throw new Error('invalid grid shape');
//       }
//       // normalize
//       const normalizedGrid = rawGrid.map((row, r) => {
//         if (!Array.isArray(row) || row.length !== SIZE) { console.warn(`Invalid row ${r} from server:`, row); throw new Error('invalid row shape'); }
//         return row.map((cell) => (cell === '#' ? '#' : (cell === null || cell === undefined ? null : String(cell))));
//       });

//       setGameId(d.gameId || `remote-${Date.now()}`);
//       setPuzzleGrid(normalizedGrid);
//       setLocalMode(false);

//       // solution from server if available
//       if (d && Array.isArray(d.solution) && d.solution.length === SIZE) {
//         const sol = d.solution.map((row) => row.map((cell) => (cell === '#' ? '#' : String(cell))));
//         setSolutionGrid(sol);
//       } else {
//         setSolutionGrid(null);
//       }

//       const ug = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));
//       for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++){
//         const v = normalizedGrid[r][c];
//         if (v === '#') ug[r][c] = '#';
//         else if (v === null) ug[r][c] = null;
//         else ug[r][c] = String(v);
//       }
//       setUserGrid(ug);
//       setMessage('');
//       setDebug(d.summary || null);
//       localStorage.setItem(storageKey, JSON.stringify({ gameId: d.gameId || null, grid: normalizedGrid, solution: d.solution || null }));
//     } catch (err) {
//       console.warn('Server generate failed, falling back (see console)', err);
//       setMessage('Server not reachable or invalid; using local puzzle fallback.');
//       const fb = localGenerate();
//       setGameId(fb.gameId);
//       setPuzzleGrid(fb.grid);
//       setSolutionGrid(fb.solution || null);
//       setLocalMode(true);
//       const ug = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));
//       for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++){
//         const v = fb.grid[r][c];
//         ug[r][c] = (v === '#') ? '#' : (v === null ? null : String(v));
//       }
//       setUserGrid(ug);
//       localStorage.setItem(storageKey, JSON.stringify({ gameId: fb.gameId, grid: fb.grid, solution: fb.solution || null }));
//     }
//   }, []);

//   useEffect(() => {
//     const saved = localStorage.getItem(storageKey);
//     if (saved) {
//       try {
//         const p = JSON.parse(saved);
//         if (Array.isArray(p.grid) && p.grid.length === SIZE) {
//           setGameId(p.gameId);
//           setPuzzleGrid(p.grid);
//           setSolutionGrid(p.solution || null);
//           setLocalMode(String(p.gameId || '').startsWith('local-'));
//           const ug = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));
//           for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++){
//             const v = p.grid[r][c];
//             ug[r][c] = (v === '#') ? '#' : (v === null ? null : String(v));
//           }
//           setUserGrid(ug);
//           setMessage('');
//           return;
//         }
//       } catch (e) {}
//     }
//     fetchPuzzle();
//   }, [fetchPuzzle]);

//   const onChangeCell = (r, c, raw) => {
//     if (!userGrid || !puzzleGrid) return;
//     const puzzleCell = puzzleGrid[r][c];
//     if (puzzleCell !== null && puzzleCell !== undefined && puzzleCell !== '#') return; // prefilled
//     const v = raw ? String(raw).trim() : '';
//     if (v === '') {
//       const copy = userGrid.map(row => [...row]); copy[r][c] = null; setUserGrid(copy); return;
//     }
//     const ch = v[0];
//     if (!ALLOWED.test(ch)) return;
//     const copy = userGrid.map(row => [...row]); copy[r][c] = ch; setUserGrid(copy);
//   };

//   function localValidate() {
//     if (!userGrid || !puzzleGrid) return { valid: false, solved: false, message: 'No grid' };
//     // if we have canonical solutionGrid (from localGenerate), use that for slots; else build solution from puzzle
//     const canonical = solutionGrid ? solutionGrid : puzzleGrid.map(row => row.map(cell => (cell === null ? '#' : cell)));
//     const slots = collectSlots_client(canonical);
//     const problems = [];
//     // across
//     for (const a of slots.across) {
//       const { r, c0, len } = a;
//       let raw = '';
//       let incomplete = false;
//       for (let i=0;i<len;i++){
//         const ch = userGrid[r][c0 + i];
//         if (ch === null || ch === undefined || ch === '') { incomplete = true; raw += ' '; } else raw += String(ch);
//       }
//       if (incomplete) { problems.push({ dir:'across', r, c0, len, str: raw, reason: 'incomplete' }); continue; }
//       const compact = raw.replace(/\s+/g, '');
//       const v = validateEquationString_client(compact);
//       if (!v.ok) problems.push({ dir:'across', r, c0, len, str: compact, reason: v.reason, leftVal: v.leftVal, rightVal: v.rightVal });
//     }
//     // down
//     for (const d of slots.down) {
//       const { c, r0, len } = d;
//       let raw = '';
//       let incomplete = false;
//       for (let i=0;i<len;i++){
//         const ch = userGrid[r0 + i][c];
//         if (ch === null || ch === undefined || ch === '') { incomplete = true; raw += ' '; } else raw += String(ch);
//       }
//       if (incomplete) { problems.push({ dir:'down', c, r0, len, str: raw, reason: 'incomplete' }); continue; }
//       const compact = raw.replace(/\s+/g, '');
//       const v = validateEquationString_client(compact);
//       if (!v.ok) problems.push({ dir:'down', c, r0, len, str: compact, reason: v.reason, leftVal: v.leftVal, rightVal: v.rightVal });
//     }

//     const solved = problems.length === 0;
//     return { valid: true, solved, problems, slotsCount: slots.across.length + slots.down.length };
//   }

//   const submit = async () => {
//     if (!userGrid || !gameId) { setMessage('Nothing to validate'); return; }
//     setMessage('Validating...');
//     const payloadGrid = Array.from({ length: SIZE }, (_, r) => Array.from({ length: SIZE }, (_, c) => {
//       const u = userGrid[r][c];
//       if (u === undefined || u === '') return null;
//       return u;
//     }));

//     if (localMode || String(gameId).startsWith('local-')) {
//       const res = localValidate();
//       if (res.valid && res.solved) { setMessage('Solved! 🎉 (local validation)'); setDebug(res); }
//       else if (res.valid) { setMessage('Not solved — see the problems debug below (local)'); setDebug(res); }
//       else setMessage(`Local validation failed: ${res.message}`);
//       return;
//     }

//     try {
//       // preflight
//       for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++){
//         const sol = puzzleGrid[r][c];
//         const u = userGrid[r][c];
//         if (sol === '#') {
//           if (u !== '#') { setMessage(`Grid mismatch at ${r},${c} — expected black`); return; }
//         } else {
//           if (u === null || u === undefined || u === '') continue;
//           if (!/^[0-9+\-*/=]$/.test(String(u))) { setMessage(`Invalid character at ${r},${c}: ${u}`); return; }
//         }
//       }
//       const res = await axios.post('/api/validate-crossword', { gameId, userGrid: payloadGrid });
//       if (res.data && res.data.solved) { setMessage('Solved! 🎉 All across & down equations valid.'); setDebug(res.data); }
//       else { setMessage('Not solved — see the problems debug below (server)'); setDebug(res.data); }
//     } catch (err) {
//       console.error('validate failed', err);
//       setMessage('Validation request failed — check console. If server is down you can play offline (local fallback).');
//     }
//   };

//   if (!puzzleGrid || !userGrid) return <div style={{ padding:20 }}>{message || 'Loading crossword...'}</div>;

//   return (
//     <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
//       <h2>Math Crossword — {SIZE}×{SIZE}</h2>
//       <div style={{ marginBottom: 8, color: '#444' }}>{message}</div>

//       <div style={{ display: 'inline-block', padding: 12, borderRadius: 8, background:'#fff', boxShadow:'0 2px 6px rgba(0,0,0,0.06)' }}>
//         {Array.from({ length: SIZE }).map((_, r) => (
//           <div key={r} style={{ display:'flex' }}>
//             {Array.from({ length: SIZE }).map((__, c) => {
//               const cell = puzzleGrid[r][c];
//               const val = userGrid[r][c];
//               if (cell === '#') {
//                 return <div key={`${r}-${c}`} style={{ width:44, height:44, background:'#222', margin:4, borderRadius:4 }} />;
//               }
//               const isPrefilled = cell !== null && cell !== undefined;
//               return (
//                 <div key={`${r}-${c}`} style={{ width:44, height:44, margin:4, display:'flex', alignItems:'center', justifyContent:'center' }}>
//                   {isPrefilled ? (
//                     <div style={{ width:'100%', height:'100%', border:'2px solid #333', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', background:'#fafafa', fontWeight:700 }}>
//                       {String(val || cell)}
//                     </div>
//                   ) : (
//                     <input
//                       value={val === null ? '' : val}
//                       onChange={(e) => onChangeCell(r,c,e.target.value)}
//                       maxLength={1}
//                       style={{ width:'100%', height:'100%', textAlign:'center', fontWeight:700, fontSize:18, borderRadius:6, border:'2px solid #333' }}
//                     />
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         ))}
//       </div>

//       <div style={{ marginTop: 12 }}>
//         <button onClick={submit} style={{ padding:'8px 14px', background:'#0b79d0', color:'#fff', border:'none', borderRadius:6 }}>Submit</button>
//         <button onClick={() => { localStorage.removeItem(storageKey); fetchPuzzle(); }} style={{ marginLeft:12, padding:'8px 14px' }}>New Crossword</button>
//       </div>

//       <div style={{ marginTop: 12 }}>
//         <details>
//           <summary style={{ cursor:'pointer' }}>Debug / validation output</summary>
//           <pre style={{ maxHeight:300, overflow:'auto', background:'#f6f6f6', padding:8 }}>{debug ? JSON.stringify(debug, null, 2) : 'none'}</pre>
//         </details>
//       </div>

//       <div style={{ marginTop: 12, color:'#666' }}>
//         Tip: fill digits, operators (+ - * /) and '='. Each across & down contiguous run (length ≥ 3) must form a valid equation with one '=' and left-to-right integer arithmetic.
//         <div style={{ marginTop:6, fontSize:12, color:'#999' }}>{localMode ? 'PLAYING IN LOCAL (OFFLINE) MODE' : 'Connected to server (server validation on submit)'}</div>
//       </div>
//     </div>
//   );
// }



// src/components/Game2.jsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const LOCAL_STORAGE_KEY = 'arithmetic-crossword';
const BACKEND_BASE = 'http://localhost:5000';

// Keep ~50% of server prefilled to make hints more evident
const PREFILL_RATIO = 0.5;
// fixed cell size (px)
const CELL_SIZE = 48;

export default function Game2() {
  const [grid, setGrid] = useState([]);
  const [prefilled, setPrefilled] = useState([]);
  const [userGrid, setUserGrid] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [gameId, setGameId] = useState(null);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [verifying, setVerifying] = useState(false);

  // coloring/status state: null | 'correct' | 'close' | 'wrong'
  const [cellStatus, setCellStatus] = useState([]);

  // grid wrapper ref for scroll reset
  const gridWrapperRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const { grid: g, prefilled: pf, userGrid: ug, gameId: id } = JSON.parse(saved);
        if (Array.isArray(g) && Array.isArray(ug)) {
          setGrid(g);
          setPrefilled(pf || []);
          setUserGrid(ug);
          setGameId(id);
          setCellStatus(makeEmptyStatus(g.length, g[0]?.length || 0));
          setLoading(false);
          return;
        }
      } catch (e) { /* ignore and fetch */ }
    }
    fetchNewCrossword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (grid.length && userGrid.length && gameId) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ grid, prefilled, userGrid, gameId }));
    }
  }, [grid, prefilled, userGrid, gameId]);

  function makeEmptyStatus(rows, cols) {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
  }

  const fetchNewCrossword = async (prefillParam) => {
    setLoading(true);
    setFeedback('');
    setPointsAwarded(0);
    try {
      const q = `${BACKEND_BASE}/api/generate-crossword?size=12&count=6${typeof prefillParam !== 'undefined' ? `&prefill=${prefillParam}` : ''}`;
      const res = await axios.get(q);
      const payload = res.data || {};
      if (!Array.isArray(payload.grid)) {
        alert('Unexpected response from server when generating crossword.');
        setLoading(false);
        return;
      }
      const sol = payload.grid;
      setGrid(sol);

      const serverPrefilled = Array.isArray(payload.prefilled) ? payload.prefilled : [];
      const keepCount = Math.max(0, Math.floor(serverPrefilled.length * PREFILL_RATIO));
      const pf = (keepCount < serverPrefilled.length && serverPrefilled.length > 0)
        ? shuffleCopy(serverPrefilled).slice(0, Math.max(2, keepCount))
        : serverPrefilled;
      setPrefilled(pf);

      const ug = sol.map(row => row.map(() => null));
      for (const p of pf) {
        if (ug[p.r] && typeof ug[p.r][p.c] !== 'undefined') ug[p.r][p.c] = String(p.value);
      }
      setUserGrid(ug);

      setGameId(payload.gameId || payload._id || null);
      setCellStatus(makeEmptyStatus(sol.length, sol[0]?.length || 0));
    } catch (err) {
      console.error('Failed to load crossword:', err);
      alert('Failed to load crossword — check server');
    } finally {
      setLoading(false);
      if (gridWrapperRef.current) gridWrapperRef.current.scrollTop = 0;
    }
  };

  function shuffleCopy(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  const isPrefilled = (r, c) => prefilled.some(p => p.r === r && p.c === c);
  const isOperatorCell = (r, c) => {
    const ch = grid?.[r]?.[c];
    if (!ch) return false;
    return ch !== ' ' && !/^\d$/.test(ch);
  };
  const isEditable = (r, c) => !isPrefilled(r, c) && grid?.[r]?.[c] !== ' ' && /^\d$/.test(grid[r][c]);

  // when user edits a cell, clear its status
  const onChangeCell = (r, c, raw) => {
    const filtered = (raw || '').replace(/[^0-9]/g, '').slice(0, 1);
    const copy = userGrid.map(row => [...row]);
    copy[r][c] = filtered.length ? filtered : null;
    setUserGrid(copy);

    // clear status for this cell
    setCellStatus(st => {
      if (!st || !st[r]) return st;
      const cp = st.map(row => [...row]);
      cp[r][c] = null;
      return cp;
    });
  };

  const onKeyDownCell = (e) => {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'];
    if (allowed.includes(e.key)) return;
    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
  };

  const buildMergedGridForSubmit = () => {
    return grid.map((row, r) =>
      row.map((cell, c) => {
        if (cell === ' ') return ' ';
        if (isPrefilled(r, c)) return String(cell);
        if (isOperatorCell(r, c)) return String(cell);
        const v = userGrid?.[r]?.[c];
        return (v === null || v === '' || typeof v === 'undefined') ? null : String(v);
      })
    );
  };

  // compute per-cell status comparing userGrid to grid (solution)
  // exact -> 'correct', abs diff 1 -> 'close', else 'wrong'
  const computeCellStatuses = (solutionGrid, userGridLocal) => {
    const R = solutionGrid.length;
    const C = solutionGrid[0]?.length || 0;
    const statuses = Array.from({ length: R }, () => Array.from({ length: C }, () => null));
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        if (!/^\d$/.test(String(solutionGrid[r][c]))) continue;
        if (isPrefilled(r, c)) continue;
        const user = userGridLocal?.[r]?.[c];
        if (user === null || typeof user === 'undefined') {
          statuses[r][c] = null;
          continue;
        }
        const solChar = String(solutionGrid[r][c]);
        const userChar = String(user);
        if (!/^\d$/.test(userChar)) {
          statuses[r][c] = 'wrong';
          continue;
        }
        const diff = Math.abs(Number(solChar) - Number(userChar));
        if (diff === 0) statuses[r][c] = 'correct';
        else if (diff === 1) statuses[r][c] = 'close';
        else statuses[r][c] = 'wrong';
      }
    }
    return statuses;
  };

  const submitCrossword = async () => {
    setVerifying(true);
    setFeedback('');
    setPointsAwarded(0);
    try {
      const merged = buildMergedGridForSubmit();
      const payload = { gameId, userGrid: merged, email: localStorage.getItem('email') || undefined };
      const resp = await axios.post(`${BACKEND_BASE}/api/validate-crossword`, payload);
      const data = resp.data || {};

      // compute and set statuses locally from known solution grid and current userGrid
      const statuses = computeCellStatuses(grid, userGrid);
      setCellStatus(statuses);

      if (data.valid) {
        setFeedback(data.message || 'Correct! Puzzle solved.');
        setPointsAwarded(data.awardedPoints || 0);
        localStorage.removeItem(LOCAL_STORAGE_KEY);

        if (data.newGame?.grid) {
          setTimeout(() => {
            const g = data.newGame.grid;
            const pf = Array.isArray(data.newGame.prefilled) ? data.newGame.prefilled : [];
            const keepCount = Math.max(0, Math.floor(pf.length * PREFILL_RATIO));
            const finalPf = (keepCount < pf.length && pf.length > 0) ? shuffleCopy(pf).slice(0, Math.max(2, keepCount)) : pf;

            setGrid(g);
            setPrefilled(finalPf);
            const ug = g.map(row => row.map(() => null));
            for (const p of finalPf) {
              if (ug[p.r] && typeof ug[p.r][p.c] !== 'undefined') ug[p.r][p.c] = String(p.value);
            }
            setUserGrid(ug);
            setGameId(data.newGame.gameId || data.newGame._id || null);
            setCellStatus(makeEmptyStatus(g.length, g[0]?.length || 0));
            setFeedback('');
            setPointsAwarded(0);
            if (gridWrapperRef.current) gridWrapperRef.current.scrollTop = 0;
          }, 800);
        }
      } else {
        setFeedback(data.message || 'Some equations are invalid. Check and try again.');
      }
    } catch (err) {
      console.error('validation error:', err);
      alert('Error validating crossword — check server logs.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <div style={{ padding: 18 }}>Loading crossword…</div>;
  if (!grid || !grid.length) return <div style={{ padding: 18 }}>No puzzle loaded.</div>;

  const cols = grid[0].length;
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
    gap: 8,
    justifyContent: 'center' // center the grid columns
  };

  // map status to colors (editable cells)
  const statusBg = {
    correct: '#d1e7dd', // green
    close: '#fff3cd',   // yellow
    wrong: '#f8d7da'    // red
  };

  return (
    <div style={{
      padding: 18,
      fontFamily: 'sans-serif',
      maxHeight: '86vh',
      overflowY: 'auto',
      boxSizing: 'border-box',

      // center everything horizontally
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h2 style={{ color: '#111', margin: 0, marginBottom: 12, textAlign: 'center', color: "white" }}>Arithmetic Crossword</h2>

      <div style={{
        marginBottom: 8,
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center', // center controls
      }}>
        <div>
          <button onClick={submitCrossword} disabled={verifying} style={{ marginRight: 8, color : "white", backgroundColor : "green", padding: "8px", borderRadius : "8px" }}>Submit</button>
          <button onClick={() => fetchNewCrossword()} style={{ marginRight: 8, color : "white", backgroundColor : "purple", padding: "8px", borderRadius : "8px" }}>New Crossword</button>
          {/* <button onClick={() => fetchNewCrossword(0)} style={{ marginRight: 8 }}>No Prefill</button> */}
        </div>
      </div>

      <div style={{ marginBottom: 12, color: '#08fc1cff', textAlign: 'center' }}>
        <small>Tip: after Submit editable cells will get colored: green = correct, yellow = near (±1), red = wrong.</small>
      </div>

      <div ref={gridWrapperRef} style={{
        overflow: 'auto',
        maxHeight: '70vh',
        maxWidth: '100%',
        padding: 8,
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 8,
        background: '#ffffff',

        // center the inner grid wrapper
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={gridStyle}>
          {grid.map((row, r) =>
            row.map((cell, c) => {
              if (cell === ' ') {
                return <div key={`${r}-${c}`} style={{ width: CELL_SIZE, height: CELL_SIZE, backgroundColor: '#000', borderRadius: 6 }} />;
              }

              const pre = isPrefilled(r, c);
              const operator = isOperatorCell(r, c);
              const editable = isEditable(r, c);
              const status = cellStatus?.[r]?.[c];

              const bgColorEditable = status ? statusBg[status] : '#fff8dc';
              const bgColor = pre ? '#cfe2ff' : (operator ? '#f1f3f5' : bgColorEditable);

              if (pre || operator) {
                return (
                  <div key={`${r}-${c}`} style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    border: pre ? '2px solid #0d6efd' : '1px solid #bbb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    backgroundColor: bgColor,
                    color: pre ? '#012a4a' : '#000',
                    fontSize: pre ? Math.max(14, Math.floor(CELL_SIZE * 0.42)) : Math.max(12, Math.floor(CELL_SIZE * 0.36)),
                    borderRadius: 8,
                    boxShadow: pre ? '0 2px 6px rgba(13,110,253,0.18)' : 'none',
                    boxSizing: 'border-box'
                  }}>
                    {String(cell)}
                  </div>
                );
              }

              // editable cell
              return (
                <input key={`${r}-${c}`}
                  value={userGrid[r][c] || ''}
                  onChange={e => onChangeCell(r, c, e.target.value)}
                  onKeyDown={onKeyDownCell}
                  maxLength={1}
                  inputMode="numeric"
                  pattern="\d*"
                  aria-label={`cell-${r}-${c}`}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: Math.max(12, Math.floor(CELL_SIZE * 0.38)),
                    backgroundColor: bgColor,
                    color: '#000',
                    border: '1px solid #aaa',
                    borderRadius: 8,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              );
            })
          )}
        </div>
      </div>

      <div style={{ marginTop: 12, textAlign: 'center' }}>
        {feedback && <div style={{ color: '#0f5132', fontWeight: 500 }}>{feedback}</div>}
        {pointsAwarded > 0 && <div style={{ marginTop: 8, color: 'green', fontWeight: 600 }}>🎉 +{pointsAwarded} points!</div>}
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}
