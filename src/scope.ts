import { dedup } from './string'

/**
 * uniqueScopes dedup and joins scopes as a string.
 * @param scopes an array of scopes with possible duplications.
 * @returns a string containing a space separated unique scopes
 */
export const uniqueScopes = (...scopes: string[]) => {
  return dedup(scopes.join(' ').trim().split(/\s+/))
}
