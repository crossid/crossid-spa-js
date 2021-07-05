import { uniqueScopes } from '../src/scope'

describe('uniqueScopes', () => {
  it('unique scopes string', () => {
    expect(uniqueScopes('foo bar', 'foo')).toBe('foo bar')
  })

  it('handle null undefined and whitespaces)', () => {
    expect(uniqueScopes(' foo    bar  ', undefined, '  ', null)).toBe('foo bar')
  })
})
