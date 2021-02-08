export interface APIEnvelope<T, E = undefined> {
  data: T
  embedded: E
}
