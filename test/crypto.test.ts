/**
 * @jest-environment jsdom
 */
import { generateRandomString, sha256 } from '../src/crypto'
// pollyfils
import { Crypto } from '@peculiar/webcrypto'
import { TextEncoder } from 'util'
global.crypto = new Crypto()
global.TextEncoder = TextEncoder

describe('sha256', () => {
  test('generate digest of a string', async () => {
    const buf1 = await sha256('foo')
    const buf2 = await sha256('foo')
    const buf3 = await sha256('bar')
    expect(buf1.byteLength).toBe(32)
    expect(equal(buf1, buf2)).toBe(true)
    expect(equal(buf1, buf3)).toBe(false)
  })
})

describe('generateRandomString', () => {
  test('generate random string', () => {
    const r = generateRandomString('0123', 10)
    expect(r).toMatch(/^[0123]{10}$/g)
  })

  test('two random strings should not match', () => {
    const cs = '01234567890'
    expect(generateRandomString(cs, 100)).not.toBe(
      generateRandomString(cs, 100)
    )
  })
})

function equal(buf1, buf2) {
  if (buf1.byteLength != buf2.byteLength) return false
  var dv1 = new Int8Array(buf1)
  var dv2 = new Int8Array(buf2)
  for (var i = 0; i != buf1.byteLength; i++) {
    if (dv1[i] != dv2[i]) return false
  }
  return true
}
