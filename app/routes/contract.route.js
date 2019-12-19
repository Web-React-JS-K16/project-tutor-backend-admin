const express = require("express");
const app = express();
const contracts = require("../controllers/contract.controller");

app.get('/:limit/:offset', contracts.findAll)
app.get('/:_id', contracts.getDetail)

module.exports = app;
