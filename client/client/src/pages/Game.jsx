import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Scoreboard from "../components/Scoreboard";
import MoveSelection from "../components/MoveSelection";
import OpponentMoveDisplay from "../components/OpponentMoveDisplay";
import GameMoveImages from "../components/GameMoveImages";
import opStartImg from '../assets/images/start-r.png';
import plStartImg from '../assets/images/start.png';

const socket = io("https://thumbbat-upgraded.onrender.com/");

const Game = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // "bot" or "player"
  const [searching, setSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [matchFound, setMatchFound] = useState(false);
  const [opponent, setOpponent] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState({ user: 0, opponent: 0, firstInningScore: null });
  const [inning, setInning] = useState(null); // "batting" or "bowling"
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [opponentMove, setOpponentMove] = useState(null);
  const [playerMove, setPlayerMove] = useState(null);
  const [secondInningStarted, setSecondInningStarted] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // ✅ Game over popup
  const [showInningsOverlay, setShowInningsOverlay] = useState(false); // ✅ Innings transition popup
  const [showGameStartPopup, setShowGameStartPopup] = useState(false); // ✅ New: Game start popup
  const [playerMovesHistory, setPlayerMovesHistory] = useState([]);
  const [botMovesHistory, setBotMovesHistory] = useState([]);
  const [gameResults, setGameResults] = useState([]);

  const updateGameResults = (result) => {
    setGameResults((prevResults) => [...prevResults, result]);
  };

  const restartGame = () => {
    setMode(null);
    setSearching(false);
    setSearchTime(0);
    setMatchFound(false);
    setGameStarted(false);
    setScore({ user: 0, opponent: 0, firstInningScore: null });
    setInning(null);
    setIsGameOver(false);
    setWinner(null);
    setPlayerMove(null);
    setOpponentMove(null);
    setSecondInningStarted(false);
    setShowPopup(false); // ✅ Hide popup after restarting
    setShowInningsOverlay(false);
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }

    socket.on("matchFound", (data) => {
      setOpponent(data.opponent);
      setMatchFound(true);
      setSearching(false);
      setGameStarted(true);
      setMode("player");
      setInning(data.role);
      setShowGameStartPopup(true); // ✅ Show game start popup

      setTimeout(() => {
        setShowGameStartPopup(false); // ✅ Hide popup after 3 seconds
      }, 3000);
    });

    socket.on("noMatchFound", () => {
      alert("❌ No player found, try again!");
      setMode(null);
      setSearching(false);
    });

    socket.on("opponentMove", (move) => {
      setOpponentMove(move);
      handleGameLogic(playerMove, move);
    });

    return () => {
      socket.off("matchFound");
      socket.off("noMatchFound");
      socket.off("opponentMove");
    };
  }, [navigate, playerMove]);

  const startSearch = () => {
    setSearching(true);
    setSearchTime(0);
    setMatchFound(false);

    socket.emit("findMatch", { username: localStorage.getItem("username") });

    const interval = setInterval(() => {
      setSearchTime((prev) => prev + 1);
    }, 1000);

    setTimeout(() => {
      setSearching(false);
      clearInterval(interval);
    }, 20000);
  };

  // Example of a more sophisticated transition matrix considering move, inning, and score difference
  const transitionMatrix = {
    "batting": {
      "scoreDifferencePositive": {
        1: [0.1, 0.3, 0.2, 0.1, 0.2, 0.1],
        2: [0.2, 0.1, 0.3, 0.1, 0.2, 0.2],
        3: [0.3, 0.1, 0.2, 0.1, 0.2, 0.1],
        4: [0.2, 0.2, 0.1, 0.3, 0.1, 0.1],
        5: [0.2, 0.1, 0.3, 0.1, 0.2, 0.1],
        6: [0.1, 0.3, 0.2, 0.1, 0.2, 0.1],
      },
      "scoreDifferenceNegative": {
        1: [0.2, 0.1, 0.3, 0.2, 0.1, 0.1],
        2: [0.2, 0.3, 0.1, 0.1, 0.2, 0.2],
        3: [0.1, 0.2, 0.3, 0.1, 0.2, 0.2],
        4: [0.3, 0.2, 0.1, 0.2, 0.1, 0.1],
        5: [0.1, 0.3, 0.2, 0.2, 0.1, 0.2],
        6: [0.2, 0.1, 0.3, 0.2, 0.1, 0.1],
      },
    },
    "bowling": {
      "scoreDifferencePositive": {
        1: [0.2, 0.2, 0.2, 0.1, 0.1, 0.2],
        2: [0.2, 0.1, 0.3, 0.1, 0.2, 0.1],
        3: [0.2, 0.3, 0.1, 0.2, 0.1, 0.2],
        4: [0.1, 0.2, 0.3, 0.1, 0.1, 0.2],
        5: [0.3, 0.2, 0.1, 0.1, 0.2, 0.1],
        6: [0.1, 0.3, 0.2, 0.1, 0.1, 0.2],
      },
      "scoreDifferenceNegative": {
        1: [0.3, 0.1, 0.2, 0.2, 0.1, 0.1],
        2: [0.2, 0.3, 0.1, 0.1, 0.2, 0.1],
        3: [0.2, 0.1, 0.3, 0.2, 0.1, 0.1],
        4: [0.1, 0.2, 0.2, 0.3, 0.1, 0.1],
        5: [0.2, 0.1, 0.3, 0.1, 0.2, 0.1],
        6: [0.1, 0.2, 0.1, 0.3, 0.2, 0.1],
      },
    },
  };

  const getBotMove = (playerMove, inning, scoreDifference) => {
    const scoreDifferenceKey = scoreDifference > 0 ? "scoreDifferencePositive" : "scoreDifferenceNegative";

    const transition = transitionMatrix[inning][scoreDifferenceKey];

    const probabilities = transition[playerMove];

    const randomValue = Math.random();

    let cumulativeProbability = 0;
    for (let i = 0; i < probabilities.length; i++) {
      cumulativeProbability += probabilities[i];

      if (randomValue < cumulativeProbability) {
        return i + 1;
      }
    }

    return 1;
  };

  const startBotGame = () => {
    restartGame();
    setMode("bot");
    setGameStarted(true);
    setOpponent("Rizzwon (Bot)");
    const initialInning = Math.random() < 0.5 ? "batting" : "bowling";
    setInning(initialInning);
    setShowGameStartPopup(true); // ✅ Show game start popup

    setTimeout(() => {
      setShowGameStartPopup(false);
    }, 3000);
  };

  const playMove = (move) => {
    if (isGameOver) return; // ✅ Prevent moves after game ends

    setPlayerMove(move);
    setPlayerMovesHistory((prevHistory) => [...prevHistory, move]);

    if (mode === "bot") {
      const scoreDifference = score.user - score.opponent;

      const botMove = getBotMove(move, inning, scoreDifference);
      setOpponentMove(botMove);

      setBotMovesHistory((prevHistory) => [...prevHistory, botMove]);

      handleGameLogic(move, botMove);
    } else {
      socket.emit("playerMove", { username: localStorage.getItem("username"), move });
    }
  };

  const handleGameLogic = (userMove, opponentMove) => {
    if (!userMove || !opponentMove || isGameOver) return;

    if (inning === "batting") {
      // ✅ If moves are different, update batting player's score
      if (userMove !== opponentMove) {
        setScore((prev) => {
          const newScore = prev.user + userMove;

          // ✅ If second innings & score surpasses first innings, end game
          if (secondInningStarted && newScore > prev.firstInningScore) {
            declareWinner();
          }

          return { ...prev, user: newScore };
        });
      } else {
        // ✅ If moves are the same, end the innings
        setOpponentMove(null);
        setPlayerMove(null);
        if (!secondInningStarted) {
          // ✅ First innings over, store the score and switch innings
          setScore((prev) => ({ ...prev, firstInningScore: prev.user }));
          setShowInningsOverlay(true);

          setTimeout(() => {
            setInning("bowling"); // Switch innings
            setSecondInningStarted(true);
            setShowInningsOverlay(false);
          }, 3000);
        } else {
          // ✅ Second innings over, check scores and declare winner
          declareWinner();
        }
      }
    } else {
      // ✅ If moves are different, update opponent's score
      if (userMove !== opponentMove) {
        setScore((prev) => {
          const newOpponentScore = prev.opponent + opponentMove;

          // ✅ If second innings & score surpasses first innings, end game
          if (secondInningStarted && newOpponentScore > prev.firstInningScore) {
            declareWinner();
          }

          return { ...prev, opponent: newOpponentScore };
        });
      } else {
        // ✅ If moves are same, end the innings
        setOpponentMove(null);
        setPlayerMove(null);
        if (!secondInningStarted) {
          // ✅ If first innings ends when the user was bowling, start second innings correctly
          setScore((prev) => ({ ...prev, firstInningScore: prev.opponent }));
          setShowInningsOverlay(true);

          setTimeout(() => {
            setInning("batting"); // Switch innings
            setSecondInningStarted(true);
            setShowInningsOverlay(false);
          }, 3000);
        } else {
          // ✅ Second innings over, check scores and declare winner
          declareWinner();
        }
      }
    }
  };

  const updateTransitionMatrix = () => {
    for (let i = 0; i < playerMovesHistory.length; i++) {
      const playerMove = playerMovesHistory[i];
      const botMove = botMovesHistory[i];

      if (inning === "batting" && botMove !== playerMove) {
        transitionMatrix[inning]["scoreDifferencePositive"][playerMove][botMove] += 0.1;
      } else if (inning === "bowling" && playerMove !== botMove) {
        transitionMatrix[inning]["scoreDifferenceNegative"][playerMove][botMove] += 0.1;
      }
    }

    normalizeTransitionMatrix();
  };

  const normalizeTransitionMatrix = () => {
    Object.keys(transitionMatrix).forEach((inning) => {
      Object.keys(transitionMatrix[inning]).forEach((scoreDiff) => {
        Object.keys(transitionMatrix[inning][scoreDiff]).forEach((move) => {
          const total = transitionMatrix[inning][scoreDiff][move].reduce((acc, val) => acc + val, 0);
          transitionMatrix[inning][scoreDiff][move] = transitionMatrix[inning][scoreDiff][move].map((val) => val / total);
        });
      });
    });
  };
  const declareWinner = () => {
    console.log("winner")
    setIsGameOver(true);
    setShowPopup(true);

    if (score.user === score.opponent) {
      setWinner("🟡 It's a Draw!");
      updateGameResults('draw');
    } else {
      setWinner(score.user > score.opponent ? localStorage.getItem("username") : opponent);
      score.user > score.opponent ? updateGameResults('win') : updateGameResults('lose');
    }
    updateTransitionMatrix();

    socket.emit("gameOver", {
      username: localStorage.getItem("username"),
      score: score.user,
    });
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">

      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h2 className="text-4xl font-bold mb-6">🎮 Play the Game</h2>

        {!mode && !gameStarted && (
          <div className="flex gap-6 relative">
            <button
              className="bg-blue-500 px-6 py-3 rounded text-white text-lg font-semibold"
              onClick={startBotGame}
            >
              Play Against Rizzwon, the Bot 🤖
            </button>
            <div className="relative">
              <button
                className="bg-green-500 px-6 py-3 rounded text-white text-lg font-semibold opacity-50 cursor-not-allowed"
                disabled
              >
                Play Against Player 🏏
              </button>
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full transform translate-x-2 -translate-y-2">
                Coming Soon
              </span>
            </div>
          </div>
        )}

        {searching && (
          <div className="text-lg mt-4">
            Searching for a player... <span className="text-yellow-400">{searchTime}s</span>
          </div>
        )}

        {gameStarted && (
          <>
            <p className="text-xl mb-2">
              {localStorage.getItem("username")}, you are{" "}
              <span className="text-yellow-400">{inning}</span>
            </p>

            <Scoreboard userScore={score.user} opponentScore={score.opponent} opponentName={opponent} />
            <div className="flex justify-center gap-6 mb-4">
              <GameMoveImages move={playerMove} isPlayer={true} startImage={plStartImg} /> {/* Render player move */}
              <GameMoveImages move={opponentMove} isPlayer={false} startImage={opStartImg} /> {/* Render opponent move */}
            </div>
            <MoveSelection playerMove={playerMove} playMove={playMove} isDisabled={isGameOver} />
            <OpponentMoveDisplay opponent={opponent} opponentMove={opponentMove} />

          </>
        )}

        {/* ✅ Game Start Popup */}
        {showGameStartPopup && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm">
              <h3 className="text-2xl font-bold text-yellow-400">🏏 Cricket Gods Have Chosen You for <span className="text-green-400">{inning}</span></h3>
            </div>
          </div>
        )}
        {/* ✅ Innings Transition Overlay */}
        {showInningsOverlay && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm">
              <h3 className="text-2xl font-bold text-yellow-400">🏏 Innings Over!</h3>
              <p className="text-lg mt-2">First innings score: {score.firstInningScore}</p>
              <p className="text-lg">Now {opponent}'s time for {inning}. Target: {score.firstInningScore + 1}</p>
            </div>
          </div>
        )}

        {/* ✅ Game Over Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm">
              <h3 className="text-3xl font-bold text-yellow-400">{winner} Wins! 🏆</h3>
              <p className="text-lg mt-2">Final Score: {score.user} - {score.opponent}</p>

              {/* ✅ Exit & Restart Buttons */}
              <div className="mt-4 flex justify-center gap-4">
                <button
                  className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-white font-semibold"
                  onClick={() => navigate("/")}
                >
                  Exit
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white font-semibold"
                  onClick={startBotGame}
                >
                  Restart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;