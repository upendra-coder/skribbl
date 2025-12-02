import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import socket from "../socket";
import Canvas from "../components/Canvas";
import ToolBar from "../components/ToolBar";
import Chat from "../components/Chat";
import { useGame } from "../context/GameContext";
import WordChooser from "../components/WordChooser";
import Leaderboard from "../components/Leaderboard"; 
import "../App.css";

const Room = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [color, setColor] = useState("#000");
  const [clearTrigger, setClearTrigger] = useState(0);
  const [timer, setTimer] = useState(60);
  const [wordOptions, setWordOptions] = useState([]); 
  const [isChoosing, setIsChoosing] = useState(false);

  // New State for Game Over
  const [gameOverData, setGameOverData] = useState(null); 
  const { startGame, isGameStarted, isMyTurn, drawer, round } = useGame();
  const user = location.state;

  useEffect(() => {
    if (!user) {
      alert("Please login first!");
      navigate("/");
      return;
    }

    socket.emit("join_room", { username: user.username, room: roomId });

    socket.on("roomUsers", (data) => {
      setUsers(data.users);
    });

    socket.on("timer_update", (time) => {
      setTimer(time);
    });

    socket.on("choose_word", (options) => {
        setWordOptions(options);
        setIsChoosing(true);
    });

    socket.on("word_selected", (length) => {
        setIsChoosing(false);
        setWordOptions([]); 
    });

    //Force close popup if round changes (e.g. timeout skip) ---
    socket.on("new_round", () => {
        setIsChoosing(false);
        setWordOptions([]);
    });

    // GAME OVER LISTENER
    socket.on("game_over", (leaderboard) => {
        setGameOverData(leaderboard);
        setIsChoosing(false);
    });

    return () => {
      socket.off("roomUsers");
      socket.off("timer_update");
      socket.off("choose_word");
      socket.off("word_selected");
      socket.off("game_over");
    };
  }, [roomId, user, navigate]);

  const handleClear = () => {
    socket.emit("clear", roomId);
    setClearTrigger((prev) => prev + 1);
  };

  const handleWordSelect = (word) => {
    socket.emit("select_word", { word, roomId });
    setIsChoosing(false);
  };

  const handleRestart = () => {
    setGameOverData(null); 
    startGame(roomId);
  };

  return (
    <div className="room-wrapper">
      {/* LEFT SIDEBAR */}
      <div className="left-sidebar">
        <div className="sidebar-header">
          <h2 className="app-title">🎨 Skribbl</h2>
          <div className="room-code">
            Code: <span className="code-pill">{roomId}</span>
          </div>
        </div>

        {!isGameStarted && (
          <button
            className="btn btn-success w-100 mb-3 fw-bold shadow-sm"
            onClick={() => startGame(roomId)}
          >
            Start Game 🎮
          </button>
        )}

        <h5 className="players-title">Players</h5>

        <div className="text-center mb-3">
          <h1 className="fw-bold text-warning">{timer}s</h1>
          <small>Round {round} / 3</small>
        </div>

        <ul className="player-list">
          {users.map((usr, index) => (
            <li
              key={index}
              className={`player-item ${usr.id === socket.id ? "me" : ""}`}
            >
              <div className="d-flex justify-content-between w-100">
                <span>
                  {usr.username}
                  {usr.id === socket.id && <span className="you-badge"> (You)</span>}
                  {usr.id === drawer && <span className="ms-2">✏️</span>}
                </span>
                <span className="fw-bold text-warning">{usr.score} pts</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* CENTER BOARD */}
      <div className="center-board position-relative">
        
        {/* 1. LEADERBOARD OVERLAY (Highest Priority) */}
        {gameOverData && (
            <Leaderboard players={gameOverData} onRestart={handleRestart} />
        )}

        {/* 2. WORD CHOOSER POPUP */}
        {!gameOverData && isChoosing && (
            <WordChooser options={wordOptions} onSelect={handleWordSelect} />
        )}

        {/* 3. WAITING TEXT */}
        {isGameStarted && !isChoosing && !isMyTurn && timer === 60 && !gameOverData && (
            <div className="alert alert-info text-center m-2">
                Drawer is choosing a word...
            </div>
        )}

        {/* 4. TOOLBAR */}
        {isGameStarted && !gameOverData && (
          <ToolBar onColorChange={setColor} onClear={handleClear} />
        )}

        {/* 5. CANVAS */}
        <div className="board-frame">
          <Canvas
            roomId={roomId}
            isMyTurn={isMyTurn}
            color={color}
            clearTrigger={clearTrigger}
          />
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="right-sidebar">
        <Chat roomId={roomId} username={user?.username} />
      </div>
    </div>
  );
};

export default Room;