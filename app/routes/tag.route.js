const express = require("express");
const app = express();
const tags = require("../controllers/tag.controller");

app.get("/:limit/:offset", tags.findAll)
app.get("/:_id", tags.findOne)
app.post("/", tags.create)
app.put("/", tags.update)
app.delete("/", tags.delete)

module.exports = app;
