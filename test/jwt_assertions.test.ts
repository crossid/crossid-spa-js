import {
  JWTIssuerAssertion,
  JWTRequiredClaimsAssertion,
  JWTAlgAssertion,
  JWTAudAssertion,
  JWTExpAssertion,
  JWTNbfAssertion,
  JWTIatAssertion,
  JWTAuthTimeAssertion,
  JWTNonceAssertion,
} from '../src/jwt_assertions'
import { IDToken } from '../src/types'

const header = { alg: 'RSA256', typ: 'JWT' }
describe('JWTRequiredClaimsAssertion', () => {
  test('ok', () => {
    const claims: Partial<IDToken> = { iss: 'foo' }
    expect(
      JWTRequiredClaimsAssertion(
        ['alg', 'typ'],
        ['iss']
      )({
        payload: claims,
        header: { alg: 'RSA256', typ: 'JWT' },
      })
    ).toBe(null)
  })

  test('missing claims', () => {
    const claims: Partial<IDToken> = { iss: 'foo' }
    expect(
      JWTRequiredClaimsAssertion(
        [],
        ['sub']
      )({
        payload: claims,
        header: { alg: 'RSA256', typ: 'JWT' },
      })
    ).toContain('sub')
  })
})

describe('JWTIssuerAssertion', () => {
  const payload: Partial<IDToken> = { iss: 'foo' }
  test('match', () => {
    expect(JWTIssuerAssertion('foo')({ payload, header })).toBe(null)
  })

  test('mismatch', () => {
    expect(JWTIssuerAssertion('bar')({ payload, header })).toContain('mismatch')
  })
})

describe('JWTNonceAssertion', () => {
  test('valid', () => {
    expect(
      JWTNonceAssertion('foo')({ payload: { nonce: 'foo' }, header })
    ).toBe(null)
  })

  test('mismatch', () => {
    expect(
      JWTNonceAssertion('foo')({ payload: { nonce: 'bar' }, header })
    ).toContain('mismatch')
  })
})

describe('JWTAlgAssertion', () => {
  test('match', () => {
    expect(JWTAlgAssertion('RSA256')({ payload: {}, header })).toBe(null)
  })

  test('mismatch', () => {
    expect(JWTAlgAssertion('HS256')({ payload: {}, header })).toContain(
      'mismatch'
    )
  })
})

describe('JWTAudAssertion', () => {
  test('match', () => {
    expect(
      JWTAudAssertion(['foo.com', 'bar.com', 'baz.com'])({
        payload: { aud: ['bar.com', 'foo.com'] },
        header,
      })
    ).toBe(null)
  })

  test('mismatch', () => {
    expect(
      JWTAudAssertion(['foo.com', 'bar.com'])({
        payload: { aud: ['foo.com', 'baz.com'] },
        header,
      })
    ).toContain('mismatch')
  })
})

const y2009 = 1246165012
const y2096 = 4001229452

const nowPlusSeconds = (s: number) => {
  return Math.floor(new Date(Date.now() + s * 1e3).getTime() / 1e3)
}

describe('JWTExpAssertion', () => {
  test('valid', () => {
    expect(
      JWTExpAssertion()({
        payload: { exp: y2096 },
        header,
      })
    ).toBe(null)
  })

  test('leeway', () => {
    // expired 60 seconds ago
    const exp = nowPlusSeconds(-60)
    expect(
      JWTExpAssertion(
        true,
        50
      )({
        payload: { exp },
        header,
      })
    ).toContain('expired')

    expect(
      JWTExpAssertion(
        true,
        61
      )({
        payload: { exp },
        header,
      })
    ).toBe(null)
  })

  test('past', () => {
    expect(
      JWTExpAssertion()({
        payload: {},
        header,
      })
    ).toContain('present')
  })

  test('past', () => {
    expect(
      JWTExpAssertion()({
        payload: { exp: y2009 },
        header,
      })
    ).toContain('expired')
  })
})

describe('JWTNbfAssertion', () => {
  test('valid', () => {
    expect(
      JWTNbfAssertion()({
        payload: { nbf: y2009 },
        header,
      })
    ).toBe(null)
  })

  test('futured', () => {
    expect(
      JWTNbfAssertion()({
        payload: { nbf: y2096 },
        header,
      })
    ).toContain('cannot be used yet')
  })

  test('leeway', () => {
    // can be used in 60 seconds ago
    const nbf = nowPlusSeconds(60)
    expect(
      JWTNbfAssertion(
        true,
        50
      )({
        payload: { nbf },
        header,
      })
    ).toContain('cannot be used yet')

    expect(
      JWTNbfAssertion(
        true,
        60
      )({
        payload: { nbf },
        header,
      })
    ).toBe(null)
  })
})

describe('JWTIatAssertion', () => {
  test('present', () => {
    expect(
      JWTIatAssertion()({
        payload: { iat: y2009 },
        header,
      })
    ).toBe(null)
  })

  test('missing', () => {
    expect(
      JWTIatAssertion()({
        payload: {},
        header,
      })
    ).toContain('must be a present')
  })
})

describe('JWTAuthTimeAssertion', () => {
  test('valid', () => {
    expect(
      JWTAuthTimeAssertion(100)({
        // token issued now
        payload: { auth_time: nowPlusSeconds(0) },
        header,
      })
    ).toBe(null)
  })

  test('allowable elapsed time has passed', () => {
    expect(
      JWTAuthTimeAssertion(
        60,
        0
      )({
        // token issued 120 seconds ago
        payload: { auth_time: nowPlusSeconds(-120) },
        header,
      })
    ).toContain('elapsed')
  })

  test('valid by leeway', () => {
    expect(
      JWTAuthTimeAssertion(
        60,
        61
      )({
        // token issued 120 seconds ago
        payload: { auth_time: nowPlusSeconds(-120) },
        header,
      })
    ).toBe(null)
  })
})
