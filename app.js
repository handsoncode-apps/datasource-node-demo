const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')

const users = require('./routes/users')

const app = express()
const port = 3001

app.use(logger('dev'))
app.use(bodyParser.json())
app.set('view engine', 'pug')

app.use('/users', users)
app.use(express.static('public'))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

let server = app.listen(port, function () {
  console.log('Listening on port ' + port + '..')
})

module.exports = server
