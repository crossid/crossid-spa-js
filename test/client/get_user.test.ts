/**
 * @jest-environment jsdom
 */
import { TextEncoder } from 'util'
import { Crypto } from '@peculiar/webcrypto'
import { mockCodeToTokenFetch, setup } from './helper'
global.crypto = new Crypto()
global.TextEncoder = TextEncoder

describe('getUser', () => {
  const cid = setup()
  it('should not find user in cache', async () => {
    expect(await cid.getUser()).toBeUndefined()
  })

  it('should get user', async () => {
    let nonce
    const res = await cid.createRedirectURL({ state: 'foo' })
    const authCodeUrl = new URL(res)
    nonce = authCodeUrl.searchParams.get('nonce')
    const url = new URL('https://myapp')
    url.searchParams.append('code', 'mocked-code')
    global.fetch = await mockCodeToTokenFetch({ nonce, expiresIn: 1 })
    await cid.handleRedirectCallback(url)
    expect(await cid.getUser()).toHaveProperty(
      'family_name',
      'jared@example.com'
    )
    await new Promise((res) => setTimeout(res, 1100))
    // expired
    expect(await cid.getUser()).toBeUndefined()
  })

  // todo test for different aud / scopes
})
