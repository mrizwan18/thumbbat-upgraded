export const PLAYER_MOVE_SRC: Record<number, string> = {
  1: "/images/1u.png",
  2: "/images/2u.png",
  3: "/images/3u.png",
  4: "/images/4u.png",
  5: "/images/5u.png",
  6: "/images/6u.png",
};

export const OPP_MOVE_SRC: Record<number, string> = {
  1: "/images/1c.png",
  2: "/images/2c.png",
  3: "/images/3c.png",
  4: "/images/4c.png",
  5: "/images/5c.png",
  6: "/images/6c.png",
};

export const PLAYER_IDLE = "/images/start.png";
export const OPP_IDLE = "/images/start-r.png";

export const getPlayerMoveImage = (move: number): string =>
  PLAYER_MOVE_SRC[move] ?? "";

export const getOpponentMoveImage = (move: number): string =>
  OPP_MOVE_SRC[move] ?? "";