import { base64Decode, base64URLDecode } from './codec'
import { isArrayOfStrings, isString } from './type'
import { DecodedJWT, JWTClaims, JWTHeader } from './types'

export const decode = <Claims extends JWTClaims>(
  token: string
): DecodedJWT<Claims> => {
  const seg = token.split('.')
  const [header, payload, signature] = seg
  if (seg.length !== 3 || !header || !payload || !signature) {
    throw new Error('malformed JWT token.')
  }

  const dp = JSON.parse(base64Decode(base64URLDecode(payload)))

  if (dp.aud) {
    if (isString(dp.aud)) {
      dp.aud = [dp.aud]
    } else if (isArrayOfStrings(dp.aud)) {
    } else {
      throw new Error('Audience (aud) must be a string or an array of strings')
    }
  }

  return {
    header: JSON.parse(base64Decode(base64URLDecode(header))),
    payload: dp,
  }
}

class JWTAssertionsError extends Error {
  private fields_: string[]

  constructor(fields, ...params) {
    super(...params)
    this.fields_ = fields
  }

  getMissingFields() {
    return this.fields_
  }
}

// JWTAssertion performs an assertion of a JWT and returns a possible error
export type JWTAssertion = <C extends JWTClaims>(
  jwt: DecodedJWT<C>
) => string | null

// assert asserts by assertions that a JWT token is valid.
export const assert = <C extends JWTClaims>(
  jwt: DecodedJWT<C>,
  ...assertions: JWTAssertion[]
) => {
  const errs = assertions.map((a) => a(jwt)).filter((v) => v !== null)
  if (errs && errs.length) {
    throw new JWTAssertionsError(errs)
  }

  return null
}
