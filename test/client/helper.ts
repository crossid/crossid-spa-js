import { TokenResponse } from '../../src/api'
import CrossidClient, { ClientOpts } from '../../src/client'
import { IDToken } from '../../src/types'
import { createJWT } from '../helper'
import {
  TEST_AUDIENCE,
  TEST_AUTHORIZATION_ENDPOINT,
  TEST_CLIENT_ID,
  TEST_ISSUER,
  TEST_LOGOUT_ENDPOINT,
  TEST_REDIRECT_URI,
  TEST_SCOPE,
  TEST_TOKEN_ENDPOINT,
} from './const'

export const createSetup = () => {
  return (opts?: Partial<ClientOpts>, claims?: Partial<IDToken>) => {
    const cl = new CrossidClient({
      authorization_endpoint: TEST_AUTHORIZATION_ENDPOINT,
      token_endpoint: TEST_TOKEN_ENDPOINT,
      logout_endpoint: TEST_LOGOUT_ENDPOINT,
      client_id: TEST_CLIENT_ID,
      issuer: TEST_ISSUER,
      authorizationOpts: {
        redirect_uri: TEST_REDIRECT_URI,
        audience: TEST_AUDIENCE,
        scope: TEST_SCOPE,
        ...opts,
      },
    })

    return cl
  }
}

export const setup = createSetup()

export const assertURLSearchParams = (url: URL, qp: Record<string, string>) => {
  for (let [k, v] of Object.entries(qp)) {
    expect(url.searchParams.get(k)).toEqual(v)
  }
}

export interface mockCodeToTokenFetchOpts {
  nonce: string
  expiresIn?: number
}

export const mockCodeToTokenFetch = async (opts: mockCodeToTokenFetchOpts) => {
  return jest.fn().mockImplementation(async () => {
    const h = {
      alg: 'RS256',
      typ: 'JWT',
    }

    const id_token = await createJWT({
      header: h,
      payload: {
        iss: TEST_ISSUER,
        aud: [TEST_CLIENT_ID],
        sub: 'foo@bar.com',
        name: 'Jared Dunn',
        given_name: 'Jared',
        family_name: 'jared@example.com',
        nonce: opts.nonce,
      },
      expiresIn: opts.expiresIn || 3600,
    })

    const access_token = await createJWT({
      header: h,
      payload: {
        iss: TEST_ISSUER,
        aud: TEST_AUDIENCE,
        nbf: 1625484280,
        sub: 'foo@bar.com',
        scp: [TEST_SCOPE],
      },
      expiresIn: opts.expiresIn || 3600,
    })

    const tokResp: TokenResponse = {
      access_token,
      id_token,
      scope: 'openid',
      token_type: 'bearer',
      expires_in: 3600,
    }

    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(tokResp),
    })
  })
}
