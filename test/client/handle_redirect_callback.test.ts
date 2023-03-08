/**
 * @jest-environment jsdom
 */
import { TextEncoder } from 'util'
import { mockCodeToTokenFetch, setup } from './helper'
import { TokenResponse } from '../../src/api'
global.TextEncoder = TextEncoder

describe('createRedirectURL', () => {
  it('should exchange code with token', async () => {
    let nonce
    const cid = setup()
    const res = await cid.createRedirectURL({ state: { returnTo: '/foo' } })
    const authCodeUrl = new URL(res)
    nonce = authCodeUrl.searchParams.get('nonce')
    const url = new URL('https://myapp')
    url.searchParams.append('code', 'mocked-code')
    global.fetch = await mockCodeToTokenFetch({ nonce })
    expect(await cid.handleLoginRedirectCallback(url)).toEqual({
      state: { returnTo: '/foo' },
    })
    expect(() => cid.handleLoginRedirectCallback(url)).rejects.toThrow(
      'invalid state'
    )
  })

  it('malformed tokens', async () => {
    const tokResp: TokenResponse = {
      access_token: 'TOK',
      id_token: 'IDTOKEN',
      scope: 'openid',
      token_type: 'bearer',
      expires_in: 3600,
    }

    global.fetch = jest.fn().mockImplementation((url) => {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(tokResp),
      })
    })

    const cid = setup()
    await cid.createRedirectURL()
    const url = new URL('https://myapp')
    url.searchParams.append('code', 'mocked-code')
    expect(() => cid.handleLoginRedirectCallback(url)).rejects.toThrow('malformed')
  })
})
