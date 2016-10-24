'use strict'

var crypto = require('crypto')
var qs = require('qs')
var request = require('request')
var utils = require('../utils')


exports.step1 = function (provider) {
  var url = provider.authorize_url
  var params = {
    client_id: provider.key,
    response_type: 'code',
    redirect_uri: utils.redirect_uri(provider),
    scope: provider.scope,
    state: provider.state
  }
  if (provider.custom_params) {
    for (var key in provider.custom_params) {
      params[key] = provider.custom_params[key]
    }
  }

  return url + '?' + qs.stringify(params)
}

exports.step2 = function (provider, step1, session, done) {
  if (!step1.code) {
    var error = (Object.keys(step1).length)
      ? step1 : {error: 'Tokenpass: OAuth2 missing code parameter'}
    done(utils.toQuerystring({}, error, true))
    return
  }
  else if ((step1.state && session.state) && (step1.state !== session.state)) {
    var error = {error: 'Tokenpass: OAuth2 state mismatch'}
    done(utils.toQuerystring({}, error, true))
    return
  }
  var url = provider.access_url
  var options = {
    form: {
      grant_type: 'authorization_code',
      code: step1.code,
      client_id: provider.key,
      client_secret: provider.secret,
      redirect_uri: utils.redirect_uri(provider)
    }
  }
  request.post(url, options, function (err, res, body) {
    var error = utils.error(err, res, body)
    done(error, body)
  })
}

exports.step3 = function (provider, step2) {
  return utils.toQuerystring(provider, step2)
}
