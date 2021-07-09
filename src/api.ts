import { OAuth2Error } from './errors'
import { fetcher } from './http'

// WellKnownResponse describes an OIDC well known configuration.
interface WellKnownResponse {
  authorization_endpoint: string
  token_endpoint: string
  issuer: string
}

// WellKnown fetch an OIDC well known configuration.
export async function WellKnown({
  wellknown_endpoint,
}: {
  wellknown_endpoint: string
}): Promise<WellKnownResponse> {
  const r = await fetch(wellknown_endpoint)
  if (r.status === 200) {
    const jr = await r.json()
    return jr as WellKnownResponse
  }

  throw Error('failed to discover data from well known discovery endpoint.')
}

export interface TokenRequest {
  tokenEndpoint: string
  client_id: string
  code: string
  code_verifier: string
  grant_type: string
  redirect_uri: string
  timeout?: number
}

export interface TokenResponse {
  access_token: string
  id_token: string
  scope: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

export async function TokenEndpoint({
  tokenEndpoint,
  timeout,
  ...opts
}: TokenRequest): Promise<TokenResponse> {
  let formData = new FormData()
  Object.keys(opts).forEach((k) => formData.append(k, opts[k]))

  const resp = await fetcher(tokenEndpoint, {
    timeout,
    method: 'POST',
    body: formData,
  })

  const json = await resp.json()

  if (resp.status !== 200) {
    throw OAuth2Error.create(json)
  }

  return json as TokenResponse
}
