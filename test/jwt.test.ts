/**
 * @jest-environment jsdom
 */
import { assert, decode } from '../src/jwt'
import { DecodedJWT, IDToken, JWTClaims } from '../src/types'
import { TextEncoder } from 'util'
import { createJWT } from './helper'
global.TextEncoder = TextEncoder

describe('decode', () => {
  test('jwt', async () => {
    const h = {
      alg: 'RS256',
      typ: 'JWT',
    }
    const p = {
      iss: 'myorg.crossid.io',
      iat: 1625484280,
      exp: 2540633080,
      aud: ['myorg.com'],
      sub: 'foo@bar.com',
      name: 'Jared Dunn',
      given_name: 'Jared',
      family_name: 'jared@example.com',
    }

    const tok = await createJWT({
      header: h,
      payload: p,
    })

    const jt = decode<IDToken>(tok)
    expect(jt.header).toMatchObject(h)
    expect(jt.payload).toMatchObject(p)
  })

  test('malformed jwt', () => {
    expect(() => decode('foo.bar')).toThrow(Error)
  })
})

describe('verify', () => {
  const as = <C extends JWTClaims>(jwt: DecodedJWT<C>) => {
    if (jwt.payload.iss !== 'foo') {
      return 'mismatch'
    }

    return null
  }

  test('valid', () => {
    expect(
      assert(
        { header: { alg: 'RSA256', typ: 'JWT' }, payload: { iss: 'foo' } },
        as
      )
    ).toBe(null)
  })

  test('mismatch', () => {
    expect(() =>
      assert(
        { header: { alg: 'RSA256', typ: 'JWT' }, payload: { iss: 'bar' } },
        as
      )
    ).toThrow()
  })
})
