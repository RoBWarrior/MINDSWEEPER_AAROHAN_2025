import React, { useState, useEffect } from "react";
import { Button, Card, CardContent, Typography, Grid, Box } from "@mui/material";
import axios from "axios";
import CryptoJS from 'crypto-js';

const Game1 = () => {
  const [gameData, setGameData] = useState(null);
  // Reserve 6 slots for numbers (operands) and 5 for operators
  const [selectedNumbers, setSelectedNumbers] = useState(Array(6).fill(null));
  const [selectedOperators, setSelectedOperators] = useState(Array(5).fill(null));
  const [activeSlot, setActiveSlot] = useState(null); // currently selected number slot index
  const [score, setScore] = useState(0);
  const [runningResult, setRunningResult] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currGameId, setCurrGameId] = useState('');

  // Fetch game data on mount (assumes API returns 12 numbers and a target)
  useEffect(() => {
    fetchGameData();
  }, []);

  // Fetch game data and mark each card as not used
  const fetchGameData = async () => {
    try {
      setLoading(true);
      // We assume length=6 returns 12 cards along with a target
      const response = await axios.get(`https://mindsweeper-api.onrender.com/api/generate-game?length=6`);
      const newGameData = {
        ...response.data,
        numbers: response.data.numbers.map((num) => ({
          value: num,
          used: false,
        })),
      };
      const gameId = newGameData.gameId;
      setGameData(newGameData);
      resetSelections();
      setMessage("");
      setCurrGameId(gameId);
      setLoading(false);
    } catch (err) {
      setError("Failed to load game data");
      setLoading(false);
    }
  };

  // Reset the number and operator selections and clear active slot
  const resetSelections = () => {
    setSelectedNumbers(Array(6).fill(null));
    setSelectedOperators(Array(5).fill(null));
    setActiveSlot(null);
    setRunningResult(null);
  };

  // Reset the game by marking all cards as unused and clearing selections.
  const resetGame = () => {
    if (gameData) {
      const resetNumbers = gameData.numbers.map((card) => ({
        ...card,
        used: false,
      }));
      setGameData({ ...gameData, numbers: resetNumbers });
    }
    resetSelections();
    setMessage("");
  };

  // When a number slot is clicked, mark it as active (if empty)
  const handleSlotClick = (index) => {
    if (selectedNumbers[index] === null) {
      setActiveSlot(index);
      setMessage("");
    }
  };

  // When a card is clicked, assign its number to the active slot and mark the card as used.
  const handleCardClick = (cardIndex) => {
    if (activeSlot === null) {
      setMessage("Please select an empty section first.");
      return;
    }
    if (gameData.numbers[cardIndex].used) return; // ignore if already used

    const cardValue = gameData.numbers[cardIndex].value;
    const newNumbers = gameData.numbers.map((card, i) =>
      i === cardIndex ? { ...card, used: true } : card
    );
    setGameData({ ...gameData, numbers: newNumbers });

    const newSelectedNumbers = [...selectedNumbers];
    newSelectedNumbers[activeSlot] = cardValue;
    setSelectedNumbers(newSelectedNumbers);
    setActiveSlot(null);
  };

  // When an operator button is clicked, add it to the next available operator slot.
  const handleOperatorClick = (op) => {
    const filledNumbersCount = selectedNumbers.filter((num) => num !== null).length;
    const filledOperatorsCount = selectedOperators.filter((operator) => operator !== null).length;
    if (filledNumbersCount === 0) {
      setMessage("Please select a number first.");
      return;
    }
    if (filledOperatorsCount >= filledNumbersCount) {
      setMessage("Select another number before adding an operator.");
      return;
    }
    const newOperators = [...selectedOperators];
    newOperators[filledOperatorsCount] = op;
    setSelectedOperators(newOperators);
    setMessage("");
  };

  // Helper function to compute the running result from the filled slots.
  const computeRunningResult = () => {
    if (selectedNumbers[0] === null) return null;
    let result = selectedNumbers[0];
    // Use operators only if both operator and next number are filled.
    for (let i = 0; i < selectedOperators.length; i++) {
      if (selectedOperators[i] !== null && selectedNumbers[i + 1] !== null) {
        const op = selectedOperators[i];
        const nextNum = selectedNumbers[i + 1];
        if (op === "+") result += nextNum;
        else if (op === "-") result -= nextNum;
        else if (op === "*") result *= nextNum;
        else if (op === "/" && nextNum !== 0) result = Math.floor(result / nextNum);
      } else {
        break;
      }
    }
    return result;
  };

  const addPoints = () => {
    const gameId = JSON.stringify(currGameId);
    const secretKey = 'Z8yd9sfG9h1r3f9$jb0vXp!92mbR6hFz';
    console.log(gameId);
  
    const encryptedGameId = CryptoJS.AES.encrypt(gameId, secretKey).toString();
  
    const email = localStorage.getItem('email');
  
    axios.post('https://mindsweeper-api.onrender.com/api/update-points', {
      encryptedGameId,
      email_id: email,  
      points: 15
    })
    .then(response => {
      console.log('Points updated successfully:', response.data);
    })
    .catch(err => {
      console.error("Error updating points:", err);
    });
  };

  // Update the running result whenever selections change.
  useEffect(() => {
    if (!gameData) return;
    const result = computeRunningResult();
    setRunningResult(result);
    const filledNumbersCount = selectedNumbers.filter((num) => num !== null).length;
    const filledOperatorsCount = selectedOperators.filter((op) => op !== null).length;
  
    // The winning condition:
    // - Moves (filled numbers) should be at least 3 and at most 6,
    // - The running result equals the target, and
    // - The difference (operands - operators) equals 1.
    if (
      filledNumbersCount >= 3 &&
      filledNumbersCount <= 6 &&
      result === gameData.target &&
      (filledNumbersCount - filledOperatorsCount === 1)
    ) {
      setMessage(`🎉 Correct in ${filledNumbersCount} moves! 15 points added.`);
      addPoints();
      setScore((prev) => prev + 100);
      setTimeout(() => {
        fetchGameData();
      }, 2000);
    }
    // If it’s the 6th move and either the result doesn't match or the slots difference isn't 1, reset
    else if (filledNumbersCount === 6 && (result !== gameData.target || (filledNumbersCount - filledOperatorsCount !== 1))) {
      setMessage("❌ Incorrect in 6 moves. Resetting game.");
      setTimeout(() => {
        resetGame();
      }, 2000);
    }
  }, [selectedNumbers, selectedOperators, gameData]);

  // Determine the moves count (number of filled number slots)
  const movesCount = selectedNumbers.filter((num) => num !== null).length;
  // Determine the color for the running result
  const runningResultColor =
    runningResult === gameData?.target
      ? "green"
      : runningResult !== null && Math.abs(runningResult - gameData.target) <= 10
      ? "orange"
      : "red";

  if (loading)
    return <Typography variant="h5">Loading game data...</Typography>;
  if (error)
    return (
      <Typography variant="h5" color="error">
        {error}
      </Typography>
    );

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Target: {gameData.target}
      </Typography>
      <Typography variant="h6" color="primary">
        Score: {score}
      </Typography>

      {/* Cards Grid – card values are always visible */}
      <Grid container spacing={2} justifyContent="center" style={{ marginTop: "20px" }}>
        {gameData.numbers.map((card, index) => (
          <Grid item key={index}>
            <Card
              onClick={() => handleCardClick(index)}
              sx={{
                width: 80,
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: card.used ? "#ccc" : "#1976d2",
                color: card.used ? "black" : "white",
                fontSize: 24,
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                cursor: card.used ? "default" : "pointer",
                border: "1px solid #ccc",
              }}
            >
              <CardContent>{card.value}</CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Expression Slots: 6 number slots with 5 operator gaps in between */}
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        {selectedNumbers.map((num, index) => (
          <React.Fragment key={index}>
            <Box
              onClick={() => handleSlotClick(index)}
              sx={{
                width: 60,
                height: 60,
                margin: "0 5px",
                border: activeSlot === index ? "2px solid blue" : "2px dashed gray",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: num === null ? "pointer" : "default",
              }}
            >
              <Typography variant="h5">{num !== null ? num : ""}</Typography>
            </Box>
            {index < selectedOperators.length && (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  margin: "0 5px",
                  border: "2px dashed gray",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h5">
                  {selectedOperators[index] !== null ? selectedOperators[index] : ""}
                </Typography>
              </Box>
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* Operator Buttons */}
      <Box mt={2}>
        {["+", "-", "*", "/"].map((op) => (
          <Button
            key={op}
            variant="contained"
            color="primary"
            onClick={() => handleOperatorClick(op)}
            sx={{ margin: "5px" }}
          >
            {op}
          </Button>
        ))}
      </Box>

      {/* Running result display */}
      <Typography
        variant="h6"
        style={{
          marginTop: "20px",
          color: runningResult !== null ? runningResultColor : "black",
        }}
      >
        Running Result: {runningResult !== null ? runningResult : "N/A"} (Moves: {movesCount})
      </Typography>

      {message && (
        <Typography
          variant="h6"
          style={{
            marginTop: "10px",
            color: message.includes("Correct") ? "green" : "red",
          }}
        >
          {message}
        </Typography>
      )}
    </div>
  );
};

export default Game1;




