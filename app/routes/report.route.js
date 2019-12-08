const express = require("express");
const app = express();
const reports = require("../controllers/report.controller");

app.get('/', reports.findAll)

module.exports = app;
