var express = require('express')
var logger = require('morgan')
var session = require('express-session')
var Tokenpass = require('tokenpass-express')
var tokenpass = new Tokenpass(require('./config.json'))

var app = express()
app.use(logger('dev'))
// REQUIRED:
app.use(session({secret: 'very secret'}))
// mount tokenpass
app.use(tokenpass)

app.get('/handle_tokenpass_callback', function (req, res) {
  console.log(req.query.code)
  res.end(JSON.stringify(req.query, null, 2))
    
})

app.listen(3004, function () {
  console.log('Express server listening on port ' + 3004)
})
