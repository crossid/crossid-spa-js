export const base64Encode = (value: string) => btoa(value)

export const base64Decode = (value: string) => atob(value)

// base64URLEncode takes b64str as a base64 string and make it URL safe
//
// base64 strings may contain "+", "=" and "/" chars which are not url friendly.
export const base64URLEncode = (b64str: string) => {
  const charsToReplace: { [index: string]: string } = {
    '+': '-',
    '/': '_',
    // trims =
    '=': '',
  }
  return b64str.replace(/[+/=]/g, (m: string) => charsToReplace[m])
}

// base64URLDecode performs the opposite of base64URLEncode
export const base64URLDecode = (input: string) => {
  const b64Chars: { [index: string]: string } = { '-': '+', _: '/' }
  return input.replace(/[-_]/g, (m: string) => b64Chars[m])
}

export const bufferToBase64URLEncode = (input: number[] | Uint8Array) => {
  return base64URLEncode(
    base64Encode(String.fromCharCode(...Array.from(input)))
  )
}
