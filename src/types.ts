export interface WebServiceClientError {
  code: string;
  error: string;
  status?: number;
  url: string;
  /**
   * The underlying error that caused this one, when available (for example,
   * the network error behind a `FETCH_ERROR`).
   */
  cause?: unknown;
}
