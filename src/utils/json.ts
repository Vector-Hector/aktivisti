export function parseIfPossible(
  str: string | null
): Record<string, any> | null {
  if (str === null) {
    return null
  }
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}
