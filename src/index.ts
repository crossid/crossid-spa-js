import { WellKnown } from './api'
import Client, {
  ClientCrossidOpts,
  ClientDiscoveryOpts,
  ClientOpts,
} from './client'
import { CROSSID_DEFAULT_AUTHORIZATION_SERVER } from './const'

import { IDToken } from './types'

/**
 * Creates a new client by a crossid tenant.
 * Should be used if you have a registered tenant at crossid.io
 *
 * @param opts
 * @returns
 */
export async function newCrossidClient(opts: ClientCrossidOpts) {
  let {
    tenant_id,
    auth_server = CROSSID_DEFAULT_AUTHORIZATION_SERVER,
    ...other
  } = opts
  const copts = other as ClientOpts
  const wn = await WellKnown({
    wellknown_endpoint: `https://${tenant_id}.crossid.io/oauth2/${auth_server}/.well-known/openid-configuration`,
  })
  copts.authorization_endpoint = wn.authorization_endpoint
  copts.token_endpoint = wn.token_endpoint
  copts.issuer = wn.issuer
  const client = new Client(copts)
  return client
}

/**
 * Creates a new client using OIDC well-known configuration endpoint.
 * Should be used by an authorization server that exposes the [OIDC well-known endpoint](https://openid.net/specs/openid-connect-discovery-1_0.html)
 *
 * @param opts
 * @returns
 */
export async function newCrossidClientByDiscovery(opts: ClientDiscoveryOpts) {
  const wn = await WellKnown(opts)
  let { wellknown_endpoint: wellKnownEndpoint, ...other } = opts
  const copts = other as ClientOpts
  copts.authorization_endpoint = wn.authorization_endpoint
  copts.token_endpoint = wn.token_endpoint
  copts.issuer = wn.issuer

  const crossid = new Client(copts)
  return crossid
}

/**
 * Creates a new client that is configured manually.
 *
 * @param opts
 * @returns
 */
export async function newCrossidClientCustom(opts: ClientOpts) {
  const crossid = new Client(opts)
  return crossid
}

export { Client, IDToken }
