export interface Pagination {
  limit: number
  total: number
  offset: number
}

export interface APIEnvelope<T, E = any> {
  data: T
  embedded: E
  pagination?: Pagination
}
