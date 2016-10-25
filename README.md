
# Tokenpass

## Table of Contents

- **Middleware**
  - [Express][express]
  - [Reserved Routes][reserved-routes]
- **Configuration**
  - [Basics][configuration]
  - [Redirect URL][redirect-url]

- **[Response Data][response-data]**
- Misc
  - [Typical Flow][typical-flow]
- [Examples][tokenpass-example]


## Express

```bash
npm install tokenpass-express
```

```js
var express = require('express')
  , session = require('express-session')
var Tokenpass = require('tokenpass-express')
  , tokenpass = new Tokenpass({/*configuration - see below*/})

var app = express()
// REQUIRED: (any session store - see ./examples/express-session)
app.use(session({secret: 'tokenpass'}))
// mount tokenpass
app.use(tokenpass)
```
## Path Prefix

You can mount Tokenpass under specific path prefix:

```js
// Express
app.use('/path/prefix', tokenpass)
```

In this case it is required to set the path prefix using the `path` configuration option for the server key:

```js
{
  "server": {
    "protocol": "...",
    "host": "...",
    "path": "/path/prefix"
  }
}
```

Lastly that path prefix should be specified in your OAuth application's redirect URL as well:

```
[protocol]://[host][path]/connect/tokenpass/callback
```

In case you want your callback routes prefixed, set them accordingly:

```js
{
  "tokenpass": {
    "callback": "/path/prefix/handle_tokenpass_callback"
  }
}
```


## Reserved Routes

```
/connect/tokenpass/:override?
/connect/tokenpass/callback
```


## Configuration

```js
{
  "server": {
    "protocol": "http",
    "host": "localhost:3000",
    "callback": "/callback",
    "state": true
  },
  "tokenpass": {
    "key": "...",
    "secret": "...",
    "scope": ["user", "tca"],
    "callback": "/tokenpass/callback"
  }
}
```

- **server** - configuration about your server
  - **protocol** - either `http` or `https`
  - **host** - your server's host name `localhost:3000` | `dummy.com:5000` | `mysite.com` ...
  - **path** - path prefix to use for the Tokenpass middleware *(defaults to empty string if omitted)*
  - **callback** - common callback for all providers in your config `/callback` | `/done` ...
  - **transport** - transport to use to deliver the response data in your final callback `querystring` | `session` *(defaults to querystring if omitted)*
  - **state** - generate random state string on each authorization attempt `true` | `false` *(OAuth2 only, defaults to false if omitted)*
- **provider** - tokenpass
  - **key** - `consumer_key` or `client_id` of your app
  - **secret** - `consumer_secret` or `client_secret` of your app
  - **scope** - array of OAuth scopes to request
  - **callback** - specific callback to use for this provider *(overrides the global one specified under the `server` key)*


## Redirect URL

For `redirect` URL of your OAuth application you should **always** use this format:

```
[protocol]://[host]/connect/tokenpass/callback
```

Where `protocol` and `host` should match the ones from which you initiate the OAuth flow.

This `redirect` URL is used internally by Tokenpass. You will receive the [response data][response-data] from the OAuth flow inside the route specified in the `callback` key of your Tokenpass configuration.

> See the [Path Prefix][path-prefix] section on how to configure the redirect URL when using the `path` configuration option.


## Response Data

The OAuth response data is returned as a querystring in your **final** callback - the one you specify in the `callback` key of your Tokenpass configuration.

Alternatively the response data can be returned in the session, see the [configuration][configuration] section above and the [session transport][session-transport-example] example.

#### OAuth2

For OAuth2 the `access_token` and the `refresh_token` (if present) are accessible directly, `raw` contains the raw response data:

```js
{
  access_token: '...',
  refresh_token: '...',
  raw: {
    access_token: '...',
    refresh_token: '...',
    some: 'other data'
  }
}
```


#### Error

In case of an error, the `error` key will be populated with the raw error data:

```js
{
  error: {
    some: 'error data'
  }
}
```


## Typical Flow

1. To test your application, you will need an a secret and key for Tokenpass. You can create an account at https://tokenpass-stage.tokenly.com/ and generate an application there for testing.
2. For `redirect` URL of your OAuth application **always** use this format:
  `[protocol]://[host]/connect/tokenpass/callback`
3. Create a `config.json` file containing:

  ```js
  "server": {
    "protocol": "https",
    "host": "mywebsite.com"
  },
  "tokenpass": {
    "key": "[CLIENT_ID]",
    "secret": "[CLIENT_SECRET]",
    "authorize_url": "https://tokenpass.tokenly.com/oauth/authorize",
    "access_url": "https://tokenpass.tokenly.com/oauth/access-token",
    "oauth": 2,
    "callback": "/handle_tokenpass_callback",
    "redirect_uri": "https://mywebsite.com/connect/tokenpass/callback",
    "scope": [
      "user",
      "tca"
    ]
 
  }
  ```
4. Initialize Tokenpass and mount it:

  ```js
  // Express
  var express = require('express')
    , session = require('express-session')
  var Tokenpass = require('tokenpass-express')
    , tokenpass = new Tokenpass(require('./config.json'))
  var app = express()
  app.use(session({secret: 'tokenpass'}))
  app.use(tokenpass)
  ```
5. Navigate to `/connect/tokenpass` to initiate the OAuth flow for Tokenpass.
6. Once the OAuth flow is completed you will receive the response data in the `/handle_tokenpass_callback` route for Tokenpass.

*(also take a look at the [example][tokenpass-example])*


  [request]: https://github.com/request/request
  [oauth-config]: https://github.com/tokenly/tokenpass-nodejs/blob/master/config/oauth.json
  [reserved-keys]: https://github.com/tokenly/tokenpass-nodejs/blob/master/config/reserved.json
  [tokenpass-example]: https://github.com/tokenly/tokenpass-nodejs/tree/master/example
  [table-of-contents]: #table-of-contents
  [express]: #express
  [path-prefix]: #path-prefix
  [reserved-routes]: #reserved-routes
  [configuration]: #configuration
  [redirect-url]: #redirect-url
  [response-data]: #response-data
  [typical-flow]: #typical-flow
