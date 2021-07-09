/**
 * A generic error that conforms [rfc6749] OAuth2 error.
 *
 * see https://datatracker.ietf.org/doc/html/rfc6749#section-5.2
 */
export class OAuth2Error extends Error {
  constructor(public error: string, public error_description: string) {
    super(error_description)

    Object.setPrototypeOf(this, OAuth2Error.prototype)
  }

  static create({
    error,
    error_description,
  }: {
    error: string
    error_description: string
  }) {
    return new OAuth2Error(error, error_description)
  }
}
