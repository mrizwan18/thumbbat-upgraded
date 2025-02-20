import React, { useState, useEffect } from 'react';

const OpponentMoveDisplay = ({
  opponent,
  opponentMove,
  isAnimating,
}: {
  opponent: string;
  opponentMove: number;
  isAnimating: boolean;
}) => {
  // Keep track of the last non-zero move
  const [lastMove, setLastMove] = useState<number>(0);

  useEffect(() => {
    if (opponentMove > 0) {
      setLastMove(opponentMove);
    }
  }, [opponentMove]);

  return (
    <p className="text-xl mt-4">
      {opponent} chose:{" "}
      <span className="text-red-400">
        {!isAnimating ? (lastMove || "-") : "-"}
      </span>
    </p>
  );
};

export default OpponentMoveDisplay;
