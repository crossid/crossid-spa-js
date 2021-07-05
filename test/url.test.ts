import { createQueryString } from '../src/url'

describe('createQueryString', () => {
  it('creates query string', () => {
    expect(
      createQueryString({
        s: 'foo',
        u: 'https://bar.baz',
        n: 1,
        un: undefined,
        nu: null,
      })
    ).toBe('s=foo&u=https%3A%2F%2Fbar.baz&n=1')
  })
})
