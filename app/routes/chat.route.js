const express = require("express");
const app = express();
const chats = require("../controllers/chat.controller");

app.post('/', chats.findAll)

module.exports = app;
