const gameService = require("../services/gameService");

const createSession = async (req, res) => {
    try {
        const { playerId } = req.body;
        const session = await gameService.createGameSession(playerId);
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const joinSession = async (req, res) => {
    try {
        const { sessionId, playerId } = req.body;
        const session = await gameService.joinGameSession(sessionId, playerId);
        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createSession,
    joinSession,
};
