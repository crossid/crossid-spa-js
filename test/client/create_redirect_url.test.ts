/**
 * @jest-environment jsdom
 */
import {
  TEST_AUTHORIZATION_ENDPOINT,
  TEST_CLIENT_ID,
  TEST_REDIRECT_URI,
} from './const'
import { TextEncoder } from 'util'
import { Crypto } from '@peculiar/webcrypto'
import { assertURLSearchParams, setup } from './helper'
global.crypto = new Crypto()
global.TextEncoder = TextEncoder

describe('handleRedirectCallback', () => {
  it('should exchange a code with a token', async () => {
    const cid = setup()
    const urls = await cid.createRedirectURL()
    const url = new URL(urls)
    expect(url.href).toMatch(new RegExp(`^${TEST_AUTHORIZATION_ENDPOINT}Z\?`))
    expect(url.searchParams.get('nonce').length).toBeGreaterThanOrEqual(48)
    expect(url.searchParams.get('state').length).toBeGreaterThanOrEqual(48)
    expect(
      url.searchParams.get('code_challenge').length
    ).toBeGreaterThanOrEqual(40)
    assertURLSearchParams(url, {
      client_id: TEST_CLIENT_ID,
      response_type: 'code',
      redirect_uri: TEST_REDIRECT_URI,
      code_challenge_method: 'S256',
    })
  })
})
