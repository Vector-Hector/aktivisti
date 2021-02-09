export interface APIEnvelope<T, E = any> {
  data: T
  embedded: E
}
