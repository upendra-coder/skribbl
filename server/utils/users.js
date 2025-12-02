const users = [];
const storedPoints = {}; 
const userSlots = {};  

// Join user to chat
const userJoin = (id, username, room) => {
  if (!username || !room) return { id, username, room, score: 0 };

  // 1. ZOMBIE SOCKET CHECK (Exact same browser tab reconnecting)
  const existingSocket = users.find((u) => u.id === id);
  
  if (existingSocket) {
    existingSocket.username = username;
    existingSocket.room = room;
    return existingSocket;
  }

  // 2. NAME COLLISION CHECK (Different tab, same name)
  let finalUsername = username;
  let counter = 1;
  
  // Check if this specific name exists in this room
  while (users.some(u => u.room === room && u.username === finalUsername)) {
      finalUsername = `${username} (${counter})`;
      counter++;
  }

  // 3. RESTORE SCORE LOGIC 
  let previousScore = 0;
  if (storedPoints[room] && storedPoints[room][finalUsername]) {
      previousScore = storedPoints[room][finalUsername];
  }

  const user = { id, username: finalUsername, room, score: previousScore }; 

  // 4. RESTORE POSITION LOGIC
  if (userSlots[room] && userSlots[room][finalUsername] !== undefined) {
      const originalIndex = userSlots[room][finalUsername];
      
      if (originalIndex >= 0 && originalIndex <= users.length) {
          users.splice(originalIndex, 0, user); // Insert back at original spot
          delete userSlots[room][finalUsername]; 
          return user;
      }
  }

  users.push(user);
  return user;
};

const getCurrentUser = (id) => {
  return users.find((user) => user.id === id);
};

const userLeave = (id) => {
  const index = users.findIndex((user) => user.id === id);
  
  if (index !== -1) {
    const user = users[index];

    // Safety check
    if (user && user.room && user.username) {
        if (!userSlots[user.room]) {
            userSlots[user.room] = {};
        }
        userSlots[user.room][user.username] = index;
    }

    return users.splice(index, 1)[0];
  }
};

const getRoomUsers = (room) => {
  return users.filter((user) => user.room === room);
};

const addScore = (id, points) => {
    const user = users.find((u) => u.id === id);
    if (user && user.room && user.username) {
        user.score += points;
        
        if (!storedPoints[user.room]) storedPoints[user.room] = {};
        storedPoints[user.room][user.username] = user.score;
    }
    return user;
};

const resetRoomScores = (room) => {
    if (storedPoints[room]) delete storedPoints[room];
    if (userSlots[room]) delete userSlots[room];

    const roomUsers = users.filter((user) => user.room === room);
    roomUsers.forEach((user) => {
        user.score = 0;
    });
    return roomUsers;
};

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  addScore,
  resetRoomScores
};