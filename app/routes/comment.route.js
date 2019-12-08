const express = require("express");
const app = express();
const comments = require("../controllers/comment.controller");

app.get('/', comments.findAll)

module.exports = app;
