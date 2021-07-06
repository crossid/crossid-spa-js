// CacheOpts are the cache options.
//
// implementations may use this in constructor to define default opts,

import { isObject } from './type'

// methods such put may override default opts.
interface CacheOpts {
  // prefix prefixes all cache keys
  prefix?: string
  // ttl (time to live) in seconds.
  ttl?: number
  // purgeOnInit purges expired entries when cache initialized.
  purgeOnInit?: boolean
}

export interface ICache {
  // set sets an entry in cache with the associated key as its identifier.
  // returns false if there was an error, otherwise true
  set<T = unknown>(key: string, entry: T, opts?: CacheOpts): boolean
  // get retrieves an entry by its key.
  // returns the entry or undefined if no entry is associated with key.
  get<T = unknown>(key: string, opts?: CacheOpts): T | undefined
  // remove removes an entry by its key.
  // returns true if na entry was removed or false if there was an error
  // removing an entry or if no entry was associated with key.
  remove(key: string): boolean
  // purge purges expired items in cache or all if expiredOnly is false. (defaults to true)
  // it is advised by implementations to call this once upon initialization.
  // returns the number of purged items
  purge(all?: boolean): number
}

const wrapWithTTL = <T = unknown>(entry: T, ttl: number): unknown => {
  return ttl && ttl > 0 ? { [APX]: entry, ttl: Date.now() + ttl * 1e3 } : entry
}

const isExpired = (entry: any, ttl: number): boolean => {
  return Date.now() - ttl * 1e3 > entry.ttl
}

const APX = String.fromCharCode(0)

const hasTTL = (entry: Record<string, any>) => {
  return isObject(entry) && APX in entry
}

interface EntryOpts {
  ttl: number
}

interface IStringStorage {
  setItem: (key: string, value: string) => void
  getItem: (key: string) => string | null
  removeItem: (key: string) => void
}

export class StorageStringCache implements ICache {
  private storage: IStringStorage
  constructor(storage: IStringStorage, private gopts: CacheOpts = {}) {
    this.storage = storage
    if (gopts.purgeOnInit) {
      this.purge(true)
    }
  }

  public set<T = unknown>(key: string, entry: T, opts?: EntryOpts): boolean {
    const _key = this._key(key)
    const _ttl = this._ttl(opts?.ttl)

    try {
      let val = wrapWithTTL(entry, _ttl)
      this.storage.setItem(_key, JSON.stringify(val))
      return true
    } catch (e) {
      // stringify may fails due to circular refs
      return false
    }
  }

  public get<T>(key: string, opts?: EntryOpts): T | undefined {
    const _key = this._key(key)

    try {
      const str = this.storage.getItem(_key)

      if (str === null) {
        return undefined
      }

      let item = JSON.parse(str)

      if (!hasTTL(item)) {
        return item
      }

      if (isExpired(item, opts?.ttl || 0)) {
        this.storage.removeItem(key)
        return undefined
      }

      return item[APX]
    } catch (e) {
      return undefined
    }
  }

  public remove(key: string): boolean {
    const _key = this._key(key)
    if (!this.storage.getItem(_key)) {
      return false
    }

    this.storage.removeItem(_key)
    return true
  }

  public purge(all: boolean = false): number {
    let i = 0
    Object.keys(this.storage)
      .filter((key) => key.startsWith(this.gopts.prefix))
      .forEach((key) => {
        const str = this.storage.getItem(key)
        if (!str) return

        let entry
        try {
          entry = JSON.parse(str)
        } catch (e) {
          return
        }
        // purge if ttl was set and expired
        if (
          (isObject(entry) && APX in entry && Date.now() > entry.ttl) ||
          all
        ) {
          i++
          this.storage.removeItem(key)
        }
      })

    return i
  }

  private _key(key: string): string {
    if (!this.gopts.prefix) {
      return key
    }

    return `${this.gopts.prefix}${key}`
  }

  private _ttl(ttl: number): number | null {
    if (ttl === null) {
      return null
    }
    return ttl || this.gopts.ttl || null
  }
}

export class SessionStorageCache extends StorageStringCache {
  constructor(gopts?: CacheOpts) {
    super(sessionStorage, gopts)
    if (typeof sessionStorage === 'undefined') {
      throw Error('no support for session storage.')
    }
  }
}

export class LocalStorageCache extends StorageStringCache {
  constructor(gopts?: CacheOpts) {
    super(localStorage, gopts)
    if (typeof localStorage === 'undefined') {
      throw Error('no support for local storage.')
    }
  }
}

export class InMemoryStorage {
  [x: string]: any

  public getItem(key: string): any {
    if (key in this) {
      return this[key]
    }

    return null
  }

  public setItem(key: string, value: string): void {
    if (typeof value === 'undefined') {
      this.removeItem(key)
    } else {
      this[key] = '' + value
    }
  }

  public removeItem(key: string): void {
    if (this.hasOwnProperty(key)) {
      delete this[key]
    }
  }
}

export class InmemCache extends StorageStringCache {
  constructor(gopts?: CacheOpts) {
    super(new InMemoryStorage(), gopts)
  }
}
