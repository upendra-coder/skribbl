const { getRandomWord } = require("./wordGenerator");

const games = {}; 

const getGame = (roomId) => games[roomId];

const startGame = (roomId) => {
    games[roomId] = {
        roomId,
        word: "",
        drawerID: null,
        isGameStarted: true,
        drawerIndex: 0,   
        round: 1,         
        timer: 60,        
        scores: {},
        drawHistory: [],
        guessedUsers: [] // Track who guessed correctly this round
    };
    return games[roomId];
};

const removeGame = (roomId) => {
    if (games[roomId]) {
        delete games[roomId];
    }
};

module.exports = {
    getGame,
    startGame,
    removeGame
};