import {
  BEARER_CLAIM,
  CACHE_IDX_KEY,
  CACHE_INMEM,
  CACHE_LS,
  CACHE_SS,
  KEY_SEP,
  LOGIN_STATE_KEY,
  LOGOUT_STATE_KEY,
  SPLIT_SEP,
} from './const'
import {
  ICache,
  InmemCache,
  LocalStorageCache,
  SessionStorageCache,
} from './cache'
import { uniqueScopes } from './scope'
import {
  AuthorizationCodeData,
  AuthorizationRequest,
  AuthorizationState,
  DecodedJWT,
  IDToken,
  JWTClaims,
  LoginCompleteResponse,
  LogoutCompleteResponse,
  LogoutData,
  LogoutRequest,
  LogoutState,
} from './types'
import { generatePKCECodeVerifier, sha256 } from './crypto'
import { base64Encode, base64URLEncode, bufferToBase64URLEncode } from './codec'
import { createQueryString } from './url'
import { TokenEndpoint, TokenRequest } from './api'
import { assert, decode } from './jwt'
import {
  JWTAlgAssertion,
  JWTAudAssertion,
  JWTExpAssertion,
  JWTIatAssertion,
  JWTIssuerAssertion,
  JWTNbfAssertion,
  JWTNonceAssertion,
  JWTRequiredClaimsAssertion,
} from './jwt_assertions'

type tokenTypes = 'access_token' | 'id_token' | 'refresh_token'

/**
 * Describes the parameters required in order to perform an authorization code request.
 */
export interface BaseAuthorizationCodeParams {
  /**
   * Defines the requested audience when performing an authorization code request.
   */
  audience: string[]
  /**
   * Defines the requested response type when performing an authorization code request.
   */
  response_type: string
  /**
   * The URL is where authorization server will redirect browser upon a successful authentication.
   *
   * Please make sure to whitelist this URL in the authorization provider.
   */
  redirect_uri: string
  /**
   * Defines the requested scopes.
   */
  scope: string
}

/**
 * Base client options required to configure a new client.
 */
export interface BaseClientOpts {
  /**
   * OAuth2 client identifier of your application.
   */
  client_id: string

  /**
   * Defines where cache data is stored, possible values `local_storage` or `session_storage`.
   * In most cases _session_storage_ is sufficient but _local_storage_ is required in cases where
   * your auth flow spread in multiple tabs (e.g., "activation by email link is opened within another tab)
   * Default: 'session_storage'
   */
  state_type?: typeof CACHE_LS | typeof CACHE_SS

  /**
   * Defines where cache data is stored, possible values are: `memory`, `local_storage` or `session_storage`.
   * Default: 'memory'
   */
  cache_type?: typeof CACHE_INMEM | typeof CACHE_LS | typeof CACHE_SS

  /**
   * Defines the default locales to request for the login/consent ui
   */
  ui_locales?: string

  /**
   * The template ID to display in the login/consent flow
   */
  template_id?: string

  authorizationOpts: BaseAuthorizationCodeParams
}

/**
 * Client options to configure a client for a crossid tenant, visit us at [crossid.io](https://crossid.io).
 */
export interface ClientCrossidOpts extends BaseClientOpts {
  /**
   * full domain name as shown in the url and after registering an app
   */
  domain: string

  /**
   * custom authorization server, defaults to `default`
   */
  auth_server?: string
}

/**
 * Client options to manually configure a client.
 */
export interface ClientOpts extends BaseClientOpts {
  /**
   * The URL used to request an authorization code.
   */
  authorization_endpoint: string

  /**
   * The URL used to exchange an authorization code with tokens.
   */
  token_endpoint: string

  /**
   * The expected issuer of the tokens.
   */
  issuer: string

  /**
   * the URL used to request a logout.
   */
  logout_endpoint: string

  /**
   * the URL used to signup a new user
   */
  signup_endpoint?: string
}

/**
 * Client options to configure a client via an [OIDC well-known endpoint](https://openid.net/specs/openid-connect-discovery-1_0.html)
 */
export interface ClientDiscoveryOpts extends BaseClientOpts {
  /**
   * URL to the well-known endpoint.
   */
  wellknown_endpoint: string
}

/**
 * Options when requesting an authorization code.
 */
export interface AuthorizationOpts
  extends Partial<BaseAuthorizationCodeParams> {
  /**
   * state can be used by the application to preserve some state.
   * for example, the application may provide a state that contains the return to url where user
   * should be redirected to upon completion of a successful login.
   */
  state?: any
}

