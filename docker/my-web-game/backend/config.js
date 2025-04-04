require("dotenv").config();

module.exports = {
    port: process.env.PORT || 3000,
    mongoURI: process.env.MONGO_URI || "mongodb://210.109.83.44:27017/webgame",
};
