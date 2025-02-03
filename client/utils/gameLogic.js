export const startGame = (dispatch, opponent, inning) => {
    dispatch({ type: "START_GAME", payload: { opponent, inning: inning || (Math.random() < 0.5 ? "batting" : "bowling") } });
  };
  
  export const playMove = (dispatch, move, state, socket) => {
    if (state.isGameOver) return;
    dispatch({ type: "SET_MOVE", payload: move });
  
    if (state.mode === "bot") {
      const botMove = Math.floor(Math.random() * 6) + 1;
      dispatch({ type: "SET_OPPONENT_MOVE", payload: botMove });
      handleGameLogic(dispatch, state, botMove);
    } else {
      socket.emit("playerMove", { username: localStorage.getItem("username"), move });
    }
  };
  
  export const handleGameLogic = (dispatch, state, opponentMove) => {
    const { playerMove, inning, secondInningStarted, score } = state;
  
    if (inning === "batting") {
      if (playerMove !== opponentMove) {
        dispatch({ type: "UPDATE_SCORE", payload: { user: score.user + playerMove } });
  
        if (secondInningStarted && score.user + playerMove > score.firstInningScore) {
          dispatch({ type: "SET_WINNER", payload: localStorage.getItem("username") });
        }
      } else {
        if (!secondInningStarted) {
          dispatch({ type: "UPDATE_SCORE", payload: { firstInningScore: score.user } });
          dispatch({ type: "SET_INNING", payload: "bowling" });
        } else {
          dispatch({ type: "SET_WINNER", payload: score.user > score.opponent ? localStorage.getItem("username") : state.opponent });
        }
      }
    } else {
      if (playerMove !== opponentMove) {
        dispatch({ type: "UPDATE_SCORE", payload: { opponent: score.opponent + opponentMove } });
  
        if (secondInningStarted && score.opponent + opponentMove > score.firstInningScore) {
          dispatch({ type: "SET_WINNER", payload: state.opponent });
        }
      } else {
        if (!secondInningStarted) {
          dispatch({ type: "UPDATE_SCORE", payload: { firstInningScore: score.opponent } });
          dispatch({ type: "SET_INNING", payload: "batting" });
        } else {
          dispatch({ type: "SET_WINNER", payload: score.user > score.opponent ? localStorage.getItem("username") : state.opponent });
        }
      }
    }
  };
  
  export const restartGame = (dispatch) => {
    dispatch({ type: "RESET_GAME" });
  };