/**
 * Options for the `GetUser` method.
 */
export interface GetUserOpts {
  /**
   * The scopes that were requested when authenticated.
   */
  scope?: string

  /**
   * The audience that were requested when authenticated.
   */
  audience?: string[]
}

/**
 * Options for the `GetAccessToken` method.
 */
export interface GetAccessTokenOpts {
  /**
   * The scopes that were requested when authenticated.
   */
  scope?: string

  /**
   * The audience that were requested when authenticated.
   */
  audience?: string[]
}

/**
 * Options for logging user out.
 */
export interface LogoutOpts {
  /**
   * The URL which the authorization provider will redirect the browser after a successful logout.
   *
   * Please make sure to whitelist this URL in the authorization provider.
   */
  post_logout_redirect_uri?: string

  id_token_hint?: string

  /**
   * The scopes that were requested when authenticated.
   */
  scope?: string

  /**
   * The audience that were requested when authenticated.
   */
  audience?: string[]

  /**
   * state can be used by the application to preserve some state.
   */
  state?: any
}

/**
 * CrossidClient performs OAuth2 authorization code flow using the PKCE extension.
 * A typical application will only need a sigle instance of this client.
 * In more advanced cases, such as a single SPA app that requires interaction with multiple oauth2 clients,
 * a client instance should be created per OAuth client id.
 *
 * ```js
 * const opts = {
 * ...
 * }
 * const crossid = new CrossidClient(opts)
 * ```
 */
export default class CrossidClient {
  // scopes are the scopes to be sent on authentication requests.
  // these can be overriden by various methods such as loginWithRedirect()
  private scope: string

  // state manages a state that surives redirections.
  private state: ICache

  // cache caches data such as user and tokens.
  private cache: ICache

  // the name of the key when persisting a login state.
  private loginStateKey: string

  // the name of the key when persisting a logout state.
  private logoutStateKey: string

  constructor(private opts: ClientOpts) {
    this.loginStateKey = LOGIN_STATE_KEY
    this.logoutStateKey = LOGOUT_STATE_KEY
    this.scope = opts.authorizationOpts.scope

    this.state = this._stateFactory(this.opts.state_type || CACHE_SS)
    this.cache = this._cacheFactory(this.opts.cache_type || CACHE_INMEM)

    this._purgeIndex()
  }

  /**
   * Creates a redirect URL that can be used to start an authorization code request.
   *
   * This method is useful when you want control over the actual redirection,
   * if you want browser to be redirected, call `loginWithRedirect` instead.
   *
   * ```js
   * const url = createRedirectURL()
   * window.location.assign(url)
   * ```
   *
   * @param opts custom options that affects the authorization code process.
   * @returns a URL where the browser should be redirected to in order to login.
   */
  public async createRedirectURL(opts: AuthorizationOpts = {}) {
    const data = await this._createAuthorizationData(opts)
    await this._persistAuthorizationData(data)
    return this._authorizeUrl(data.request)
  }

  /**
   * Starts a login by redirecting the current window.
   *
   * ```js
   * loginWithRedirect()
   * ```
   *
   * @param opts options
   */
  public async loginWithRedirect(opts: AuthorizationOpts) {
    const url = await this.createRedirectURL(opts)
    window.location.replace(url)
  }

  /**
   *
   * @param opts Start a signup by redirecting the current window.
   *
   * ```js
   * createSignupUrl()
   * ```
   *
   * @returns
   */
  public async createSignupUrl(opts: AuthorizationOpts) {
    if (!this.opts.signup_endpoint) {
      throw new Error('signup_endpoint not defiend')
    }
    const authUrl = await this.createRedirectURL(opts)
    const url = `${this.opts.signup_endpoint}?${createQueryString({
      return_to: authUrl,
    })}`
    return url
  }

  public async signupWithRedirect(opts: AuthorizationOpts) {
    const url = await this.createSignupUrl(opts)
    window.location.replace(url)
  }

