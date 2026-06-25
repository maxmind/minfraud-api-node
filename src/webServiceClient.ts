import packageInfo from '../package.json' with { type: 'json' };
import { ArgumentError, WebServiceError } from './errors.js';
import Transaction from './request/transaction.js';
import TransactionReport from './request/transaction-report.js';
import * as models from './response/models/index.js';
import { ClientErrorCode } from './types.js';

/** Options for the WebServiceClient constructor */
export interface WebServiceClientOptions {
  /** A custom `fetch` implementation to use for requests. Defaults to the
   *  global `fetch`. This is primarily useful for testing or for routing
   *  requests through a custom dispatcher or proxy. */
  fetcher?: typeof fetch;
  /** The host to use when connecting to the web service. Defaults to
   *  "minfraud.maxmind.com". */
  host?: string;
  /** The timeout in milliseconds. Defaults to 3000. */
  timeout?: number;
}

type servicePath = 'factors' | 'insights' | 'score' | 'transactions/report';

const invalidResponseBody = {
  code: 'INVALID_RESPONSE_BODY',
  error: 'Received an invalid or unparseable response body',
} satisfies { code: ClientErrorCode; error: string };

// Builds a WebServiceError for a client-generated failure. Typing `code` as the
// closed `ClientErrorCode` (rather than the open `WebServiceErrorCode` the
// WebServiceError constructor accepts) makes a typo at a throw site a compile
// error and keeps the `ClientErrorCode` union in sync with what the client
// actually emits.
const clientError = (
  properties: {
    code: ClientErrorCode;
    error: string;
    status?: number;
    url: string;
  },
  options?: { cause?: unknown }
): WebServiceError => new WebServiceError(properties, options);

const isErrorBody = (data: unknown): data is { code: string; error: string } =>
  typeof data === 'object' &&
  data !== null &&
  typeof (data as Record<string, unknown>).code === 'string' &&
  (data as Record<string, unknown>).code !== '' &&
  typeof (data as Record<string, unknown>).error === 'string' &&
  (data as Record<string, unknown>).error !== '';

export default class WebServiceClient {
  private accountID: string;
  private licenseKey: string;
  private host = 'minfraud.maxmind.com';
  private timeout = 3000;
  private fetcher: typeof fetch = fetch;

  /**
   * Instantiates a WebServiceClient.
   *
   * @param accountID The account ID
   * @param licenseKey The license key
   * @param options Additional options. If you pass a number as the third
   *                parameter, it will be treated as the timeout; however,
   *                passing in a number should be considered deprecated and may
   *                be removed in a future major version.
   */
  public constructor(
    accountID: string,
    licenseKey: string,
    // We support a number, which will be treated as the timeout for historical
    // reasons.
    options?: WebServiceClientOptions | number,
    // The constructor previously took a positional `host` here. Reject a fourth
    // argument loudly rather than silently ignoring it (which would route
    // requests to the default host).
    legacyHost?: never
  ) {
    this.accountID = accountID;
    this.licenseKey = licenseKey;
    if (legacyHost !== undefined) {
      throw new ArgumentError(
        'The WebServiceClient constructor no longer accepts a positional ' +
          '`host` argument; pass `{ host }` in the options object instead.'
      );
    }
    // `typeof null === 'object'`, so guard null alongside undefined to avoid
    // dereferencing it in the options branch below.
    if (options === undefined || options === null) {
      return;
    }

    if (typeof options === 'object') {
      if (options.fetcher !== undefined) {
        this.fetcher = options.fetcher;
      }

      if (options.host !== undefined) {
        this.host = options.host;
      }

      if (options.timeout !== undefined) {
        this.timeout = options.timeout;
      }
      return;
    }

    this.timeout = options;
  }

  public factors(transaction: Transaction): Promise<models.Factors> {
    return this.responseFor<models.Factors>(
      'factors',
      transaction.toString(),
      models.Factors
    );
  }

  public insights(transaction: Transaction): Promise<models.Insights> {
    return this.responseFor<models.Insights>(
      'insights',
      transaction.toString(),
      models.Insights
    );
  }

  public score(transaction: Transaction): Promise<models.Score> {
    return this.responseFor<models.Score>(
      'score',
      transaction.toString(),
      models.Score
    );
  }

  public reportTransaction(report: TransactionReport): Promise<void> {
    return this.responseFor<void>('transactions/report', report.toString());
  }

  private responseFor<T>(
    path: servicePath,
    postData: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modelClass?: any
  ): Promise<T>;
  private async responseFor(
    path: servicePath,
    postData: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modelClass?: any
  ): Promise<void> {
    const parsedPath = `/minfraud/v2.0/${path}`;
    const url = `https://${this.host}${parsedPath}`;

    const options: RequestInit = {
      body: postData,
      headers: {
        Accept: 'application/json',
        Authorization: 'Basic ' + btoa(`${this.accountID}:${this.licenseKey}`),
        'Content-Length': Buffer.byteLength(postData).toString(),
        'Content-Type': 'application/json',
        'User-Agent': `minfraud-api-node/${packageInfo.version}`,
      },
      method: 'POST',
      signal: AbortSignal.timeout(this.timeout),
    };

    /*
     We handle two kinds of errors here:
     1. Network errors, such as timeouts or CORS errors.  These will be caught
       by the catch block and rethrown as a WebServiceError.
     2. Errors returned by the MaxMind web service, namely non-200 status codes. These
      will be caught by the handleBadServerResponse method and rethrown/rejected as a
      WebServiceError.
    */
    let response: Response;
    try {
      response = await this.fetcher(url, options);
    } catch (err) {
      const error =
        err instanceof Error || err instanceof DOMException
          ? err
          : new Error(String(err));
      if (error.name === 'TimeoutError') {
        throw clientError(
          {
            code: 'NETWORK_TIMEOUT',
            error: 'The request timed out',
            url,
          },
          { cause: error }
        );
      }
      // Include the underlying cause's message in the error string so the
      // reason (e.g. a DNS or connection failure) is visible to consumers that
      // only log `code`/`error`, not just available via `cause`.
      const causeDetail =
        error.cause instanceof Error ? `: ${error.cause.message}` : '';
      throw clientError(
        {
          code: 'FETCH_ERROR',
          error: `${error.name} - ${error.message}${causeDetail}`,
          url,
        },
        { cause: error }
      );
    }

    if (!response.ok) {
      throw await this.handleBadServerResponse(response, url);
    }

    if (response.status === 204) {
      return;
    }

    let data;
    try {
      data = await response.json();
    } catch (err) {
      throw clientError({ ...invalidResponseBody, url }, { cause: err });
    }

    return new modelClass(data);
  }

  private async handleBadServerResponse(
    response: Response,
    url: string
  ): Promise<WebServiceError> {
    const status = response.status;

    if (status && status >= 500 && status < 600) {
      return clientError({
        code: 'SERVER_ERROR',
        error: `Received a server error with HTTP status code: ${status}`,
        status,
        url,
      });
    }

    if (status && (status < 400 || status >= 600)) {
      return clientError({
        code: 'HTTP_STATUS_CODE_ERROR',
        error: `Received an unexpected HTTP status code: ${status}`,
        status,
        url,
      });
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch (err) {
      return clientError(
        { ...invalidResponseBody, status, url },
        { cause: err }
      );
    }

    if (!isErrorBody(data)) {
      return clientError({ ...invalidResponseBody, status, url });
    }

    return new WebServiceError({
      code: data.code,
      error: data.error,
      status,
      url,
    });
  }
}
