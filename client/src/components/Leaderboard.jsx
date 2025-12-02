const Leaderboard = ({ players, onRestart }) => {
  return (
    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
         style={{ background: "rgba(0,0,0,0.9)", zIndex: 50 }}>
      
      <div className="bg-white p-5 rounded text-center shadow-lg" style={{minWidth: "400px"}}>
        <h1 className="display-4 mb-4">🏆 Game Over!</h1>
        
        <div className="list-group mb-4">
          {players.map((player, index) => (
            <div key={index} className={`list-group-item d-flex justify-content-between align-items-center ${index === 0 ? "bg-warning" : ""}`}>
               <h4 className="m-0">
                   {index === 0 && "👑 "} 
                   #{index + 1} {player.username}
               </h4>
               <span className="badge bg-dark rounded-pill fs-5">{player.score} pts</span>
            </div>
          ))}
        </div>

        <button className="btn btn-primary btn-lg w-100 fw-bold" onClick={onRestart}>
            Play Again 🔄
        </button>
      </div>

    </div>
  );
};

export default Leaderboard;