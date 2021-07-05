import { dedup } from '../src/string'

describe('dedup', () => {
  it('dedup array of strings', () => {
    expect(dedup(['foo', 'bar', 'foo', 'baz', 'bar'])).toStrictEqual([
      'foo',
      'bar',
      'baz',
    ])
  })
})
