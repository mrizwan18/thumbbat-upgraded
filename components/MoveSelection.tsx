const MoveSelection = ({
  playerMove,
  playMove,
  isDisabled,
}: {
  playerMove: number;
  playMove: (num: number) => void;
  isDisabled: boolean;
}) => (
  <div className="mt-6 flex gap-4">
    {[1, 2, 3, 4, 5, 6].map((num) => (
      <button
        key={num}
        className={`px-6 py-3 rounded-md text-lg ${
          playerMove === num
            ? "bg-yellow-500"
            : "bg-purple-500 hover:bg-purple-600"
        } text-white`}
        onClick={() => playMove(num)}
        disabled={isDisabled}
      >
        {num}
      </button>
    ))}
  </div>
);

export default MoveSelection;