  /**
   * Call this method in order to complete authentication flow.
   * this method should be called after the End-User sucessfully signs-in.
   *
   * @param url the URL returned from the authorization code endpoint, defaults to `window.location.href`
   * @returns
   */
  public async handleRedirectCallback(
    url: URL = new URL(window.location.href)
  ): Promise<LoginCompleteResponse> {
    const sp = url.searchParams
    const code = sp.get('code')
    const error = sp.get('error')
    if (error) {
      throw new Error(error)
    }

    const state = this.state.get<AuthorizationState>(this.loginStateKey)
    // this is the actual PKCE protection.
    if (!state?.code_verifier) {
      throw new Error('invalid state, try sign-in again')
    }

    const tokenOptions = {
      tokenEndpoint: this.opts.token_endpoint,
      client_id: this.opts.client_id,
      code_verifier: state.code_verifier,
      grant_type: 'authorization_code',
      redirect_uri: state.redirect_uri,
      code,
    } as TokenRequest

    const resp = await TokenEndpoint(tokenOptions)
    let idToken: DecodedJWT<IDToken>

    if (resp.id_token) {
      idToken = decode<IDToken>(resp.id_token)
      idToken.payload[BEARER_CLAIM] = resp.id_token
      this._assertIDToken(idToken, state.nonce)
    }

    const accessToken = decode<JWTClaims>(resp.access_token)
    this.state.remove(this.loginStateKey)
    this._assertAccessToken(accessToken, state.audience)
    accessToken.payload._raw = resp.access_token
    this._cacheTokens(idToken, accessToken, resp.refresh_token)

    return {
      state: state.state,
    }
  }

  /**
   * Returns an authenticated User.
   *
   * @param opts options to get a user for a more specific authentication.
   * @returns a promise which resolves to a User or undefined if no authenticated user found.
   */
  public async getUser<E extends IDToken>(
    opts: GetUserOpts = {}
  ): Promise<E | undefined> {
    const aud = this.getFinalAudience(opts.audience)
    const scp = this.getFinalScope(opts.scope)
    const keys = this._getTokensKeysFromCache('id_token', aud, scp)
    const tok = this._getNarrowedKey<DecodedJWT<E>>(keys)
    return tok?.payload
  }

  /**
   * Returns an access token.
   *
   * @param opts options to get an access token for a more specific authentication.
   * @returns a promise which resolves to an access token string.
   */
  public async getAccessToken(
    opts: GetAccessTokenOpts = {}
  ): Promise<string | undefined> {
    const aud = this.getFinalAudience(opts.audience)
    const scp = this.getFinalScope(opts.scope)
    const keys = this._getTokensKeysFromCache('access_token', aud, scp)
    const tok = this._getNarrowedKey<DecodedJWT<JWTClaims>>(keys)
    return tok?.payload?._raw
  }

  /**
   * introspectAccessToken returns the decoded claims of the access token.
   * handful for protecting spa routes by claims such 'scp'
   *
   * note: this method does not actually perform idp introspection nor checks the validity of the token.
   *
   * @param opts
   * @returns
   */
  public async introspectAccessToken(
    opts: GetAccessTokenOpts = {}
  ): Promise<JWTClaims | undefined> {
    const aud = this.getFinalAudience(opts.audience)
    const scp = this.getFinalScope(opts.scope)
    const keys = this._getTokensKeysFromCache('access_token', aud, scp)
    const tok = this._getNarrowedKey<DecodedJWT<JWTClaims>>(keys)

    if (tok) {
      return {
        // returned by idp's introspection endpoint.
        active: true,
        ...tok.payload,
        _raw: undefined,
      }
    }

    return undefined
  }

  /**
   * Creates a redirect URL that can be used to start an logout flow.
   *
   * This method is useful when you want control over the actual redirection,
   * if you want browser to be redirected, call `logoutWithRedirect` instead.
   *
   * ```js
   * const url = createLogoutRedirectURL()
   * window.location.assign(url)
   * ```
   *
   * @param opts custom options that affects the logout flow.
   * @returns a URL where the browser should be redirected to in order to logout.
   */
  public async createLogoutRedirectURL(opts: LogoutOpts = {}) {
    const data = await this._createLogoutData(opts)

    const req = data.request
    // this means we'r not performing a logout for a specific client.
    // in this flow we can't use state nor expect the AS to redirect back
    // to the app so we must compelte auth here
    // we also choose to wipe everything out if there's no post_logout_redirect_uri set as there will
    // not be a chance for the app to complete the logout process
    if (!req.id_token_hint || !opts.post_logout_redirect_uri) {
      // todo: this deletes only tokens for the given audience and scopes, consider deleting ALL tokens instead.
      this._removeTokens(data.audience, data.scopes)
      return this._logoutUrl()
    }

    await this._persistLogoutData(data)
    return this._logoutUrl(data.request)
  }

