/**
 * @jest-environment jsdom
 */
import {
  ICache,
  InmemCache,
  LocalStorageCache,
  SessionStorageCache,
} from '../src/cache'

export const commonServiceTests = (name: string, c: ICache, ce: ICache) => {
  afterEach(() => {
    c.purge(true)
    ce.purge(true)
  })

  describe(`Cache :: ${name} - no global ttl`, () => {
    it('get() with non-existent key should return undefined', () => {
      expect(c.get('none')).toBe(undefined)
    })

    it('set() with/without ttl should return true', () => {
      expect(c.set('some_key', 'some_value')).toBe(true)
      expect(c.set('some_key1', 'some_value1', { ttl: 3 })).toBe(true)
    })

    it('should able to get() after set() without ttl', () => {
      const foo = { foo: 'bar' }
      expect(c.set('foo', foo)).toBe(true)
      expect(c.get('foo')).toMatchObject(foo)
    })

    it('should be able to get() after set() with scoped ttl', async () => {
      const foo = { foo: 'bar' }
      expect(c.set('foo', foo, { ttl: 0.5 })).toBe(true)
      expect(c.get('foo')).toMatchObject(foo)
      await new Promise((res) => setTimeout(res, 510))
      expect(c.get('foo')).toBe(undefined)
    })

    it('should purge() expired only', async () => {
      const foo = { foo: 'bar' }
      c.set('foo', foo, { ttl: 0.3 })
      expect(c.purge()).toBe(0)
      expect(c.get('foo')).toMatchObject(foo)
      await new Promise((res) => setTimeout(res, 310))
      expect(c.purge()).toBe(1)
      expect(c.purge()).toBe(0)
    })

    it('should purge() all', async () => {
      const foo = { foo: 'bar' }
      c.set('foo', foo, { ttl: 0.3 })
      expect(c.purge(true)).toBe(1)
    })
  })

  describe(`Cache :: ${name} - with global ttl`, () => {
    it('check global ttl', async () => {
      const foo = { foo: 'bar' }
      expect(ce.set('foo', foo)).toBe(true)
      expect(ce.get('foo')).toMatchObject(foo)
      await new Promise((res) => setTimeout(res, 600))
      expect(ce.get('foo')).toBe(undefined)
    })

    it('local ttl should take precedence over global ttl', async () => {
      const foo = { foo: 'bar' }
      expect(ce.set('foo', foo, { ttl: 1 })).toBe(true)
      await new Promise((res) => setTimeout(res, 900))
      expect(ce.get('foo')).toMatchObject(foo)
      await new Promise((res) => setTimeout(res, 200))
      expect(ce.get('foo')).toBe(undefined)
    })

    it('disable ttl for specific entry when global ttl is enabled', async () => {
      ce.set('foo', 'bar', { ttl: null })
      expect(ce.get('foo')).toBe('bar')
      // wait global ttl
      await new Promise((res) => setTimeout(res, 600))
      expect(ce.get('foo')).toBe('bar')
    })
  })
}

commonServiceTests(
  'session',
  new SessionStorageCache({ prefix: 'test1_' }),
  new SessionStorageCache({ prefix: 'test2_', ttl: 0.5 })
)

commonServiceTests(
  'localStorage',
  new LocalStorageCache({ prefix: 'test3_' }),
  new LocalStorageCache({ prefix: 'test4_', ttl: 0.5 })
)

commonServiceTests(
  'inmem',
  new InmemCache({ prefix: 'test5_' }),
  new InmemCache({ prefix: 'test6_', ttl: 0.5 })
)

describe('session storage', () => {
  test('items should not/be purged on init', async () => {
    let c = new SessionStorageCache({ prefix: 'test3_' })
    c.set('foo', {}, { ttl: 0.1 })
    await new Promise((res) => setTimeout(res, 110))
    c = new SessionStorageCache({ prefix: 'test3_' })
    expect(c.purge()).toBe(1)
    c.set('foo', {}, { ttl: 0.2 })
    await new Promise((res) => setTimeout(res, 210))
    c = new SessionStorageCache({ prefix: 'test3_', purgeOnInit: true })
    expect(c.purge()).toBe(0)
  })
})
