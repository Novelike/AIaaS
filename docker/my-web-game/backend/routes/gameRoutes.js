const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

router.post("/create", gameController.createSession);
router.post("/join", gameController.joinSession);

module.exports = router;
