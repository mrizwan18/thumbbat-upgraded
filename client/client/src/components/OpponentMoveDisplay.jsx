const OpponentMoveDisplay = ({ opponent, opponentMove }) => (
    <p className="text-xl mt-4">
      {opponent} chose: <span className="text-red-400">{opponentMove !== null ? opponentMove : "-"}</span>
    </p>
  );
  
  export default OpponentMoveDisplay;