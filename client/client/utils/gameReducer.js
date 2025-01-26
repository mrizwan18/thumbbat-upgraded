export const initialState = {
    mode: null,
    searching: false,
    searchTime: 0,
    matchFound: false,
    opponent: null,
    gameStarted: false,
    score: { user: 0, opponent: 0, firstInningScore: null },
    inning: null,
    isGameOver: false,
    winner: null,
    opponentMove: null,
    playerMove: null,
    secondInningStarted: false,
    showPopup: false,
    showInningsOverlay: false,
    showGameStartPopup: false,
  };
  
  export const gameReducer = (state, action) => {
    switch (action.type) {
      case "START_GAME":
        return { ...state, gameStarted: true, opponent: action.payload.opponent, inning: action.payload.inning };
      case "SET_MOVE":
        return { ...state, playerMove: action.payload };
      case "SET_OPPONENT_MOVE":
        return { ...state, opponentMove: action.payload };
      case "UPDATE_SCORE":
        return { ...state, score: { ...state.score, ...action.payload } };
      case "SET_WINNER":
        return { ...state, isGameOver: true, showPopup: true, winner: action.payload };
      case "RESET_GAME":
        return initialState;
      default:
        return state;
    }
  };