/**
 * Class to contain both the raw `axios` response and the parsed JSON response with type T
 * @template T DTO type for the parsed payload
 */

import { AxiosResponse } from 'axios'

export class JSONResponse<T> {

  /**
   * Default constructor
   * @param response raw response as returned from axios
   * @param payload parsed JSON payload of type `T`
   */
  constructor(public response: AxiosResponse, public payload: T) {
  }
}
