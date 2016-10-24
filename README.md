## OAuth Application

Create OAuth application for Facebook and Twitter. For Twitter set the callback url to be `http://localhost:3004/connect/tokenpass/callback`, for Facebook set the application domain to be `localhost`

## Configure

Edit the `config.json` file with your own OAuth application credentials


## Run the App

```bash
$ node app.js
```

## Start the Flow

To start the OAuth flow for Tokenpass navigate to `http://localhost:3004/connect/facebook` in your browser
