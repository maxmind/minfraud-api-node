import packageInfo from '../package.json' with { type: 'json' };
import { WebServiceError } from './errors.js';
import Transaction from './request/transaction.js';
import TransactionReport from './request/transaction-report.js';
import * as models from './response/models/index.js';

type servicePath = 'factors' | 'insights' | 'score' | 'transactions/report';

const invalidResponseBody = {
  code: 'INVALID_RESPONSE_BODY',
  error: 'Received an invalid or unparseable response body',
};

const isErrorBody = (data: unknown): data is { code: string; error: string } =>
  typeof data === 'object' &&
  data !== null &&
  typeof (data as Record<string, unknown>).code === 'string' &&
  (data as Record<string, unknown>).code !== '' &&
  typeof (data as Record<string, unknown>).error === 'string' &&
  (data as Record<string, unknown>).error !== '';

export default class WebServiceClient {
  private accountID: string;
  private host: string;
  private licenseKey: string;
  private timeout: number;

  public constructor(
    accountID: string,
    licenseKey: string,
    timeout = 3000,
    host = 'minfraud.maxmind.com'
  ) {
    this.accountID = accountID;
    this.licenseKey = licenseKey;
    this.timeout = timeout;
    this.host = host;
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
      response = await fetch(url, options);
    } catch (err) {
      const error =
        err instanceof Error || err instanceof DOMException
          ? err
          : new Error(String(err));
      if (error.name === 'TimeoutError') {
        throw new WebServiceError(
          {
            code: 'NETWORK_TIMEOUT',
            error: 'The request timed out',
            url,
          },
          { cause: error }
        );
      }
      throw new WebServiceError(
        {
          code: 'FETCH_ERROR',
          error: `${error.name} - ${error.message}`,
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
      throw new WebServiceError(
        { ...invalidResponseBody, url },
        { cause: err }
      );
    }

    return new modelClass(data);
  }

  private async handleBadServerResponse(
    response: Response,
    url: string
  ): Promise<WebServiceError> {
    const status = response.status;

    if (status && status >= 500 && status < 600) {
      return new WebServiceError({
        code: 'SERVER_ERROR',
        error: `Received a server error with HTTP status code: ${status}`,
        status,
        url,
      });
    }

    if (status && (status < 400 || status >= 600)) {
      return new WebServiceError({
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
      return new WebServiceError(
        { ...invalidResponseBody, status, url },
        { cause: err }
      );
    }

    if (!isErrorBody(data)) {
      return new WebServiceError({ ...invalidResponseBody, status, url });
    }

    return new WebServiceError({
      code: data.code,
      error: data.error,
      status,
      url,
    });
  }
}
