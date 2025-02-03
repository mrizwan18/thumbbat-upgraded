const MoveSelection = ({ playerMove, playMove }) => (
    <div className="mt-6 flex gap-4">
      {[1, 2, 3, 4, 5, 6].map((num) => (
        <button
          key={num}
          className={`px-6 py-3 rounded-md text-lg ${
            playerMove === num ? "bg-yellow-500" : "bg-purple-500 hover:bg-purple-600"
          } text-white`}
          onClick={() => playMove(num)}
        >
          {num}
        </button>
      ))}
    </div>
  );
  
  export default MoveSelection;