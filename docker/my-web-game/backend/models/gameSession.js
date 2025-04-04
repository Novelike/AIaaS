const mongoose = require("mongoose");

const gameSessionSchema = new mongoose.Schema({
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
        type: String,
        enum: ["waiting", "active", "ended"],
        default: "waiting",
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GameSession", gameSessionSchema);
