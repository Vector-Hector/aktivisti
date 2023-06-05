export function distinctBy<T>(array: T[], fn: (item: T) => any) {
  const distinct: T[] = []
  for (const item of array) {
    if (!distinct.map(fn).includes(fn(item))) {
      distinct.push(item)
    }
  }
  return distinct
}

export function includesOneOf<T>(array: T[], items: T[]) {
  for (const item of items) {
    if (array.includes(item)) {
      return true
    }
  }
  return false
}
