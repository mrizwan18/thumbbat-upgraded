const Scoreboard = ({ userScore, opponentScore, opponentName }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex gap-10 text-xl font-semibold">
      <div>
        <span className="text-blue-400">User:</span> {userScore}
      </div>
      <div>
        <span className="text-red-400">{opponentName}:</span> {opponentScore}
      </div>
    </div>
  );
  
  export default Scoreboard;