  /**
   * Starts a logout by redirecting the current window.
   *
   * ```js
   * logoutWithRedirect()
   * ```
   *
   * @param opts options
   */
  public async logoutWithRedirect(opts: AuthorizationOpts) {
    const url = await this.createLogoutRedirectURL(opts)
    window.location.assign(url)
  }

  /**
   * Call this method in order to complete logout flow.
   * this method should be called after the End-User sucessfully logs out.
   *
   * note that this method only works if the logout was performed for a specific client.
   *
   * @param url the URL returned from the logout endpoint, defaults to `window.location.href`
   * @returns
   */
  public async handleLogoutRedirectCallback(
    url: URL = new URL(window.location.href)
  ): Promise<LogoutCompleteResponse> {
    const sp = url.searchParams
    const stateqp = sp.get('state')
    const error = sp.get('error')
    if (error) {
      throw new Error(error)
    }

    const state = this.state.get<LogoutState>(this.logoutStateKey)
    // protect from CSRF
    if (!state?.state || state.state !== stateqp) {
      throw new Error('invalid state, try sign-in again')
    }

    this._removeTokens(state.audience, state.scopes)
    this.state.remove(this.logoutStateKey)

    return {
      state: state.appState,
    }
  }

  private async _createAuthorizationData(
    opts: AuthorizationOpts
  ): Promise<AuthorizationCodeData> {
    const state = base64URLEncode(base64Encode(generatePKCECodeVerifier()))
    const nonce = base64URLEncode(base64Encode(generatePKCECodeVerifier()))
    const code_verifier = generatePKCECodeVerifier()

    // codeChallenge is a SHA of the verifier
    const codeChallengeBuf = await sha256(code_verifier)
    let code_challenge = bufferToBase64URLEncode(
      new Uint8Array(codeChallengeBuf)
    )

    const params: Partial<AuthorizationRequest> = {
      audience: opts.audience,
      redirect_uri: opts.redirect_uri,
      response_type: opts.response_type,
      scope: opts.scope,
      state,
      nonce,
      code_challenge,
    }

    const request = this._mergeAuthorizationCodeParams(params)

    return {
      request,
      code_verifier,
      appState: opts.state,
    }
  }

  // _persistAuthorizationData saves the authorization request state.
  private async _persistAuthorizationData(
    data: AuthorizationCodeData
  ): Promise<void> {
    const req = data.request

    const state: AuthorizationState = {
      audience: req.audience,
      redirect_uri: req.redirect_uri,
      scope: req.scope,
      nonce: req.nonce,
      state: data.appState,
      code_verifier: data.code_verifier,
    }

    this.state.set(this.loginStateKey, state)
  }

  // _mergeAuthorizationCodeParams merges opts with defaults
  private _mergeAuthorizationCodeParams(
    opts: Partial<AuthorizationRequest>
  ): AuthorizationRequest {
    return {
      client_id: this.opts.client_id,
      audience: this.getFinalAudience(opts.audience),
      response_type:
        opts.response_type ||
        this.opts.authorizationOpts.response_type ||
        'code',
      redirect_uri:
        opts.redirect_uri || this.opts.authorizationOpts.redirect_uri,
      nonce: opts.nonce,
      state: opts.state,
      scope: this.getFinalScope(opts.scope).join(' '),
      code_challenge: opts.code_challenge,
      code_challenge_method: 'S256',
      ui_locales: opts.ui_locales || this.opts.ui_locales,
      template_id: opts.template_id || this.opts.template_id,
    }
  }

  private async _createLogoutData(opts: LogoutOpts): Promise<LogoutData> {
    const request: LogoutRequest = {
      id_token_hint: opts.id_token_hint,
      post_logout_redirect_uri: opts.post_logout_redirect_uri,
    }

    // try to detrmine id token hint from cache if hint is not specifically set to null
    // which means that the consumer would like to perform a generic (non client specific) logout
    if (!request.id_token_hint && request.id_token_hint !== null) {
      const user = await this.getUser()
      if (!!user && user[BEARER_CLAIM]) {
        request.id_token_hint = user[BEARER_CLAIM]
      }
    }

    if (!!request.id_token_hint) {
      request.state = base64URLEncode(base64Encode(generatePKCECodeVerifier()))
    }

    return {
      request,
      audience: opts.audience || this.opts.authorizationOpts.audience,
      scopes: (opts.scope || this.scope).split(' '),
      appState: opts.state,
    }
  }

