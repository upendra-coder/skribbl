const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
// 1. Import Users Logic
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  addScore,
  resetRoomScores,
} = require("./utils/users");

// 2. Import Game Logic
const { startGame, getGame, removeGame } = require("./utils/game");

// 3. Import Word Generator
const { getWordOptions } = require("./utils/wordGenerator");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const roomTimers = {};   
const choiceTimers = {}; 
const disconnectTimers = {};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // --- REUSABLE CLEANUP FUNCTION ---
  const handlePlayerExit = (socketId) => {
      const user = userLeave(socketId);
      if (user) {
          socket.leave(user.room);
          io.to(user.room).emit("message", { userId: "admin", text: `${user.username} left` });
          io.to(user.room).emit("roomUsers", { room: user.room, users: getRoomUsers(user.room) });

          const remainingPlayers = getRoomUsers(user.room);
          
          if (remainingPlayers.length === 0) {
              console.log(`Room ${user.room} is empty. Cleaning up...`);
              if (roomTimers[user.room]) { clearInterval(roomTimers[user.room]); delete roomTimers[user.room]; }
              if (choiceTimers[user.room]) { clearTimeout(choiceTimers[user.room]); delete choiceTimers[user.room]; }
              if (disconnectTimers[user.room]) { clearTimeout(disconnectTimers[user.room]); delete disconnectTimers[user.room]; }
              removeGame(user.room);
              resetRoomScores(user.room);
          } else {
              const game = getGame(user.room);
              if (game && game.isGameStarted && game.drawerID === socketId) {
                  disconnectTimers[user.room] = setTimeout(() => {
                      io.to(user.room).emit("message", { userId: "admin", text: "Drawer left! Skipping round..." });
                      if (roomTimers[user.room]) clearInterval(roomTimers[user.room]);
                      io.to(user.room).emit("timer_update", 0);
                      delete disconnectTimers[user.room];
                  }, 5000); 
              }
          }
      }
  };

  socket.on("start_game", ({ roomId }) => {
    const existingGame = getGame(roomId);
    if (existingGame && existingGame.isGameStarted) return; 
    const game = startGame(roomId);
    startRound(roomId);
  });

  const startRound = (roomId) => {
      if (roomTimers[roomId]) clearInterval(roomTimers[roomId]);
      if (choiceTimers[roomId]) clearTimeout(choiceTimers[roomId]);
      if (disconnectTimers[roomId]) clearTimeout(disconnectTimers[roomId]);

      const players = getRoomUsers(roomId);
      const game = getGame(roomId);

      if(!game || players.length === 0) return;

      game.guessedUsers = []; 
      game.drawHistory = []; 
      io.to(roomId).emit("clear");

      const totalTurns = players.length * 3;
      
      if (game.round > totalTurns) {
          const leaderboard = players.sort((a, b) => b.score - a.score);
          io.to(roomId).emit("game_over", leaderboard);
          
          const resetUsers = resetRoomScores(roomId);
          io.to(roomId).emit("roomUsers", { room: roomId, users: resetUsers });

          if (roomTimers[roomId]) clearInterval(roomTimers[roomId]);
          game.isGameStarted = false;
          game.round = 1;
          game.drawerIndex = 0;
          return; 
      }

      if (game.drawerIndex >= players.length) {
          game.drawerIndex = 0;
      }
      const drawer = players[game.drawerIndex];
      game.drawerID = drawer.id;
      game.drawerUsername = drawer.username; 

      game.drawerIndex++;
      game.round++;

      game.word = ""; 
      game.timer = 60; 

      const options = getWordOptions();
      const displayRound = Math.ceil((game.round - 1) / players.length) || 1;

      io.to(roomId).emit("new_round", {
          drawerID: drawer.id,
          round: displayRound
      });

      io.to(drawer.id).emit("choose_word", options);

      choiceTimers[roomId] = setTimeout(() => {
          io.to(roomId).emit("message", { 
              userId: "admin", 
              text: `⚠️ ${drawer.username} took too long! Skipping turn...` 
          });
          startRound(roomId); 
      }, 10000); 
  };

  socket.on("select_word", ({ word, roomId }) => {
      const game = getGame(roomId);
      if(!game) return;

      if (choiceTimers[roomId]) {
          clearTimeout(choiceTimers[roomId]);
          delete choiceTimers[roomId];
      }

      game.word = word;
      io.to(game.drawerID).emit("your_word", word);
      io.to(roomId).emit("word_selected", word.length); 

      if (roomTimers[roomId]) clearInterval(roomTimers[roomId]);

      roomTimers[roomId] = setInterval(() => {
          const currentGame = getGame(roomId);
            if (!currentGame) {
                clearInterval(roomTimers[roomId]);
                return;
            }

            currentGame.timer--;
            io.to(roomId).emit("timer_update", currentGame.timer);

            if (currentGame.timer === 0) {
                clearInterval(roomTimers[roomId]);
                io.to(roomId).emit("message", { userId: "admin", text: `Time's up! The word was: ${currentGame.word}` });
                setTimeout(() => { startRound(roomId); }, 3000);
            }
      }, 1000);
  });

  socket.on("join_room", ({ username, room }) => {
    const usersBefore = getRoomUsers(room);
    usersBefore.forEach((u) => {
        if (!io.sockets.sockets.get(u.id)) userLeave(u.id);
    });

    const usersInRoom = getRoomUsers(room);
    if (usersInRoom.length === 0) {
        console.log(`✨ Room ${room} is empty. Cleaning up...`);
        if (roomTimers[room]) { clearInterval(roomTimers[room]); delete roomTimers[room]; }
        if (choiceTimers[room]) { clearTimeout(choiceTimers[room]); delete choiceTimers[room]; }
        if (disconnectTimers[room]) { clearTimeout(disconnectTimers[room]); delete disconnectTimers[room]; }
        removeGame(room); 
        resetRoomScores(room); 
    }

    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    socket.emit("message", { userId: "admin", text: `Welcome, ${user.username}!` });
    socket.broadcast.to(user.room).emit("message", { userId: "admin", text: `${user.username} has joined` });

    io.to(user.room).emit("roomUsers", { room: user.room, users: getRoomUsers(user.room) });

    const game = getGame(user.room);
    if (game && game.isGameStarted) {
        socket.emit("game_started"); 
        
        if (game.drawHistory && game.drawHistory.length > 0) {
            socket.emit("canvas_history", game.drawHistory);
        }

        if (game.drawerUsername === user.username) {
            console.log(`Drawer ${user.username} reconnected!`);
            if (disconnectTimers[user.room]) {
                clearTimeout(disconnectTimers[user.room]);
                delete disconnectTimers[user.room];
            }
            game.drawerID = user.id;
            io.to(user.room).emit("new_round", { drawerID: user.id, round: Math.ceil((game.round - 1) / getRoomUsers(user.room).length) || 1 });
            if (game.word) socket.emit("your_word", game.word); 
            else socket.emit("choose_word", getWordOptions());
        } else {
             io.to(user.room).emit("new_round", { drawerID: game.drawerID, round: Math.ceil((game.round - 1) / getRoomUsers(user.room).length) || 1 });
        }
        socket.emit("timer_update", game.timer);
    } else {
        socket.emit("game_state_sync", false); 
    }
  });

  socket.on("draw-line", ({ prevPoint, currentPoint, color, roomId }) => {
    if (roomId) {
        const game = getGame(roomId);
        if (game) {
            if (!game.drawHistory) game.drawHistory = []; 
            game.drawHistory.push({ prevPoint, currentPoint, color });
        }
        socket.broadcast.to(roomId).emit("draw-line", { prevPoint, currentPoint, color });
    }
  });

  socket.on("clear", (roomId) => {
    if (roomId) {
        const game = getGame(roomId);
        if (game) game.drawHistory = []; 
        socket.broadcast.to(roomId).emit("clear");
    }
  });

  // --- SCORING & EARLY END LOGIC ---
  socket.on("send_message", (data) => {
    const game = getGame(data.room);
    if (game && game.isGameStarted && data.message.toLowerCase() === game.word.toLowerCase()) {
        if (socket.id === game.drawerID) return; 
        if (game.guessedUsers.includes(data.author)) return;
        
        game.guessedUsers.push(data.author);
        const points = Math.ceil((game.timer / 60) * 100);
        addScore(socket.id, points);
        
        io.to(data.room).emit("message", { userId: "admin", text: `🎉 ${data.author} guessed it! (+${points} pts)` });
        io.to(data.room).emit("roomUsers", { room: data.room, users: getRoomUsers(data.room) });

        // --- ADDED: CHECK IF EVERYONE GUESSED ---
        const players = getRoomUsers(data.room);
        const totalGuessers = players.length - 1; // Everyone except drawer

        // If everyone guessed correctly, end round early
        if (game.guessedUsers.length >= totalGuessers) {
            io.to(data.room).emit("message", { userId: "admin", text: "🎯 Everyone guessed it! Next round starting..." });
            
            // Kill current timer
            if (roomTimers[data.room]) clearInterval(roomTimers[data.room]);

            // Wait 3s and force next round
            setTimeout(() => {
                startRound(data.room);
            }, 3000);
        }
        // ----------------------------------------

        return; 
    }
    io.to(data.room).emit("receive_message", data);
  });

  socket.on("leave_room", () => {
      handlePlayerExit(socket.id);
  });

  socket.on("disconnect", () => {
    handlePlayerExit(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});