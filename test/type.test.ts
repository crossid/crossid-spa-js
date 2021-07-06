import { isArrayOfStrings, isNumber, isObject, isString } from '../src/type'

describe('isObject', () => {
  test('valid', () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ foo: 'bar' })).toBe(true)
  })

  test('invalid', () => {
    expect(isObject([])).toBe(false)
    expect(isObject(1)).toBe(false)
    expect(isObject(1.1)).toBe(false)
    expect(isObject('')).toBe(false)
    expect(isObject('foo')).toBe(false)
    expect(isObject(undefined)).toBe(false)
    expect(isObject(null)).toBe(false)
  })
})

describe('isNumber', () => {
  test('valid', () => {
    expect(isNumber(0)).toBe(true)
    expect(isNumber(1)).toBe(true)
    expect(isNumber(1.1)).toBe(true)
  })

  test('invalid', () => {
    expect(isNumber({})).toBe(false)
    expect(isNumber([])).toBe(false)
    expect(isNumber('foo')).toBe(false)
    expect(isNumber(undefined)).toBe(false)
    expect(isNumber(null)).toBe(false)
  })
})

describe('isString', () => {
  test('valid', () => {
    expect(isString('')).toBe(true)
    expect(isString('foo')).toBe(true)
  })

  test('invalid', () => {
    expect(isString({})).toBe(false)
    expect(isString([])).toBe(false)
    expect(isString(0)).toBe(false)
    expect(isString(1)).toBe(false)
    expect(isString(1.1)).toBe(false)
    expect(isString(undefined)).toBe(false)
    expect(isString(null)).toBe(false)
  })
})

describe('isArrayOfString', () => {
  test('valid', () => {
    expect(isArrayOfStrings([])).toBe(true)
    expect(isArrayOfStrings(['foo'])).toBe(true)
    expect(isArrayOfStrings(['foo', 'bar'])).toBe(true)
  })

  test('invalid', () => {
    expect(isArrayOfStrings(['foo', 1])).toBe(false)
    expect(isArrayOfStrings([undefined, 'foo'])).toBe(false)
    expect(isArrayOfStrings(['foo', null])).toBe(false)
    expect(isArrayOfStrings([{}, 'foo'])).toBe(false)
    expect(isArrayOfStrings(['foo', []])).toBe(false)
    expect(isArrayOfStrings({})).toBe(false)
    expect(isArrayOfStrings(0)).toBe(false)
    expect(isArrayOfStrings(1)).toBe(false)
    expect(isArrayOfStrings(1.1)).toBe(false)
    expect(isArrayOfStrings(undefined)).toBe(false)
    expect(isArrayOfStrings(null)).toBe(false)
  })
})
