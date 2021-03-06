/**
 * @jest-environment jsdom
 */
import { TextEncoder } from 'util'
import { Crypto } from '@peculiar/webcrypto'
import { mockCodeToTokenFetch, setup } from './helper'
global.crypto = new Crypto()
global.TextEncoder = TextEncoder

describe('introspectAccessToken', () => {
  const cid = setup()
  it('should not find access token in cache', async () => {
    expect(await cid.getAccessToken()).toBeUndefined()
  })

  it('should introspect access token', async () => {
    let nonce
    const res = await cid.createRedirectURL({ state: 'foo' })
    const authCodeUrl = new URL(res)
    nonce = authCodeUrl.searchParams.get('nonce')
    const url = new URL('https://myapp')
    url.searchParams.append('code', 'mocked-code')
    global.fetch = await mockCodeToTokenFetch({ nonce, expiresIn: 1 })
    await cid.handleRedirectCallback(url)
    const claims = await cid.introspectAccessToken()
    expect(claims).toBeDefined()
    expect(claims.aud).toEqual(['myorg.com'])
    await new Promise((res) => setTimeout(res, 1100))
    expect(await cid.introspectAccessToken()).toBeUndefined()
  })

  // todo test for different aud / scopes
})
