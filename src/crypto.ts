import {
  PKCE_CODE_CHARSET,
  PKCE_CODE_MIN_LEN,
  PKCE_CODE_MAX_LEN,
} from './const'

// sha256 hash s using the sha256 algorithm.
export const sha256 = async (s: string) => {
  const d = window.crypto.subtle.digest(
    { name: 'SHA-256' },
    new TextEncoder().encode(s)
  )

  return await d
}

// generateRandomString generates a cryptography random string with the size of len using only chars of charset.
export const generateRandomString = (charset: string, len: number) => {
  const rv = Array.from(window.crypto.getRandomValues(new Uint8Array(len)))
  return rv.map((v) => charset[v % charset.length]).join('')
}

export const generatePKCECodeVerifier = () => {
  return generateRandomString(
    PKCE_CODE_CHARSET,
    Math.floor(
      Math.random() * (PKCE_CODE_MAX_LEN - PKCE_CODE_MIN_LEN + 1) +
        PKCE_CODE_MIN_LEN
    )
  )
}
