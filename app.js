const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

const users = require('./routes/users');

const app = express();
const port = 3001;

app.use(logger('dev'));
app.use(bodyParser.json());
app.set('view engine', 'pug');

app.use('/users', users);
app.get('/', (req, res) => {
  res.redirect('/users');
});
app.use(express.static('public'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.instanceApp = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${port}..`);
});

module.exports = app;
