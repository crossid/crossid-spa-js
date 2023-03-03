const nodeCrypto = require('crypto')

Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: (arr) => nodeCrypto.randomBytes(arr.length),
    subtle: {
      digest: (
        algorithm: AlgorithmIdentifier,
        data: BufferSource
      ): Promise<ArrayBuffer> => nodeCrypto.subtle.digest(algorithm, data),
    },
  },
})
