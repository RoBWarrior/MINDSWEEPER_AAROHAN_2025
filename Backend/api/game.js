const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Game = require("../models/Game");

// Function to generate game data
const generateGameData = (chosenLength) => {
    let numbers = [];
    for (let i = 0; i < chosenLength * 2; i++) {
        numbers.push(Math.floor(Math.random() * 20) + 1);
    }

    let target = 0;
    let operators = ["+", "-", "*", "/"];
    let chosenNumbers = [];
    let operatorPool = [];
    let usedMultiplication = false;

    // Select the first number
    let j = Math.floor(Math.random() * numbers.length);
    let number = numbers[j];
    target += number;
    chosenNumbers.push(number);
    numbers.splice(j, 1);

    // Ensure at least two numbers are used
    chosenLength = Math.max(chosenLength, 2);

    for (let i = 1; i < chosenLength; i++) {
        if (numbers.length === 0) break;

        let j = Math.floor(Math.random() * numbers.length);
        let number = numbers[j];
        let operator = operators[Math.floor(Math.random() * 4)];

        if (usedMultiplication && operator === "*") {
            operator = "-";
        }

        // Check if applying the operation keeps target in bounds
        let newTarget = target;
        if (operator === "+") newTarget += number;
        else if (operator === "-") {
            // If subtraction results in a negative target, use addition instead
            if (newTarget - number < 0) {
                operator = "+";
                newTarget = newTarget + number; // Apply addition instead
            } else {
                newTarget -= number;
            }
        }
        else if (operator === "*") {
            newTarget *= number;
            usedMultiplication = true;
        }
        else if (operator === "/") newTarget = Math.floor(newTarget/number);
        else continue; // Skip invalid division cases

        target = newTarget;
        chosenNumbers.push(number);
        operatorPool.push(operator);
        numbers.splice(j, 1);
    }

    numbers.push(...chosenNumbers);
    numbers.sort();

    return { target, numbers, chosenNumbers, operatorPool };
};

// Route to generate and store game data
router.get("/generate-game", async (req, res) => {
    try {
        let chosenLength = parseInt(req.query.length) || 2;
        let gameData = generateGameData(chosenLength);

        // Generate a unique game ID
        const game = new Game({
            id: Math.floor(Math.random() * 1000000), // Generate a random game ID
            target: gameData.target,
            numbers: gameData.numbers,
            chosenNumbers: gameData.chosenNumbers,
            operatorPool: gameData.operatorPool
        });

        // Save to MongoDB
        const savedGame = await game.save();

        // Send response with the stored game details
        res.json({ gameId: savedGame.id, ...gameData });
    } catch (error) {
        console.error("Error generating game:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;