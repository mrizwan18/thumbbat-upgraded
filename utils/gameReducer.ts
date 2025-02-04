export interface GameState {
  mode: "bot" | "player" | null;
  searching: boolean;
  searchTime: number;
  matchFound: boolean;
  opponent: string | null;
  gameStarted: boolean;
  score: {
    user: number;
    opponent: number;
    firstInningScore: number | null;
  };
  inning: "batting" | "bowling" | null;
  isGameOver: boolean;
  winner: string | null;
  opponentMove: number | null;
  playerMove: number | null;
  secondInningStarted: boolean;
  showPopup: boolean;
  showInningsOverlay: boolean;
  showGameStartPopup: boolean;
}

export type GameAction =
  | {
      type: "START_GAME";
      payload: { opponent: string; inning: "batting" | "bowling" };
    }
  | { type: "SET_MOVE"; payload: number }
  | { type: "SET_OPPONENT_MOVE"; payload: number }
  | { type: "UPDATE_SCORE"; payload: Partial<GameState["score"]> }
  | { type: "SET_WINNER"; payload: string }
  | { type: "SET_INNING"; payload: 'batting' | 'bowling' }
  | { type: "RESET_GAME" };

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

export const gameReducer = (state: GameState, action: GameAction) => {
  switch (action.type) {
    case "START_GAME":
      return {
        ...state,
        gameStarted: true,
        opponent: action.payload.opponent,
        inning: action.payload.inning,
      };
    case "SET_MOVE":
      return { ...state, playerMove: action.payload };
    case "SET_OPPONENT_MOVE":
      return { ...state, opponentMove: action.payload };
    case "UPDATE_SCORE":
      return { ...state, score: { ...state.score, ...action.payload } };
    case "SET_WINNER":
      return {
        ...state,
        isGameOver: true,
        showPopup: true,
        winner: action.payload,
      };
    case "SET_INNING":
      return { ...state, inning: action.payload };
    case "RESET_GAME":
      return initialState;
    default:
      return state;
  }
};
