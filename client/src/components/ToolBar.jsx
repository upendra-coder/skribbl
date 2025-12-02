import { useGame } from "../context/GameContext";

const ToolBar = ({ onColorChange, onClear }) => {
  const { isMyTurn, word } = useGame();

  // If it's NOT my turn, show the "Waiting" banner
  if (!isMyTurn) {
    return (
      <div className="alert alert-warning text-center fw-bold shadow-sm">
        ⏳ You are Guessing! Wait for the drawer...
      </div>
    );
  }

  // If it IS my turn, show the Drawing Tools
  return (
    <div className="d-flex justify-content-between align-items-center p-2 bg-dark rounded mb-2 text-white">
      <div className="d-flex align-items-center gap-3">
         <h5 className="m-0 text-info">Draw: <span className="text-white text-uppercase fw-bold">"{word}"</span></h5>
      </div>
      
      <div className="d-flex gap-2">
        {["#000", "#ff0000", "#0000ff", "#008000", "#ffff00", "#ffa500"].map((c) => (
           <button
             key={c}
             onClick={() => onColorChange(c)}
             style={{
               width: "30px", height: "30px", borderRadius: "50%", 
               backgroundColor: c, border: "2px solid white", cursor: "pointer"
             }}
           />
        ))}
        <button className="btn btn-outline-danger btn-sm fw-bold ms-3" onClick={onClear}>
            🗑 Clear
        </button>
      </div>
    </div>
  );
};

export default ToolBar;