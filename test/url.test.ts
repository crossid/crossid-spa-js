import { createQueryString } from '../src/url'

describe('createQueryString', () => {
  it('creates query string', () => {
    expect(
      createQueryString({
        s: 'foo',
        u: 'https://bar.baz',
        ua: ['https://bar.baz1', 'https://bar.baz2'],
        n: 1,
        un: undefined,
        nu: null,
      })
    ).toBe(
      's=foo&u=https%3A%2F%2Fbar.baz&ua=https%3A%2F%2Fbar.baz1%20https%3A%2F%2Fbar.baz2&n=1'
    )
  })
})
