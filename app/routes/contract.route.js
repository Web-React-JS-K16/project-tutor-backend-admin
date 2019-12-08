const express = require("express");
const app = express();
const contracts = require("../controllers/contract.controller");

app.get('/', contracts.findAll)

module.exports = app;
