require("dotenv").config();

module.exports = {
    port: process.env.PORT || 3000,
    mongoURI: process.env.MONGO_URI || "mongodb://mongo-service:27017/webgame",
};
