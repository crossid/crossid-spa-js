/**
 * @jest-environment jsdom
 */
import { TEST_LOGOUT_ENDPOINT } from './const'
import { TextEncoder } from 'util'
import { Crypto } from '@peculiar/webcrypto'
import { assertURLSearchParams, mockCodeToTokenFetch, setup } from './helper'
import CrossidClient from '../../src/client'
import { SessionStorageCache } from '../../src/cache'
import { LogoutState } from '../../src/types'
import { LOGOUT_STATE_KEY } from '../../src/const'
global.crypto = new Crypto()
global.TextEncoder = TextEncoder

describe('createLogoutRedirectURL', () => {
  let cid: CrossidClient
  beforeEach(async () => {
    cid = setup({ cache_type: 'local_storage' })
    const res = await cid.createRedirectURL({ state: 'foo' })
    const authCodeUrl = new URL(res)
    const loginURL = new URL('https://myapp')
    loginURL.searchParams.append('code', 'mocked-code')
    global.fetch = await mockCodeToTokenFetch({
      nonce: authCodeUrl.searchParams.get('nonce'),
    })
    await cid.handleRedirectCallback(loginURL)

    // login assertions
    //
    expect(await cid.getUser()).toBeDefined()
    expect(await cid.getAccessToken()).toBeDefined()
  })

  it('should create a global logout URL and wipe all tokens from cache when id_token_hint=null', async () => {
    // logout
    //
    const u = await cid.createLogoutRedirectURL({ id_token_hint: null })
    const logoutURL = new URL(u)

    // logout assertions
    // url should be global (no id_token_hint, ...) when id_token=null
    expect(logoutURL.href).toBe(TEST_LOGOUT_ENDPOINT)
    // id token and access token should be wiped out from cache immediately
    expect(await cid.getUser()).toBeUndefined()
    expect(await cid.getAccessToken()).toBeUndefined()
  })

  it('should create a url for a client specific and wipe out all tokens from cache', async () => {
    // logout
    //
    const plru = 'https://myorg.com/logout'
    const u = await cid.createLogoutRedirectURL({
      post_logout_redirect_uri: plru,
      state: 'foobar',
    })
    // should not remove tokens from cache
    expect(await cid.getAccessToken()).toBeDefined()
    expect(await cid.getUser()).toBeDefined()

    const lurl = new URL(u)
    expect(lurl.origin + lurl.pathname).toBe(TEST_LOGOUT_ENDPOINT)
    expect(lurl.searchParams.has('id_token_hint')).toBeTruthy()
    expect(lurl.searchParams.has('state')).toBeTruthy()
    expect(lurl.searchParams.get('post_logout_redirect_uri')).toBe(plru)

    const c = new SessionStorageCache()
    const lss = c.get<LogoutState>(LOGOUT_STATE_KEY)
    expect(lss).toBeDefined()
    const st = lss.state
    expect(st).toBeDefined()

    const callbackURL = new URL(plru)
    callbackURL.searchParams.append('state', st)
    const logoutResponse = await cid.handleLogoutRedirectCallback(callbackURL)
    expect(logoutResponse.state).toBe('foobar')

    // should not remove tokens from cache
    expect(await cid.getAccessToken()).toBeUndefined()
    expect(await cid.getUser()).toBeUndefined()
  })

  it('handleLogoutRedirectCallback should fail with no state', () => {
    const callbackURL = new URL('https://myorg.com/logout')
    expect(cid.handleLogoutRedirectCallback(callbackURL)).rejects.toThrow()
  })

  it('handleLogoutRedirectCallback should fail with wrong state', async () => {
    const callbackURL = new URL('https://myorg.com/logout')
    callbackURL.searchParams.append('state', 'foo')
    expect(cid.handleLogoutRedirectCallback(callbackURL)).rejects.toThrow()
  })
})
