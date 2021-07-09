export interface FetcherOptions extends RequestInit {
  timeout?: number
}

export const fetcher = async (url: string, options: FetcherOptions = {}) => {
  const { timeout = 5000 } = options
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  })
  clearTimeout(id)

  return response
}
