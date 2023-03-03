/**
 * @jest-environment jsdom
 */
import { TextEncoder } from 'util'
import { mockCodeToTokenFetch, setup } from './helper'
global.TextEncoder = TextEncoder

describe('getAccessToken', () => {
  const cid = setup()
  it('should not find access token in cache', async () => {
    expect(await cid.getAccessToken()).toBeUndefined()
  })

  it('should get access token', async () => {
    let nonce
    const res = await cid.createRedirectURL({ state: 'foo' })
    const authCodeUrl = new URL(res)
    nonce = authCodeUrl.searchParams.get('nonce')
    const url = new URL('https://myapp')
    url.searchParams.append('code', 'mocked-code')
    global.fetch = await mockCodeToTokenFetch({ nonce, expiresIn: 1 })
    await cid.handleRedirectCallback(url)
    expect(await cid.getAccessToken()).toBeDefined()
    await new Promise((res) => setTimeout(res, 1100))
    // expired
    expect(await cid.getAccessToken()).toBeUndefined()
  })

  // todo test for different aud / scopes
})
