export interface APIResponse<T, E = undefined> {
  data: T
  embedded: E
}
