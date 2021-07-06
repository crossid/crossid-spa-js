/**
 * @jest-environment jsdom
 */
import {
  base64Encode,
  base64Decode,
  base64URLEncode,
  base64URLDecode,
  bufferToBase64URLEncode,
} from '../src/codec'
import { TextEncoder } from 'util'
global.TextEncoder = TextEncoder

describe('base64Encode', () => {
  it('encode string to base64', () => {
    expect(base64Encode('foobar')).toBe('Zm9vYmFy')
  })
})

describe('base64Decode', () => {
  it('decode string to base64', () => {
    expect(base64Decode('Zm9vYmFy')).toBe('foobar')
  })
})

describe('base64URLEncode', () => {
  it('url encode a base64 string', () => {
    expect(base64URLEncode('a+b/z==')).toBe('a-b_z')
  })
})

describe('base64URLDecode', () => {
  it('url encode a base64 string', () => {
    const d = 'a+b/z'
    expect(base64URLDecode(base64URLEncode(d))).toBe(d)
  })
})

describe('bufferToBase64URLEncode', () => {
  it('url encode a base64 buffer', () => {
    const buf = Uint8Array.from('foobar', (x) => x.charCodeAt(0))
    expect(bufferToBase64URLEncode(buf)).toBe('Zm9vYmFy')
  })
})
