export const isObject = (item: any): boolean => {
  return item !== null && item.constructor.name === 'Object'
}
