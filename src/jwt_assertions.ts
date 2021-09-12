import { JWTAssertion } from './jwt'
import { mustContain } from './string'
import { isNumber } from './type'
import { DecodedJWT, JWTClaims } from './types'

// JWTRequiredClaimsAssertion asserts that claims and headers exist in token.
export const JWTRequiredClaimsAssertion = (
  headers?: string[],
  claims?: string[]
): JWTAssertion => {
  const mis = []
  return <C extends JWTClaims>(jwt: DecodedJWT<C>) => {
    if (claims) {
      claims.filter((c) => !!!jwt.payload[c]).forEach((c) => mis.push(c))
    }

    if (headers) {
      headers.filter((h) => !!!jwt.header[h]).forEach((h) => mis.push(h))
    }

    return mis && mis.length ? `${mis.join(',')} missing` : null
  }
}

// JWTIssuerAssertion asserts that the token's issuer is the expected one
export const JWTIssuerAssertion = (exp: string): JWTAssertion => {
  return <C extends JWTClaims>(jwt: DecodedJWT<C>) => {
    return eqErr('Issuer (iss)', exp, jwt.payload.iss)
  }
}

// JWTNonceAssertion asserts that the token's nonce is the expected one
export const JWTNonceAssertion = (exp: string): JWTAssertion => {
  return <C extends JWTClaims>(jwt: DecodedJWT<C>) => {
    return eqErr('Nonce (nonce)', exp, jwt.payload.nonce)
  }
}

// JWTAlgAssertion asserts that the token's alg header is the expected one
export const JWTAlgAssertion = (exp: 'RS256' | 'HS256'): JWTAssertion => {
  return <C extends JWTClaims>(jwt: DecodedJWT<C>) => {
    return eqErr('Issuer (iss) claim', exp, jwt.header.alg)
  }
}

// JWTAudAssertion asserts the aud claim
// according to OIDC spec the audience may be a string or an array of strings
export const JWTAudAssertion = (exp: string[] = []): JWTAssertion => {
  return <C extends JWTClaims>(jwt: DecodedJWT<C>) => {
    if (!mustContain(exp, jwt.payload.aud)) {
      return `Audience (aud) claim mismatch: audience (${jwt.payload.aud}) must contain only (${exp})`
    }

    return null
  }
}

// JWTExpAssertion asserts the exp claim
export const JWTExpAssertion = (
  required: boolean = true,
  leeway: number = 40
): JWTAssertion => {
  return <C extends JWTClaims>(jwt: DecodedJWT<C>) => {
    if (!required && !jwt.payload.exp) {
      return null
    }

    if (!isNumber(jwt.payload.exp)) {
      return `Expiration Time (exp) claim must be a present number`
    }

    const exp = _jwtTimeToDate(jwt.payload.exp, leeway)
    const now = new Date(Date.now())
    if (now > exp) {
      return `Expiration Time (exp) claim expired (${exp})`
    }

    return null
  }
}

// JWTNbfAssertion asserts the nbf claim
export const JWTNbfAssertion = (
  required: boolean = true,
  leeway: number = 40
): JWTAssertion => {
  return <C extends JWTClaims>(jwt: DecodedJWT<C>) => {
    if (!required && !jwt.payload.nbf) {
      return null
    }

    if (!isNumber(jwt.payload.nbf)) {
      return `Not Before (nbf) claim must be a present number`
    }

    const nbf = _jwtTimeToDate(jwt.payload.nbf, -1 * leeway)
    const now = new Date(Date.now())
    if (now < nbf) {
      return `Not Before (nbf) claim cannot be used yet, current time (${now}) is before (${nbf})`
    }

    return null
  }
}

// JWTIatAssertion asserts the iat claim
export const JWTIatAssertion = (): JWTAssertion => {
  return <C extends JWTClaims>(jwt: DecodedJWT<C>) => {
    if (!isNumber(jwt.payload.iat)) {
      return `Issued At (iat) claim must be a present number`
    }

    return null
  }
}

// JWTAuthTimeAssertion asserts the auth_time claim
export const JWTAuthTimeAssertion = (
  maxAge: number,
  leeway: number = 40
): JWTAssertion => {
  return <C extends JWTClaims>(jwt: DecodedJWT<C>) => {
    if (!maxAge) {
      return null
    }
    // by spec: When max_age is used, the ID Token returned MUST include an auth_time Claim Value
    if (!isNumber(jwt.payload.auth_time)) {
      return `Authentication Time (auth_time) claim must be a present number`
    }

    const at = _jwtTimeToDate(jwt.payload.auth_time, leeway)
    const ma = _jwtTimeToDate(jwt.payload.auth_time, maxAge + leeway)
    const now = new Date(Date.now())
    if (now > ma) {
      // indicates that too much time has passed since the last end-user authentication. Currrent time (${now}) is after last auth at ${authTimeDate}`
      return `Authentication Time (auth_time) claim indicates that the allowable elapsed time (${maxAge}) has passed since the End-User authentication time (${at})`
    }

    return null
  }
}

const eqErr = (key: string, exp: any, got: any): string | null => {
  if (exp !== got) {
    return `${key} mismatch: expected "${exp}" but got "${got}"`
  }
  return null
}

const _jwtTimeToDate = (n: number, leeway: number = 0): Date => {
  const d = new Date(0)
  d.setUTCSeconds(n + leeway)
  return d
}
