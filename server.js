const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const logger = require('morgan');
const dbConfig = require('./config/database.config');
const adminRouter = require('./app/routes/admin.route');
const chatRouter = require('./app/routes/chat.route');
const commentRouter = require('./app/routes/comment.route');
const contractRouter = require('./app/routes/contract.route');
const majorRouter = require('./app/routes/major.route');
const reportRouter = require('./app/routes/report.route');
const studentRouter = require('./app/routes/student.route');
const tagRouter = require('./app/routes/tag.route');
const teacherRouter = require('./app/routes/teacher.route');
const userRouter = require('./app/routes/user.route');

const cors = require('cors');

//create express app
const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(logger('dev'));

app.use('/admin', adminRouter);
app.use('/admin/chat', chatRouter);
app.use('/admin/comment', commentRouter);
app.use('/admin/contract', contractRouter);
app.use('/admin/major', majorRouter);
app.use('/admin/report', reportRouter);
app.use('/admin/student', studentRouter);
app.use('/admin/tag', tagRouter);
app.use('/admin/teacher', teacherRouter);
app.use('/admin/user', userRouter);

//connecting to the database
mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch(err => {
    console.log('Could not connected to the database. Exiting now...', err);
    process.exit();
  });

app.get('/', (req, res) => {
  res.json({ message: 'Simple app' });
});

app.listen(parseInt(process.env.PORT) || 5000, () => {
  console.log('Server is listening port 5000');
});
module.exports = app;
