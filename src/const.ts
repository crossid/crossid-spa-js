export const CACHE_INMEM = 'memory'
export const CACHE_LS = 'local_storage'
export const CACHE_SS = 'session_storage'
export const CROSSID_DEFAULT_AUTHORIZATION_SERVER = 'default'
// https://datatracker.ietf.org/doc/html/rfc7636#section-4.1
export const PKCE_CODE_CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
export const PKCE_CODE_MIN_LEN = 43
export const PKCE_CODE_MAX_LEN = 128
export const BEARER_CLAIM = '__bearer'

// keys
export const SPLIT_SEP = '__'
export const KEY_SEP = '|'
export const CACHE_KEY_PREFIX = 'crossid-spa-js'
export const LOGIN_STATE_KEY = `${CACHE_KEY_PREFIX}${KEY_SEP}login`
export const LOGOUT_STATE_KEY = `${CACHE_KEY_PREFIX}${KEY_SEP}logout`
export const CACHE_IDX_KEY = `${CACHE_KEY_PREFIX}${KEY_SEP}index`

// regions
export const REGION_US = 'us'
export const REGION_EU = 'eu'
