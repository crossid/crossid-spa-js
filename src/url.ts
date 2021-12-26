// createQueryString maps qp into an encoded URL query string.
export const createQueryString = (qp: object) => {
  return Object.keys(qp)
    .filter((k) => qp[k] !== undefined && qp[k] !== null)
    .map(
      (k) =>
        encodeURIComponent(k) +
        '=' +
        encodeURIComponent(Array.isArray(qp[k]) ? qp[k].join(' ') : qp[k])
    )
    .join('&')
}
