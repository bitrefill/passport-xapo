import OAuth2Strategy, { InternalOAuthError } from 'passport-oauth2'

/**
 * `XapoStrategy` constructor.
 *
 * The Xapo authentication strategy authenticates requests by delegating to
 * Xapo using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occurred, `err` should be set.
 *
 * @param {Object} options
 * @param {Function} verify
 * @example
 * passport.use(new XapoStrategy({
 *   clientID: '123456789',
 *   clientSecret: 'shhh-its-a-secret',
 *   callbackURL: 'https://www.example.net/auth/example/callback',
 * }, (accessToken, refreshToken, profile, done) => {
 *   User.findOrCreate({ xapoId: profile.id }, done)
 * }))
 */
export default class XapoStrategy extends OAuth2Strategy {
  constructor(_options, _verify) {
    const options = _options || {}
    const verify = _verify
    const _xapoApiVersion = options.xapoApiVersion || 'v2'

    options.authorizationURL = options.authorizationURL || `https://${_xapoApiVersion}.api.xapo.com/oauth2/authorization`
    options.tokenURL = options.tokenURL || `https://${_xapoApiVersion}.api.xapo.com/oauth2/token`
    options.customHeaders = {
      Authorization: `Basic ${Buffer.from(`${options.clientID}:${options.clientSecret}`).toString('base64')}`,
    }

    if (!options.callbackURL) throw new TypeError('XapoStrategy requires a callbackURL option')

    super(options, verify)

    this.name = 'xapo'
    this._profileURL = options.profileURL || `https://${_xapoApiVersion}.api.xapo.com/users`
    this._oauth2.useAuthorizationHeaderforGET(true)
  }

  /**
   * Retrieve user profile from Xapo.
   *
   * This function constructs a normalized profile, with the following properties:
   *
   *   - `provider`         always set to `xapo`
   *   - `id`               the user's Xapo ID
   *   - `displayName`      the user's display name
   *   - `name.familyName`  the user's last name
   *   - `name.givenName`   the user's first name
   *   - `name.middleName`  the user's middle name
   *   - `gender`           the user's gender: `male` or `female`
   *   - `emails`           the user's email address
   *   - `photos`           the user's avatar url
   *
   * @param {String} accessToken
   * @param {Function} done
   */
  userProfile(accessToken, done) {
    const profileURL = this._profileURL

    this._oauth2.get(profileURL, accessToken, (err, body, res) => {
      if (err) return done(new InternalOAuthError('Failed to fetch user profile', err))

      let json
      try {
        json = JSON.parse(body)[0]
      } catch (e) {
        return done(e)
      }

      const profile = {
        provider: 'xapo',
        id: json.id,
        displayName: `${json.first_name} ${json.last_name}` || '',
        name: {
          familyName: json.last_name || '',
          givenName: json.first_name || '',
          middleName: json.middle_name || '',
        },
        gender: json.gender || '',
        emails: [{
          value: json.primary_email || '',
        }],
        photos: [{
          value: json.avatar || '',
        }],
        _raw: body,
        _json: json,
      }

      return done(null, profile)
    })
  }
}
