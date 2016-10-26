var express = require('express')
var logger = require('morgan')
var session = require('express-session')
var config = require('./config.json')

var TOKENPASS = require("tokenpass-api")
var tokenapiModule = new TOKENPASS(config.tokenpass.key,config.tokenpass.secret,config.tokenpass.api_url);

var app = express()
app.use(logger('dev'))

app.get('/check_token_access', function (req, res) {		
	var username = 'ratinder'
	var rules = { TOKENLY: 1, LTBCOIN: 100000, stackop_1:'OR' }
	var oauth_token = '8Ch7YCnbAP9kAWL8TUMKfBbNDB3DYaYnNcTDfnNn1'
	tokenapiModule.checkTokenAccess(username,rules,oauth_token).then(function(result){
		console.log(result);
		res.end(JSON.stringify(result))
	},function(err){
		console.error(err);
		res.end(JSON.stringify(err))
	})
})

app.listen(3001, function () {
  console.log('Express server listening on port ' + 3001)
})
