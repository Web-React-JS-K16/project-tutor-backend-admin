const express = require("express");
const app = express();
const users = require("../controllers/user.controller");

app.get("/", users.findAll)
app.get("/info/:_id", users.getInforUser)

module.exports = app;
