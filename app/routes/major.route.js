const express = require("express");
const app = express();
const majors = require("../controllers/major.controller");

app.get("/", majors.findAll)
app.get("/:_id", majors.findOne)
app.post("/", majors.create)
app.put("/", majors.update)
app.delete("/", majors.delete)

module.exports = app;
