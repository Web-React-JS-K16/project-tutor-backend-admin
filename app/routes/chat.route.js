const express = require("express");
const app = express();
const chats = require("../controllers/chat.controller");

app.get('/', chats.findAll)

module.exports = app;
