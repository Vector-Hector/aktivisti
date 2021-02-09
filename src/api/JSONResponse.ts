/**
 * Class to contain both the raw `fetch` response and the parsed JSON response with type T
 * @template T DTO type for the parsed payload
 */
export class JSONResponse<T> {

  /**
   * Default constructor
   * @param response raw response as returned from fetch
   * @param payload parsed JSON payload of type `T`
   */
  constructor(public response: Response, public payload: T) {
  }
}
