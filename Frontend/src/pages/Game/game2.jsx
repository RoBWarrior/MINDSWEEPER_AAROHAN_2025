import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import axios from 'axios';

// Utility function to reshuffle an array using Fisher-Yates.
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const Game2 = () => {
  const { length } = useParams();
  const gameLength = parseInt(length) || 2;
  
  const localStorageKey = `game2Data_${gameLength}`;

  const [target, setTarget] = useState(null);
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [availableOperators, setAvailableOperators] = useState([]);
  const [placedNodes, setPlacedNodes] = useState([]);
  const [placedEdges, setPlacedEdges] = useState([]);
  // Keep the original pools for resets.
  const [initialNumbers, setInitialNumbers] = useState([]);
  const [initialOperators, setInitialOperators] = useState([]);
  const [message, setMessage] = useState('');
  const [currGameId,setCurrGameId] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const loadNewGame = () => {
    fetch(`https://mindsweeper-api.onrender.com/api/generate-game?length=${gameLength}`)
      .then(response => response.json())
      .then(data => {
        // API returns: { target, chosenNumbers, operatorPool }
  
        // Shuffle the arrays
        const initialNumbers = data.chosenNumbers;
        const initialOperators = data.operatorPool;
        const gameId = data.gameId;
        let Numbers = initialNumbers;
        let Operators = initialOperators;
  
        // Select placed nodes and edges
        const placedNodes = Array(Numbers.length).fill(null);
        const placedEdges = Array(Operators.length).fill(null);
  
        if(Numbers.length > 3){
          // Set values at specific indices
          placedNodes[1] = Numbers[1];
          placedNodes[3] = Numbers[3];
          placedEdges[2] = Operators[2];
        

        if(Numbers.length > 5){
          placedNodes[6] = Numbers[6];
          placedEdges[4] = Operators[4];
        }
  
        // Remove the placed nodes and edges from the arrays
        Numbers = Numbers.filter((_, index) => index !== 1 && index !== 3 && index !== 6);
        Operators = Operators.filter((_, index) => index !== 2 && index !== 4);
        }
  
        // Update the state with the newly modified values
        setTarget(data.target);
        setAvailableNumbers(shuffleArray(Numbers)); // Updated list of numbers
        setAvailableOperators(shuffleArray(Operators)); // Updated list of operators
        setInitialNumbers(shuffleArray(Numbers));
        setInitialOperators(shuffleArray(Operators));
        setPlacedNodes(placedNodes);
        setPlacedEdges(placedEdges);
        setCurrGameId(gameId);
  
        // Save to localStorage for persistence.
        localStorage.setItem(localStorageKey, JSON.stringify({
          target: data.target,
          initialNumbers: initialNumbers,
          initialOperators: initialOperators,
          gameId: gameId
        }));
  
        setMessage('');
      })
      .catch(err => console.error("Error fetching new game data:", err));
  };
  

  useEffect(() => {
    
    const savedData = localStorage.getItem(localStorageKey);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      let Numbers = parsed.initialNumbers;
      let Operators = parsed.initialOperators;

      // Select placed nodes and edges
      const placedNodes = Array(Numbers.length).fill(null);
      const placedEdges = Array(Operators.length).fill(null);

      if(Numbers.length > 3){
        // Set values at specific indices
        placedNodes[1] = Numbers[1];
        placedNodes[3] = Numbers[3];
        placedEdges[2] = Operators[2];
      

      if(Numbers.length > 5){
        placedNodes[6] = Numbers[6];
        placedEdges[4] = Operators[4];
      }

      // Remove the placed nodes and edges from the arrays
      Numbers = Numbers.filter((_, index) => index !== 1 && index !== 3 && index !== 6);
      Operators = Operators.filter((_, index) => index !== 2 && index !== 4);
      }

      // Update the state with the newly modified values
      setTarget(parsed.target);
      setAvailableNumbers(shuffleArray(Numbers)); // Updated list of numbers
      setAvailableOperators(shuffleArray(Operators)); // Updated list of operators
      setInitialNumbers(shuffleArray(Numbers));
      setInitialOperators(shuffleArray(Operators));
      setPlacedNodes(placedNodes);
      setPlacedEdges(placedEdges);
      setCurrGameId(parsed.gameId)
    } else {
      // Otherwise, fetch new game data.
      loadNewGame();
    }
  }, [gameLength, localStorageKey]);

  // Drag start: store item and type.
  const onDragStart = (e, item, type) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ item, type }));
  };

  // Allow dropping.
  const allowDrop = (e) => {
    e.preventDefault();
  };

  // Drop handler for number nodes.
  const onDropNode = (e, index) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (data.type !== "number" || placedNodes[index] !== null) return;
    const newNodes = [...placedNodes];
    newNodes[index] = data.item;
    setPlacedNodes(newNodes);
    // Remove only one occurrence.
    setAvailableNumbers(prev => {
      const i = prev.indexOf(data.item);
      return i === -1 ? prev : [...prev.slice(0, i), ...prev.slice(i + 1)];
    });
    checkBoardComplete(newNodes, placedEdges);
  };

  const placeNumber = (number) => {
    console.log(number);
    if(selectedType != 'node'){
      return;
    }
    const newNodes = [...placedNodes];
    newNodes[selectedIndex] = number;
    setPlacedNodes(newNodes);
    // Remove only one occurrence.
    setAvailableNumbers(prev => {
      const i = prev.indexOf(number);
      return i === -1 ? prev : [...prev.slice(0, i), ...prev.slice(i + 1)];
    });
    checkBoardComplete(newNodes, placedEdges);
  }

  const placeOperator = (operator) => {
    console.log(operator);
    if(selectedType != 'edge'){
      return;
    }
    const newEdges = [...placedEdges];
    newEdges[selectedIndex] = operator;
    setPlacedEdges(newEdges);
    // Remove only one occurrence.
    setAvailableOperators(prev => {
      const i = prev.indexOf(operator);
      return i === -1 ? prev : [...prev.slice(0, i), ...prev.slice(i + 1)];
    });
    checkBoardComplete(placedNodes, newEdges);
  }
  // Drop handler for operator edges.
  const onDropEdge = (e, index) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (data.type !== "operator" || placedEdges[index] !== null) return;
    const newEdges = [...placedEdges];
    newEdges[index] = data.item;
    setPlacedEdges(newEdges);
    // Remove only one occurrence.
    setAvailableOperators(prev => {
      const i = prev.indexOf(data.item);
      return i === -1 ? prev : [...prev.slice(0, i), ...prev.slice(i + 1)];
    });
    checkBoardComplete(placedNodes, newEdges);
  };

  // Compute the sequential result (left-to-right evaluation).
  const computeResult = (nodes, edges) => {
    if (nodes[0] === null) return null;
    let result = parseInt(nodes[0]);
    for (let i = 0; i < edges.length; i++) {
      if (edges[i] === null || nodes[i + 1] === null) break;
      const nextVal = parseInt(nodes[i + 1]);
      const op = edges[i];
      if (op === '+') result += nextVal;
      else if (op === '-') result -= nextVal;
      else if (op === '*') result *= nextVal;
      else if (op === '/') result = Math.floor(result / nextVal);
    }
    return result;
  };

  const addPoints = () => {
    const gameId = JSON.stringify(currGameId);
    const secretKey = 'Z8yd9sfG9h1r3f9$jb0vXp!92mbR6hFz';
    console.log(gameId)
  
    const encryptedGameId = CryptoJS.AES.encrypt(gameId, secretKey).toString();
  
    const email = localStorage.getItem('email');
  
    axios.post('https://mindsweeper-api.onrender.com/api/update-points', {
      encryptedGameId,
      email_id: email,  
      points: gameLength === 3 ? 2 : gameLength === 5 ? 5 : gameLength === 7 ? 10 : 0
    })
    .then(response => {
      console.log('Points updated successfully:', response.data);
    })
    .catch(err => {
      console.error("Error updating points:", err);
    });
  };

  const checkBoardComplete = (nodes, edges) => {
    if (nodes.every(val => val !== null) && edges.every(val => val !== null)) {
      const finalResult = computeResult(nodes, edges);
      if (finalResult === target) {
        setMessage("Congratulations! Correct result achieved. Loading new game...");
        addPoints()
        setTimeout(() => {
          loadNewGame();
        }, 2000);
      } else {
        setMessage("Incorrect result. Resetting game...");
        setTimeout(() => {
          resetBoard();
        }, 2000);
      }
    }
  };

  // Reset the board (while keeping the same target and pool).
  const resetBoard = () => {
    setPlacedNodes(Array(initialNumbers.length).fill(null));
    setPlacedEdges(Array(initialOperators.length).fill(null));
    setAvailableNumbers([...initialNumbers]);
    setAvailableOperators([...initialOperators]);
    setMessage('');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Target: {target !== null ? target : 'Loading...'}</h2>
      {message && <h3>{message}</h3>}

      {/* Game Board */}
      <div style={{ margin: '20px 0' }}>
  <h3>Game Board</h3>
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '5px',
      maxWidth: '100%',
    }}
  >
    {placedNodes.map((node, index) => (
      <React.Fragment key={`node-${index}`}>
        {/* Node as a perfect circle */}
        <div
          onDrop={(e) => onDropNode(e, index)}
          onDragOver={allowDrop}
          onClick={() => {
            setSelectedIndex(index);
            setSelectedType('node');
          }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: selectedIndex === index && selectedType === 'node' ? '3px solid red' : '2px solid #333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '5px',
            backgroundColor: '#fff',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
            cursor: 'pointer',
          }}
        >
          {node !== null ? node : ''}
        </div>
        {/* Edge as a squared diamond */}
        {index < placedEdges.length && (
          <div
            onDrop={(e) => onDropEdge(e, index)}
            onDragOver={allowDrop}
            onClick={() => {
              setSelectedIndex(index);
              setSelectedType('edge');
            }}
            style={{
              width: '50px',
              height: '50px',
              border: selectedIndex === index && selectedType === 'edge' ? '3px solid red' : '2px solid #333',
              backgroundColor: '#f0f8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '5px',
              transform: 'rotate(45deg)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                transform: 'rotate(-45deg)',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#007bff',
              }}
            >
              {placedEdges[index] ? placedEdges[index] : ''}
            </div>
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
</div>

      {/* Available Numbers */}
      <div style={{ margin: '20px 0' }}>
        <h3>Available Numbers</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center',alignItems: 'center' }}>
          {availableNumbers.map((num, idx) => (
            <div
              key={`num-${idx}`}
              onClick={(e)=>placeNumber(num)}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                border: '1px solid gray',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '5px',
                backgroundColor: '#fff',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Available Operators */}
      <div style={{ margin: '20px 0' }}>
        <h3>Available Operators</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap' ,justifyContent: 'center',alignItems: 'center'}}>
          {availableOperators.map((op, idx) => (
            <div
              key={`op-${idx}`}
              onClick={(e)=> placeOperator(op)}
              style={{
                width: '50px',
                height: '50px',
                border: '1px solid gray',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '5px',
                backgroundColor: '#fff',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#007bff',
              }}
            >
              {op}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game2;