const User = require("../models/user");
const GameSession = require("../models/gameSession");

const createGameSession = async (playerId) => {
    const session = new GameSession({ players: [playerId] });
    return await session.save();
};

const joinGameSession = async (sessionId, playerId) => {
    const session = await GameSession.findById(sessionId);
    if (!session) throw new Error("Session not found");
    session.players.push(playerId);
    return await session.save();
};

module.exports = {
    createGameSession,
    joinGameSession,
};
