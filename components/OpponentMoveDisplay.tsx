const OpponentMoveDisplay = ({
  opponent,
  opponentMove,
  isAnimating,
}: {
  opponent: string;
  opponentMove: number;
  isAnimating: boolean;
}) => (
  <p className="text-xl mt-4">
    {opponent} chose:{" "}
    <span className="text-red-400">
      {!isAnimating && opponentMove !== null ? opponentMove : "-"}
    </span>
  </p>
);

export default OpponentMoveDisplay;
