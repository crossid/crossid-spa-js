import { JWTClaims, JWTHeader } from '../src/types'
import * as jwt from 'jsonwebtoken'
import * as pem from 'pem'

interface Cert {
  cert: string
  publicKey: string
  serviceKey: string
}

const createCert = (): Promise<Cert> =>
  new Promise((res, rej) => {
    pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
      if (err) {
        return rej(err)
      }

      pem.getPublicKey(keys.certificate, function (err, p) {
        if (err) {
          return rej(err)
        }
        res({
          serviceKey: keys.serviceKey,
          cert: keys.certificate,
          publicKey: p.publicKey,
        })
      })
    })
  })

export const createJWT = async <C extends JWTClaims>({
  header,
  payload,
  expiresIn,
}: {
  header: JWTHeader
  payload: C
  expiresIn?: number
}) => {
  const cert = await createCert()
  let opts: any = {
    algorithm: header.alg,
  }
  if (expiresIn) {
    opts.expiresIn = expiresIn
  }
  return jwt.sign(payload, cert.serviceKey, opts)
}
