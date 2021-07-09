import { WellKnown } from '../src/api'

describe('WellKnown', () => {
  test('valid', async () => {
    const wne = {
      authorization_endpoint: 'https://auth',
      token_endpoint: 'https://token',
      issuer: 'https://issuer',
    }

    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(wne),
      })
    })

    const wn = await WellKnown({
      wellknown_endpoint: 'https://myorg.crossid.io',
    })
    expect(wn).toBe(wne)
  })

  test('error', () => {
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      })
    })

    expect(() =>
      WellKnown({
        wellknown_endpoint: 'https://myorg.crossid.io',
      })
    ).rejects.toThrow()
  })
})
