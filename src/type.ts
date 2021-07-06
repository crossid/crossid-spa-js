export const isObject = (v: any): boolean => {
  return v !== null && v?.constructor.name === 'Object'
}

export const isNumber = (v: any) => typeof v === 'number'

export const isString = (v: any) => typeof v === 'string'

export const isArrayOfStrings = (a: any): boolean => {
  return Array.isArray(a) && a.every((v) => isString(v))
}
