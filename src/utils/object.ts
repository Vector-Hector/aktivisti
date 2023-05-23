import { each, isObject } from 'lodash-es'

export function objDiff(a: Record<string, any>, b: Record<string, any>) {
  const r: Record<string, any> = {}
  each(a, function (v, k) {
    if (b[k] === v) return
    // but what if it returns an empty object? still attach?
    r[k] = isObject(v) ? objDiff(v, b[k]) : v
  })
  return r
}
