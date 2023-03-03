import { JWTClaims, JWTHeader } from '../src/types'
import * as jwt from 'jsonwebtoken'
import { generateKeyPairSync } from 'crypto'

interface Cert {
  cert: string
  publicKey: string
  serviceKey: string
}

const createPrivateKey = () => {
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  })
  const pkey = privateKey.export({
    format: 'pem',
    type: 'pkcs8',
  })
  return pkey
}

export const createJWT = async <C extends JWTClaims>({
  header,
  payload,
  expiresIn,
}: {
  header: JWTHeader
  payload: C
  expiresIn?: number
}) => {
  const key = createPrivateKey()
  let opts: any = {
    algorithm: header.alg,
  }
  if (expiresIn) {
    opts.expiresIn = expiresIn
  }
  return jwt.sign(payload, key, opts)
}
