'use strict'

var express = require('express')

var qs = require('qs')

var config = require('../config')
var flows = {
  1: require('../flow/oauth1'),
  2: require('../flow/oauth2'),
  getpocket: require('../flow/getpocket')
}


function Tokenpass (_config) {
  var app = express()
  app.config = config.init(_config)
  app._config = config

  app.all('/connect/:provider/:override?', function (req, res, next) {
    if (!req.session) {
      throw new Error('Tokenpass: mount session middleware first')
    }
    if (req.method === 'POST' && !req.body) {
      throw new Error('Tokenpass: mount body parser middleware first')
    }
    next()
  })

  app.get('/connect/:provider/:override?', function (req, res, next) {
    if (req.params.override === 'callback') {
      next()
      return
    }
    req.session.tokenpass = {
      provider: req.params.provider
    }
    if (req.params.override) {
      req.session.tokenpass.override = req.params.override
    }
    if (Object.keys(req.query || {}).length) {
      req.session.tokenpass.dynamic = req.query
    }

    connect(req, res)
  })

  app.post('/connect/:provider/:override?', function (req, res) {
    req.session.tokenpass = {
      provider: req.params.provider
    }
    if (req.params.override) {
      req.session.tokenpass.override = req.params.override
    }
    if (Object.keys(req.body || {}).length) {
      req.session.tokenpass.dynamic = req.body
    }

    connect(req, res)
  })

  function connect (req, res) {
    var tokenpass = req.session.tokenpass
    var provider = config.provider(app.config, tokenpass)
    var flow = flows[provider.oauth]

    function callback (err, url) {
      var path = (provider.callback || '')
      if (err) {
        path ? res.redirect(path + '?' + err) : res.end(err)
      }
      else {
        res.redirect(url)
      }
    }

    if (/^1$/.test(provider.oauth)) {
      flow.step1(provider, function (err, data) {
        if (err) {
          callback(err)
        }
        else {
          tokenpass.step1 = data
          var url = flow.step2(provider, data)
          var error = !/^http|\//.test(url) ? url : null
          callback(error, url)
        }
      })
    }

    else if (/^2$/.test(provider.oauth)) {
      tokenpass.state = provider.state
      var url = flow.step1(provider)
      callback(null, url)
    }

    else if (flow) {
      flow.step1(provider, function (err, data) {
        if (err) {
          callback(err)
        }
        else {
          tokenpass.step1 = data
          var url = flow.step2(provider, data)
          callback(null, url)
        }
      })
    }

    else {
      var err = {error: 'Tokenpass: missing or misconfigured provider'}
      callback(qs.stringify(err))
    }
  }

  app.get('/connect/:provider/callback', function (req, res) {
    var tokenpass = req.session.tokenpass || {}
    var provider = config.provider(app.config, tokenpass)
    var flow = flows[provider.oauth]

    function callback (err, response) {
      var path = (provider.callback || '')
      if (err) {
        path ? res.redirect(path + '?' + err) : res.end(err)
      }
      else if (!provider.transport || provider.transport === 'querystring') {
        res.redirect(path + '?' + response)
      }
      else if (provider.transport === 'session') {
        req.session.tokenpass.response = qs.parse(response)
        res.redirect(path)
      }
    }

    if (/^1$/.test(provider.oauth)) {
      flow.step3(provider, tokenpass.step1, req.query, callback)
    }

    else if (/^2$/.test(provider.oauth)) {
      flow.step2(provider, req.query, tokenpass, function (err, data) {
        if (err) {
          callback(err)
        }
        else {
          var response = flow.step3(provider, data)
          callback(null, response)
        }
      })
    }

    else if (flow) {
      flow.step3(provider, tokenpass.step1, callback)
    }

    else {
      var err = {error: 'Tokenpass: missing session or misconfigured provider'}
      callback(qs.stringify(err))
    }
  })

  return app
}

exports = module.exports = Tokenpass
