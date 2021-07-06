import { dedup, mustContain } from '../src/string'

describe('dedup', () => {
  it('dedup array of strings', () => {
    expect(dedup(['foo', 'bar', 'foo', 'baz', 'bar'])).toStrictEqual([
      'foo',
      'bar',
      'baz',
    ])
  })
})

describe('mustContain', () => {
  test('contained', () => {
    expect(mustContain(['foo', 'bar', 'baz'], ['bar', 'foo'])).toBe(true)
  })
  test('equals', () => {
    expect(mustContain(['foo', 'bar', 'baz'], ['bar', 'foo', 'baz'])).toBe(true)
  })
  test('not', () => {
    expect(mustContain(['foo', 'bar', 'baz'], ['bar', 'foo', 'other'])).toBe(
      false
    )
  })
})
