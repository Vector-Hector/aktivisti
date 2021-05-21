
export function distinctBy<T>(array: T[], fn: (item: T) => any) {
  const distinct: T[] = []
  for (const item of array) {
    if (!distinct.includes(fn(item))) {
      distinct.push(item)
    }
  }
  return distinct
}
