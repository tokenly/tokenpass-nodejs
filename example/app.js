var express = require('express')
var logger = require('morgan')
var session = require('express-session')
var Tokenpass = require('tokenpass-express')
var request = require('request')
var tokenpass = new Tokenpass(require('./config.json'))

var app = express()
app.use(logger('dev'))
// REQUIRED:
app.use(session({secret: 'very secret'}))
// mount tokenpass
app.use(tokenpass)


app.get('/handle_tokenpass_callback', function (req, res) {
	//console.log(req.query.access_token)
	//console.log(tokenpass.config.tokenpass.host)
	
	/***** Get User Profile Data after getting access token *****/
	
	var access_token = req.query.access_token
	var url = 'https://tokenpass.tokenly.com/oauth/user?access_token='+access_token
 
	request.get({
		url: url,
		json: true
	}, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			res.end(JSON.stringify(body, null, 2))
		}
	})    
})

app.listen(3000, function () {
  console.log('Express server listening on port ' + 3000)
})
