export function appendAsQueryParams(url: URL, object: any) {
  for (const [key, value] of Object.entries(object)) {

    if (Array.isArray(value)) {
      value.forEach(item => url.searchParams.append(key, item))
    } else {
      url.searchParams.append(key, value as string)
    }
  }
}
