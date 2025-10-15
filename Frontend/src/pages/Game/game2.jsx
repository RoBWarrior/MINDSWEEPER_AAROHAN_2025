import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import bg from "../../../public/assets/game2main.jpg"

const LOCAL_STORAGE_KEY = 'arithmetic-crossword';


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
      const q = `${import.meta.env.VITE_BACKEND_BASE}/api/generate-crossword?size=12&count=6${typeof prefillParam !== 'undefined' ? `&prefill=${prefillParam}` : ''}`;
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
      const resp = await axios.post(`${process.env.BACKEND_BASE}/api/validate-crossword`, payload);
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
  minHeight: '100vh',            
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  backgroundImage: `linear-gradient(rgba(35,34,34,0.6), rgba(35,34,34,0.6)), url(${bg})`,
  backgroundSize: 'cover',       
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed'
  }}>
    <h2 style={{ margin: 0, marginBottom: 12, textAlign: 'center', color: "white" }}>Arithmetic Crossword</h2>

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
      </div>
    </div>

    <div style={{ marginBottom: 12, color: '#08fc1cff', textAlign: 'center' }}>
      <small>Tip: after Submit editable cells will get colored: green = correct, yellow = near (±1), red = wrong.</small>
    </div>

    {/* Grid wrapper: allow horizontal scrolling; center grid when it fits */}
    {/* Grid wrapper */}
<div ref={gridWrapperRef} style={{
  overflowX: 'auto',
  overflowY: 'auto',
  maxHeight: '60vh',
  maxWidth: '100%',
  padding: 8,
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 8,

  // Allow the background to show through:
  background: 'rgba(255,255,255,0.88)', // slightly translucent white
  // OR use transparent if you don't want any white block:
  // background: 'transparent',

  textAlign: 'center',
  boxSizing: 'border-box',
  whiteSpace: 'nowrap'
}}>

      {/* Inner grid: inline-grid so it centers when it fits, but remains scrollable when wider */}
      <div
        style={{
          display: 'inline-grid',
          gridTemplateColumns: `repeat(${grid[0].length}, ${CELL_SIZE}px)`,
          gap: 8,
          padding: 8,
          borderRadius: 8,
          // ensure it's treated as intrinsic content so horizontal scrolling works properly
          minWidth: 'max-content',
          margin: '0 auto',
          background: 'transparent',
        }}
      >
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
                  boxSizing: 'border-box',
                  // allow the input to shrink or grow properly inside grid cells
                  minWidth: 0
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
