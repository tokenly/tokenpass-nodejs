'use strict'

var qs = require('qs')
var request = require('request')
var utils = require('../utils')


exports.step1 = function (provider, done) {
  var url = provider.request_url
  var options = {
    oauth: {
      callback: utils.redirect_uri(provider),
      consumer_key: provider.key,
      consumer_secret: provider.secret
    }
  }
  request.post(url, options, function (err, res, body) {
    var error = utils.error(err, res, body)
    done(error, qs.parse(body))
  })
}

exports.step2 = function (provider, step1) {
  if (!step1.oauth_token) {
    var error = (Object.keys(step1).length)
      ? step1 : {error: 'Tokenpass: OAuth1 missing oauth_token parameter'}
    return utils.toQuerystring({}, error, true)
  }
  var url = provider.authorize_url
  var params = {
    oauth_token: step1.oauth_token
  }
  if (provider.custom_params) {
    for (var key in provider.custom_params) {
      params[key] = provider.custom_params[key]
    }
  }
  return url + '?' + qs.stringify(params)
}

exports.step3 = function (provider, step1, step2, done) {
  if (!step2.oauth_token) {
    var error = (Object.keys(step2).length)
      ? step2 : {error: 'Tokenpass: OAuth1 missing oauth_token parameter'}
    done(utils.toQuerystring({}, error, true))
    return
  }
  var url = provider.access_url
  var options = {
    oauth: {
      consumer_key: provider.key,
      consumer_secret: provider.secret,
      token: step2.oauth_token,
      token_secret: step1.oauth_token_secret,
      verifier: step2.oauth_verifier
    }
  }
  request.post(url, options, function (err, res, body) {
    if (provider.intuit) {
      body += '&realmId=' + step2.realmId
    }
    var error = utils.error(err, res, body)
    done(error, utils.toQuerystring(provider, body))
  })
}
