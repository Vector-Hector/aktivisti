/**
 * Helper function that will take an object and append the values as search parameters to a provided URL
 * @param url URL object that should get the query params
 * @param object an object where the key will be the query parameter name and the value, the respective value. Values also might be arrays
 */
export function appendAsQueryParams(url: URL, object: any) {
  for (const [key, value] of Object.entries(object)) {
    if (value === undefined) {
      continue
    }
    if (Array.isArray(value)) {
      // if it's an array append each item for the particular key
      value.forEach(item => url.searchParams.append(key, item))
    } else {
      url.searchParams.append(key, value as string)
    }
  }
}
