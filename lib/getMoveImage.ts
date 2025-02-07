import move1 from "../public/images/1u.png";
import move2 from "../public/images/2u.png";
import move3 from "../public/images/3u.png";
import move4 from "../public/images/4u.png";
import move5 from "../public/images/5u.png";
import move6 from "../public/images/6u.png";
import moveOp1 from "../public/images/1c.png";
import moveOp2 from "../public/images/2c.png";
import moveOp3 from "../public/images/3c.png";
import moveOp4 from "../public/images/4c.png";
import moveOp5 from "../public/images/5c.png";
import moveOp6 from "../public/images/6c.png";

export const getPlayerMoveImage = (move: number) => {
  switch (move) {
    case 1:
      return move1;
    case 2:
      return move2;
    case 3:
      return move3;
    case 4:
      return move4;
    case 5:
      return move5;
    case 6:
      return move6;
    default:
      return "";
  }
};

export const getOpponentMoveImage = (move: number) => {
  switch (move) {
    case 1:
      return moveOp1;
    case 2:
      return moveOp2;
    case 3:
      return moveOp3;
    case 4:
      return moveOp4;
    case 5:
      return moveOp5;
    case 6:
      return moveOp6;
    default:
      return "";
  }
};
