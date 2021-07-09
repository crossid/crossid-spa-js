/**
 * @jest-environment jsdom
 */
import { fetcher } from '../src/http'

describe('fetcher', () => {
  it('success', async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      expect(url).toBe('https://example.com')
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ foo: 'bar' }),
      })
    })

    const res = await (await fetcher('https://example.com')).json()
    expect(res).toStrictEqual({ foo: 'bar' })
  })

  it('timeout', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation((_, opts: { signal: AbortSignal }) => {
        const { signal } = opts
        return new Promise((resolve, rej) => {
          signal.addEventListener('abort', () =>
            rej(new DOMException('The operation was aborted. ', 'AbortError'))
          )

          return setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({ foo: 'bar' }),
            })
          }, 3000)
        })
      })

    return expect(
      fetcher('https://example.com', {
        timeout: 1000,
      })
    ).rejects.toThrowError()
  })
})
