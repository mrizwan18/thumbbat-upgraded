import move1 from '../assets/images/1u.png';
import move2 from '../assets/images/2u.png';
import move3 from '../assets/images/3u.png';
import move4 from '../assets/images/4u.png';
import move5 from '../assets/images/5u.png';
import move6 from '../assets/images/6u.png';
import moveOp1 from '../assets/images/1c.png';
import moveOp2 from '../assets/images/2c.png';
import moveOp3 from '../assets/images/3c.png';
import moveOp4 from '../assets/images/4c.png';
import moveOp5 from '../assets/images/5c.png';
import moveOp6 from '../assets/images/6c.png';

export const getPlayerMoveImage = (move) => {
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

export const getOpponentMoveImage = (move) => {
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