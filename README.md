# passport-xapo

![License](https://img.shields.io/npm/l/passport-xapo.svg)
![npm version](https://img.shields.io/npm/v/passport-xapo.svg)

[Passport](https://passportjs.org/) strategy for authenticating with [Xapo](http://xapo.com/)
access tokens using the OAuth 2.0 API.

This module lets you authenticate using Xapo in your Node.js applications.
By plugging into Passport, Xapo authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Installation

```
$ npm install passport-xapo
```

## Usage

#### Create an Application

Before using `passport-xapo`, you must register an application with
Xapo.  If you have not already done so, a new application can be created at
[Xapo Developers](https://developers.xapo.com/).  Your application will
be issued a client ID and client secret, which need to be provided to the strategy.
You will also need to configure a redirect URI which matches the route in your
application.

### Configure Strategy

The Xapo authentication strategy authenticates users using a Xapo
account and OAuth 2.0 tokens. The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a client ID, client secret and callback URL.

```js
const XapoStrategy = require('passport-xapo')

passport.use(new XapoStrategy({
    clientID: XAPO_CLIENT_ID,
    clientSecret: XAPO_CLIENT_SECRET,
    callbackURL: 'https://www.example.net/auth/example/callback',
  }, (accessToken, refreshToken, profile, done) => {
    User.findOrCreate({ xapoId: profile.id }, (err, user) => {
      return done(err, user)
    })
  }
))
```

### Authenticate Requests

Use `passport.authenticate()`, specifying the `'xapo'` strategy, to authenticate requests. The permissions can be requested via the `scope` option.

NOTE: You need to provide the `'users'` scope to be able to retrieve the user's profile otherwise the library will throw an error

```js
app.get('/auth/xapo',
  passport.authenticate('xapo', { scope: ['users'] })
);

app.get('/auth/xapo/callback',
  passport.authenticate('xapo', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);
```

### Client Requests

Clients can send requests to routes that use passport-xapo authentication using query params, body, or HTTP headers. Clients will need to transmit the `access_token`
and optionally the `refresh_token` that are received from xapo after login.

#### Sending access_token as a Query parameter

```
GET /auth/xapo?access_token=<ACCESS_TOKEN>
```

#### Sending access token as an HTTP header

Clients can choose to send the access token using the Oauth2 Bearer token (RFC 6750) compliant format

```
GET /auth/xapo HTTP/1.1
Host: server.example.com
Authorization: Bearer <BASE64_ACCESS_TOKEN_STRING>
```

optionally a client can send via a custom (default access_token) header

```
GET /auth/xapo HTTP/1.1
Host: server.example.com
access_token: <BASE64_ACCESS_TOKEN_STRING>
```

#### Sending access token as an HTTP body

Clients can transmit the access token via the body

```
POST /auth/xapo HTTP/1.1
Host: server.example.com

access_token=<BASE64_ACCESS_TOKEN_STRING>
```

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

Licensed under the MIT License, Copyright © 2017 Airfill Prepaid AB.

See [LICENSE](./LICENSE) for more information.
