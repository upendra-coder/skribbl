import { createContext, useState, useEffect, useContext } from "react";
import socket from "../socket";

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [drawer, setDrawer] = useState(""); 
  const [word, setWord] = useState(""); 
  const [round, setRound] = useState(1);

  // Dynamic Check: "Am I the drawer?"
  const isMyTurn = socket.id === drawer;

  useEffect(() => {
    const onGameStarted = () => setIsGameStarted(true);

    const onNewRound = ({ drawerID, round }) => {
      console.log(`New Round: ${round}, Drawer: ${drawerID}`);
      setDrawer(drawerID);
      setRound(round); 
      setWord(""); 
      setIsGameStarted(true); // Force game ON
    };

    const onYourWord = (secretWord) => setWord(secretWord);

    // When joining a room, if server says "Game NOT running", we wipe local state.
    const onGameStateSync = (isRunning) => {
        setIsGameStarted(isRunning);
        if (!isRunning) {
            setRound(1);
            setDrawer("");
            setWord("");
        }
    };

    socket.on("game_started", onGameStarted);
    socket.on("new_round", onNewRound);
    socket.on("your_word", onYourWord);
    socket.on("game_state_sync", onGameStateSync); 

    return () => {
      socket.off("game_started", onGameStarted);
      socket.off("new_round", onNewRound);
      socket.off("your_word", onYourWord);
      socket.off("game_state_sync", onGameStateSync);
    };
  }, []);

  const startGame = (roomId) => {
    socket.emit("start_game", { roomId });
  };

  const value = {
    isGameStarted,
    drawer,
    word,
    round,
    isMyTurn,
    startGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};