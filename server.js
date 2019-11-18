const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const logger = require('morgan');
const dbConfig = require("./config/database.config");
const adminRouter = require("./app/routes/admin.route");

const cors = require("cors");

//create express app
const app = express();
app.use(cors());

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(logger('dev'));

app.use(adminRouter);

//connecting to the database
mongoose.Promise = global.Promise;
mongoose
    .connect(dbConfig.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => {
        console.log("Successfully connected to the database");
    })
    .catch(err => {
        console.log("Could not connected to the database. Exiting now...", err);
        process.exit();
    });

app.get('/', (req, res) => {
    res.json({ message: 'Simple app' });
});

app.get("/admin", adminRouter);

app.listen(parseInt(process.env.PORT) || 5000, () => {
    console.log('Server is listening port 5000');
});
module.exports = app;
