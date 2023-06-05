export interface Pagination {
  limit?: number
  total?: number
  offset?: number
}

type HttpOperation = 'GET' | 'PATCH' | 'POST' | 'PUT' | 'DELETE'

export type HttpOperationPermissions = {
  [httpOperation in HttpOperation]: boolean
}

export interface PermissionHintsDto {
  self: HttpOperationPermissions
  [operation: string]: HttpOperationPermissions
}
export interface APIEnvelope<T, E = any> {
  data: T
  embedded: E
  pagination?: Pagination
  permissions: PermissionHintsDto
}
