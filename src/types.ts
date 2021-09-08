interface IDTokenAddressClaim {
  formatted?: string
  street_address?: string
  locality?: string
  region?: string
  postal_code?: string
  country?: string
}

export interface JWTHeader {
  alg: string
  typ: string
}

// JWTClaims are the registered claims in rfc7519
// see https://datatracker.ietf.org/doc/html/rfc7519#section-4.1
export interface JWTClaims {
  iss?: string
  sub?: string
  // according to OIDC spec may be a string, it is the responsibility of the decoder
  // to convert a string value to an array.
  aud?: string[]
  exp?: number
  nbf?: number
  iat?: number
  jti?: number
  // custom
  [key: string]: any
}

export interface DecodedJWT<Claims extends JWTClaims> {
  header: JWTHeader
  payload: Claims
}

// IDTokenStandardClaims are the standarc claims as defined in OIDC basic spec.
interface IDTokenStandardClaims {
  sub?: string
  name?: string
  given_name?: string
  family_name?: string
  middle_name?: string
  nickname?: string
  preferred_username?: string
  profile?: string
  picture?: string
  website?: string
  email?: string
  email_verified?: boolean
  // male or female
  gender?: string
  // ISO 8601:2004 [ISO8601‑2004] YYYY-MM-DD format
  birthdate?: string
  // e.g., "Europe/Paris" or "America/Los_Angeles"
  zoneinfo?: string
  // typically ISO 639-1 Alpha-2 (e.g., "en-US" or "fr-CA")
  locale?: string
  // e.g., "+1 (425) 555-1212"
  phone_number?: string
  phone_number_verified?: boolean
  address?: IDTokenAddressClaim
}

// IDToken describes an OIDC token.
// see https://openid.net/specs/openid-connect-basic-1_0.html section 2.2
export interface IDToken extends JWTClaims, IDTokenStandardClaims {
  auth_time: number
  nonce?: string
  at_hash: string
  acr: string
  amr: string[]
  azp: string
  // custom
  [key: string]: any
}

export interface AuthorizationRequest {
  client_id: string
  audience: string[]
  response_type: string
  redirect_uri: string
  nonce: string
  state: string
  scope: string
  code_challenge: string
  code_challenge_method: string
}

// AuthorizationCodeData returns the data required in order to process an authorization code request
export interface AuthorizationCodeData {
  // request is the data required in order to perform an authorization code request
  request: AuthorizationRequest
  // code_verifier is the PKCE code verifier (in plain test)
  code_verifier: string
  // appState is the state given from app by AuthorizationOpts
  appState: string
}

// AuthorizationState is a state that is cached between authorization steps.
export interface AuthorizationState {
  audience: string[]
  redirect_uri: string
  scope: string
  nonce: string
  code_verifier: string
  state?: any
  tenantId?: string
}

/**
 * Returned upon completion of a login process.
 */
export interface LoginCompleteResponse {
  state: any
}

export interface LogoutRequest {
  id_token_hint?: string

  post_logout_redirect_uri?: string

  state?: any
}

// LogoutData returns the data required in order to process a logout request
export interface LogoutData {
  // request is the data required in order to perform a logout request
  request: LogoutRequest
  audience: string[]
  scopes: string[]
  // appState is the state given from app by LogoutOpts
  appState: any
}

// AuthorizationState is a state that is cached between authorization steps.
export interface LogoutState {
  client_id: string
  audience: string[]
  scopes: string[]
  post_logout_redirect_uri: string
  state: string
  appState: any
}

/**
 * Returned upon completion of a logout flow.
 */
export interface LogoutCompleteResponse {
  state: any
}