  // _persistLogoutData saves the logout request state.
  private async _persistLogoutData(data: LogoutData): Promise<void> {
    const state: LogoutState = {
      client_id: this.opts.client_id,
      audience: data.audience,
      scopes: data.scopes,
      post_logout_redirect_uri: data.request.post_logout_redirect_uri,
      state: data.request.state,
      appState: data.appState,
    }

    this.state.set(this.logoutStateKey, state)
  }

  // _assertAccessToken asserts that the given token is valid.
  private _assertAccessToken(token: DecodedJWT<JWTClaims>, aud: string[]) {
    assert(
      token,
      JWTRequiredClaimsAssertion(['alg'], ['iss', 'sub', 'aud', 'exp', 'iat']),
      JWTIssuerAssertion(this.opts.issuer),
      JWTAlgAssertion('RS256'),
      JWTAudAssertion(aud),
      JWTExpAssertion(true),
      JWTNbfAssertion(true)
    )
  }

  // _assertIDToken assets that the given id token is valid.
  private _assertIDToken(token: DecodedJWT<IDToken>, nonce: string) {
    assert(
      token,
      JWTRequiredClaimsAssertion(
        ['alg'],
        ['iss', 'sub', 'aud', 'nonce', 'exp', 'iat']
      ),
      JWTIssuerAssertion(this.opts.issuer),
      JWTNonceAssertion(nonce),
      JWTAlgAssertion('RS256'),
      JWTAudAssertion([this.opts.client_id]),
      JWTExpAssertion(true),
      JWTNbfAssertion(false),
      JWTIatAssertion()
      // todo: consider supporting max page
      // JWTAuthTimeAssertion(null)
    )

    return null
  }

  // _removeTokens removes all tokens in cache that match the audience and scopes
  private _removeTokens(audience: string[], scopes: string[]) {
    // remove tokens
    const idtoks = this._getTokensKeysFromCache('id_token', audience, scopes)

    const actoks = this._getTokensKeysFromCache(
      'access_token',
      audience,
      scopes
    )

    const rftoks = this._getTokensKeysFromCache(
      'refresh_token',
      audience,
      scopes
    )

    const toks = idtoks.concat(actoks).concat(rftoks)
    toks.forEach((k) => this.cache.remove(k))
    this._purgeIndex()
  }

  // _authorizeUrl builds a URL to perform an authorization code request.
  private _authorizeUrl(req: AuthorizationRequest) {
    return `${this.opts.authorization_endpoint}?${createQueryString(req)}`
  }

  private _logoutUrl(req?: Partial<LogoutRequest>) {
    let url = this.opts.logout_endpoint

    if (!!req) {
      url = `${url}?${createQueryString(req)}`
    }

    return url
  }

  // _stateFactory factories a state instance by given type
  private _stateFactory(type: string): ICache {
    const opt = { ttl: 5 * 60 }
    switch (type) {
      case CACHE_LS:
        return new LocalStorageCache(opt)
      case CACHE_SS:
        return new SessionStorageCache(opt)
      default:
        throw new Error(`Invalid cache type "${type}"`)
    }
  }

  // _cacheFactory factories a cache instance by given type
  private _cacheFactory(type: string): ICache {
    switch (type) {
      case CACHE_INMEM:
        return new InmemCache()
      case CACHE_LS:
        return new LocalStorageCache({ purgeOnInit: true })
      case CACHE_SS:
        return new SessionStorageCache({ purgeOnInit: true })
      default:
        throw new Error(`Invalid cache type "${type}"`)
    }
  }

  // _cacheTokens caches the given tokens
  private _cacheTokens(
    idToken: DecodedJWT<IDToken>,
    accessToken: DecodedJWT<JWTClaims>,
    refreshToken?: string
  ) {
    const accessTokenTTL = this._ttlFromToken(accessToken)
    this._cacheToken(
      'access_token',
      accessToken,
      this.opts.client_id,
      accessToken.payload.aud,
      accessToken.payload.scp,
      accessTokenTTL
    )

    if (idToken) {
      this._cacheToken(
        'id_token',
        idToken,
        this.opts.client_id,
        accessToken.payload.aud,
        accessToken.payload.scp || [],
        this._ttlFromToken(idToken)
      )
    }

    if (refreshToken) {
      this._cacheToken(
        'refresh_token',
        refreshToken,
        this.opts.client_id,
        accessToken.payload.aud,
        accessToken.payload.scp,
        // todo: this should be based on token response or a client opt
        86400 * 5
      )
    }
  }

