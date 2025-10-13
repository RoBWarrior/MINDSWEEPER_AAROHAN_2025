// src/pages/Game/game2.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

/*
  UI layout:
  - S x S number cells
  - horizontal operator slots between numbers (rendered between cells)
  - vertical operator slots between rows (rendered below each row)
  - Pools: numbers and operators to drag/click
*/

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export default function Game2() {
  const { length } = useParams();
  const size = Math.max(2, Math.min(7, parseInt(length || '3', 10)));

  const [gameId, setGameId] = useState(null);
  const [numbersGrid, setNumbersGrid] = useState([]); // S x S
  const [hOperators, setHOperators] = useState([]); // S x (S-1)
  const [vOperators, setVOperators] = useState([]); // (S-1) x S
  const [poolNumbers, setPoolNumbers] = useState([]);
  const [poolOperators, setPoolOperators] = useState([]);
  const [across, setAcross] = useState([]); // targets for each row
  const [down, setDown] = useState([]); // targets for each col
  const [selectedCell, setSelectedCell] = useState(null); // {type:'num'/'hOp'/'vOp', r,c}
  const [message, setMessage] = useState('');
  const [initialState, setInitialState] = useState(null);

  const storageKey = `arith_cross_${size}`;

  const fetchGame = useCallback(async () => {
    try {
      const res = await axios.get(`/api/generate-game?size=${size}`);
      const d = res.data;
      setGameId(d.gameId);
      setNumbersGrid(d.numbersGrid);
      setHOperators(d.hOperators);
      setVOperators(d.vOperators);
      setAcross(d.across || []);
      setDown(d.down || []);
      // pool provided; shuffle
      setPoolNumbers(shuffle(d.poolNumbers || []));
      setPoolOperators(shuffle(d.poolOperators || []));
      setInitialState({
        numbersGrid: d.numbersGrid,
        hOperators: d.hOperators,
        vOperators: d.vOperators,
        poolNumbers: d.poolNumbers,
        poolOperators: d.poolOperators,
        preplaced: d.preplaced || null
      });
      // persist
      localStorage.setItem(storageKey, JSON.stringify({ gameId:d.gameId, size:d.size, numbersGrid:d.numbersGrid, hOperators:d.hOperators, vOperators:d.vOperators, across:d.across, down:d.down, poolNumbers:d.poolNumbers, poolOperators:d.poolOperators, preplaced:d.preplaced||null }));
      setMessage('');
    } catch (err) {
      console.error(err);
      setMessage('Failed to load game from server.');
    }
  }, [size, storageKey]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Array.isArray(p.numbersGrid)) {
          setGameId(p.gameId || null);
          setNumbersGrid(p.numbersGrid);
          setHOperators(p.hOperators || []);
          setVOperators(p.vOperators || []);
          setPoolNumbers(shuffle(p.poolNumbers || []));
          setPoolOperators(shuffle(p.poolOperators || []));
          setAcross(p.across || []);
          setDown(p.down || []);
          setInitialState({ numbersGrid: p.numbersGrid, hOperators: p.hOperators, vOperators: p.vOperators, poolNumbers: p.poolNumbers, poolOperators: p.poolOperators, preplaced: p.preplaced||null });
          return;
        }
      } catch (e) {}
    }
    fetchGame();
  }, [fetchGame, storageKey]);

  // drag handlers
  const onDragStart = (e, payload) => {
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
  };
  const allowDrop = (e) => e.preventDefault();

  // place number into numbersGrid at r,c
  const placeNumber = (r, c, value) => {
    setNumbersGrid(prev => {
      const copy = prev.map(row => [...row]);
      if (copy[r][c] !== null) return prev; // do not overwrite
      copy[r][c] = value;
      return copy;
    });
    setPoolNumbers(prev => {
      const i = prev.indexOf(value);
      if (i === -1) return prev;
      const next = [...prev.slice(0,i), ...prev.slice(i+1)];
      return next;
    });
  };

  // place horizontal operator at r,c (between c and c+1)
  const placeHOp = (r, c, op) => {
    setHOperators(prev => {
      const copy = prev.map(row => [...row]);
      if (copy[r][c] !== null) return prev;
      copy[r][c] = op;
      return copy;
    });
    setPoolOperators(prev => {
      const i = prev.indexOf(op);
      if (i === -1) return prev;
      return [...prev.slice(0,i), ...prev.slice(i+1)];
    });
  };

  // place vertical operator at r,c (between r and r+1)
  const placeVOp = (r, c, op) => {
    setVOperators(prev => {
      const copy = prev.map(row => [...row]);
      if (copy[r][c] !== null) return prev;
      copy[r][c] = op;
      return copy;
    });
    setPoolOperators(prev => {
      const i = prev.indexOf(op);
      if (i === -1) return prev;
      return [...prev.slice(0,i), ...prev.slice(i+1)];
    });
  };

  // generic onDrop handlers
  const onDropNumber = (e, r, c) => {
    e.preventDefault();
    try {
      const { type, value } = JSON.parse(e.dataTransfer.getData('application/json'));
      if (type !== 'number') return;
      placeNumber(r, c, value);
    } catch (err) {}
  };
  const onDropHOp = (e, r, c) => {
    e.preventDefault();
    try {
      const { type, value } = JSON.parse(e.dataTransfer.getData('application/json'));
      if (type !== 'operator') return;
      placeHOp(r, c, value);
    } catch (err) {}
  };
  const onDropVOp = (e, r, c) => {
    e.preventDefault();
    try {
      const { type, value } = JSON.parse(e.dataTransfer.getData('application/json'));
      if (type !== 'operator') return;
      placeVOp(r, c, value);
    } catch (err) {}
  };

  const removePlacedNumber = (r, c) => {
    setNumbersGrid(prev => {
      const copy = prev.map(row => [...row]);
      const v = copy[r][c];
      if (v === null) return prev;
      copy[r][c] = null;
      setPoolNumbers(prevPool => [...prevPool, v]);
      return copy;
    });
  };
  const removePlacedHOp = (r, c) => {
    setHOperators(prev => {
      const copy = prev.map(row => [...row]);
      const v = copy[r][c];
      if (v === null) return prev;
      copy[r][c] = null;
      setPoolOperators(prevPool => [...prevPool, v]);
      return copy;
    });
  };
  const removePlacedVOp = (r, c) => {
    setVOperators(prev => {
      const copy = prev.map(row => [...row]);
      const v = copy[r][c];
      if (v === null) return prev;
      copy[r][c] = null;
      setPoolOperators(prevPool => [...prevPool, v]);
      return copy;
    });
  };

  // compute across/ down values for display (left-to-right)
  const computeRow = (r) => {
    const nums = numbersGrid[r];
    const ops = hOperators[r];
    if (!nums || !ops) return null;
    if (nums.some(x => x === null) || ops.some(x => x === null)) return null;
    let cur = Number(nums[0]);
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i], nxt = Number(nums[i+1]);
      if (op === '+') cur = cur + nxt;
      else if (op === '-') cur = cur - nxt;
      else if (op === '*') cur = cur * nxt;
      else if (op === '/') { if (nxt === 0) return null; cur = Math.trunc(cur / nxt); }
    }
    return cur;
  };
  const computeCol = (c) => {
    const nums = numbersGrid.map(r => r[c]);
    const ops = vOperators.map(r => r[c]);
    if (nums.some(x => x === null) || ops.some(x => x === null)) return null;
    let cur = Number(nums[0]);
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i], nxt = Number(nums[i+1]);
      if (op === '+') cur = cur + nxt;
      else if (op === '-') cur = cur - nxt;
      else if (op === '*') cur = cur * nxt;
      else if (op === '/') { if (nxt === 0) return null; cur = Math.trunc(cur / nxt); }
    }
    return cur;
  };

  const submit = async () => {
    try {
      const email = localStorage.getItem('email') || null;
      const payload = { gameId, numbersGrid, hOperators, vOperators, email };
      const res = await axios.post('/api/validate-game', payload);
      if (res.data && res.data.solved) {
        setMessage(res.data.message || 'Solved!');
        // load new game if provided
        if (res.data.newGame) {
          const p = res.data.newGame;
          setGameId(p.gameId);
          setNumbersGrid(p.numbersGrid);
          setHOperators(p.hOperators);
          setVOperators(p.vOperators);
          setPoolNumbers(shuffle(p.poolNumbers || []));
          setPoolOperators(shuffle(p.poolOperators || []));
          setAcross(p.across || []);
          setDown(p.down || []);
          localStorage.setItem(storageKey, JSON.stringify({ gameId:p.gameId, size:p.size, numbersGrid:p.numbersGrid, hOperators:p.hOperators, vOperators:p.vOperators, poolNumbers:p.poolNumbers, poolOperators:p.poolOperators, preplaced:p.preplaced||null }));
        }
      } else {
        setMessage(res.data?.message || 'Not solved');
      }
    } catch (err) {
      console.error(err);
      setMessage('Validation failed');
    }
  };

  // Render helpers
  if (!numbersGrid || numbersGrid.length === 0) {
    return <div style={{padding:20}}>Loading...</div>;
  }

  const S = numbersGrid.length;

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2>Arithmetic Crossword — {S}×{S}</h2>
      <div style={{ marginTop: 10 }}>Game ID: {gameId}</div>
      <div style={{ marginTop: 10, color: '#444' }}>{message}</div>

      <div style={{ display: 'inline-block', marginTop: 20 }}>
        {/* Grid rendering */}
        {numbersGrid.map((row, r) => (
          <div key={`row-${r}`} style={{ display: 'flex', marginBottom: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* number cell + vertical operator below (for each column) */}
            </div>
            {row.map((num, c) => (
              <div key={`cell-${r}-${c}`} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Number cell */}
                <div
                  onDrop={(e) => onDropNumber(e, r, c)}
                  onDragOver={allowDrop}
                  onDoubleClick={() => removePlacedNumber(r, c)}
                  style={{
                    width: 50, height: 50, borderRadius: 8, border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginRight: 6, background: '#fff', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  {numbersGrid[r][c] !== null ? numbersGrid[r][c] : ''}
                </div>

                {/* horizontal operator slot (if not last column) */}
                {c < S - 1 && (
                  <div
                    onDrop={(e) => onDropHOp(e, r, c)}
                    onDragOver={allowDrop}
                    onDoubleClick={() => removePlacedHOp(r, c)}
                    style={{
                      width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(0deg)',
                      border: '2px solid #007bff', marginRight: 6, borderRadius: 6, background: '#f7fbff', fontWeight: 'bold'
                    }}
                  >
                    {hOperators[r] && hOperators[r][c] ? hOperators[r][c] : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* vertical operator row labels (visual cues) */}
        <div style={{ marginTop: 8 }}>
          <small style={{ color: '#666' }}>Tip: double-click placed items to remove.</small>
        </div>

        {/* display down targets alongside grid */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 14, fontWeight: '600' }}>Across (row) targets:</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            {across.map((a, i) => {
              const val = computeRow(i);
              return <div key={`a-${i}`} style={{ padding: 6, border: '1px solid #ddd' }}>Row {i}: target {a.target} {val !== null ? `(current ${val})` : ''}</div>;
            })}
          </div>

          <div style={{ fontSize: 14, fontWeight: '600', marginTop: 8 }}>Down (col) targets:</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            {down.map((d, i) => {
              const val = computeCol(i);
              return <div key={`d-${i}`} style={{ padding: 6, border: '1px solid #ddd' }}>Col {i}: target {d.target} {val !== null ? `(current ${val})` : ''}</div>;
            })}
          </div>
        </div>
      </div>

      {/* Pools */}
      <div style={{ marginTop: 18, display: 'flex', gap: 20 }}>
        <div>
          <h4>Numbers pool</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {poolNumbers.map((n, idx) => (
              <div key={`pnum-${idx}`} draggable onDragStart={(e) => onDragStart(e, { type: 'number', value: n })} style={{ width: 44, height: 44, borderRadius: 8, border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab' }}>
                {n}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4>Operators pool</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {poolOperators.map((o, idx) => (
              <div key={`pop-${idx}`} draggable onDragStart={(e) => onDragStart(e, { type: 'operator', value: o })} style={{ width: 44, height: 44, borderRadius: 8, border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab' }}>
                {o}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <button onClick={submit} style={{ padding: '8px 14px', background: '#0b79d0', color: '#fff', border: 'none', borderRadius: 6 }}>Submit</button>
        <button onClick={() => { localStorage.removeItem(storageKey); fetchGame(); }} style={{ marginLeft: 12, padding: '8px 14px' }}>New Game</button>
      </div>
    </div>
  );
}
