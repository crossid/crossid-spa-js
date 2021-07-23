import { OAuth2Error } from '../src/errors'

describe('errors', () => {
  it('should create error', () => {
    const err = OAuth2Error.create({ error: 'foo', error_description: 'bar' })
    expect(err.error).toBe('foo')
    expect(err.error_description).toBe('bar')
  })
})