  // _cacheToken caches a single token.
  private _cacheToken(
    tokType: tokenTypes,
    tok: any,
    client_id: string,
    audience: string[],
    scope: string[],
    ttl: number
  ) {
    const key = this._cacheKey({
      tokType,
      client_id,
      audience,
      scope,
    })

    this.cache.set(key, tok, { ttl })

    // this method currently handles single aud only
    const aud = [audience[0] || '']
    let idx = this.cache.get(CACHE_IDX_KEY)
    if (!idx) idx = {}

    scope = scope.length ? scope : ['']

    aud.forEach((u) => {
      if (!idx[u]) idx[u] = {}
      let audIdx = idx[u]
      scope.forEach((s) => {
        if (!audIdx[s]) audIdx[s] = []
        audIdx[s].push(key)
      })
    })

    this.cache.set(CACHE_IDX_KEY, idx)
  }

  // _cacheKey builds a unique identifier for a token to be cached.
  private _cacheKey({
    tokType,
    client_id,
    audience,
    scope,
  }: {
    tokType: tokenTypes
    client_id: string
    audience: string[]
    scope: string[]
  }) {
    let scpStr
    if (scope && scope.length) {
      scope.sort()
      scpStr = scope.join(SPLIT_SEP)
    }
    return [
      'crossid-spa-js',
      tokType,
      client_id,
      audience.join(SPLIT_SEP),
      scpStr,
    ].join(KEY_SEP)
  }

  // _decodeKey decodes key into a structure.
  private _decodeKey(key: string) {
    const parts = key.split(KEY_SEP)
    const k = parts[1]
    const aud = parts[2]
    const scp = parts[3]

    let kt: tokenTypes
    switch (k) {
      case 'access_token': {
        kt = 'access_token'
      }
      case 'id_token': {
        kt = 'id_token'
      }
      case 'refresh_token': {
        kt = 'refresh_token'
      }
    }

    return {
      tokenType: k,
      audience: aud.split(SPLIT_SEP),
      scope: scp.split(SPLIT_SEP),
    }
  }

  // _getTokensKeysFromCache returns key names that matches the given criteria.
  private _getTokensKeysFromCache(
    tokType: tokenTypes,
    aud: string[] = [''],
    scp: string[]
  ): string[] {
    let idx = this.cache.get(CACHE_IDX_KEY) || {}
    // this method currently handles single aud only
    const aud1 = aud[0]
    const audIdx = idx[aud1] || ['']
    if (!audIdx) return []

    let inter
    for (const s of scp) {
      if (!audIdx[s] || !audIdx[s].length) {
        return []
      }

      if (!inter) {
        inter = audIdx[s].filter(
          (k) => this._decodeKey(k).tokenType === tokType
        )
        continue
      }

      inter = inter.filter((value) => audIdx[s].includes(value))
    }

    return inter
  }

  // _getNarrowedKey selects a single key from given candidate keys.
  private _getNarrowedKey<T extends any>(keys: string[]): T {
    for (let i in keys) {
      const entry = this.cache.get<T>(keys[i])
      if (!entry) {
        // expired or index of out sync
        continue
      }

      // todo improve this by returning the most narrowed key
      return entry
    }
  }

  // _ttlFromToken returns the ttl of a token in seconds.
  private _ttlFromToken(tok: DecodedJWT<JWTClaims>) {
    return (new Date(tok.payload.exp * 1e3).getTime() - Date.now()) / 1e3
  }

  // _purgeIndex syncs index keys with the actual cache state.
  private _purgeIndex() {
    const idx = this.cache.get(CACHE_IDX_KEY)
    if (!idx) {
      return
    }
    for (const [aud, scp] of Object.entries(idx)) {
      for (const [s, keys] of Object.entries<string[]>(scp)) {
        const purgeIdx = []
        for (let i = 0; i < keys.length; i++) {
          if (!this.cache.get(keys[i])) {
            purgeIdx.push(i)
          }
        }
        idx[aud][s] = keys.filter((_, i) => purgeIdx.indexOf(i) === -1)
        if (!idx[aud][s].length) {
          delete idx[aud][s]
        }
      }
      if (!Object.keys(idx[aud]).length) {
        delete idx[aud]
      }
    }
    this.cache.set(CACHE_IDX_KEY, idx)
  }

  private getFinalAudience(localAud: string[]): string[] {
    return localAud || this.opts.authorizationOpts.audience
  }

  private getFinalScope(localScp: string): string[] {
    return localScp !== undefined
      ? uniqueScopes(localScp)
      : uniqueScopes(this.scope)
  }
}
