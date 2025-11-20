import { version } from '../package.json';
import Transaction from './request/transaction';
import TransactionReport from './request/transaction-report';
import * as models from './response/models';
import { WebServiceClientError } from './types';

interface ResponseError {
  code?: string;
  error?: string;
}

type servicePath = 'factors' | 'insights' | 'score' | 'transactions/report';

const invalidResponseBody = {
  code: 'INVALID_RESPONSE_BODY',
  error: 'Received an invalid or unparseable response body',
};

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const options: RequestInit = {
      body: postData,
      headers: {
        Accept: 'application/json',
        Authorization:
          'Basic ' +
          Buffer.from(`${this.accountID}:${this.licenseKey}`).toString(
            'base64'
          ),
        'Content-Length': Buffer.byteLength(postData).toString(),
        'Content-Type': 'application/json',
        'User-Agent': `minfraud-api-node/${version}`,
      },
      method: 'POST',
      signal: controller.signal,
    };

    let data;
    /*
     We handle two kinds of errors here:
     1. Network errors, such as timeouts or CORS errors.  These will be caught
       by the catch block and rethrown as a WebServiceClientError.
     2. Errors returned by the MaxMind web service, namely non-200 status codes. These
      will be caught by the handleBadServerResponse method and rethrown/rejected as a
      WebServiceClientError.
    */
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        return Promise.reject(
          await this.handleBadServerResponse(response, url)
        );
      }

      if (response.status === 204) {
        return;
      }
      data = await response.json();
    } catch (err) {
      const error = err as TypeError;
      switch (error.name) {
        case 'AbortError':
          throw {
            code: 'NETWORK_TIMEOUT',
            error: 'The request timed out',
            url,
          };
        case 'SyntaxError':
          throw {
            ...invalidResponseBody,
            url,
          };
        default:
          throw {
            code: 'FETCH_ERROR',
            error: `${error.name} - ${error.message}`,
            url,
          };
      }
    } finally {
      clearTimeout(timeoutId);
    }
    return new modelClass(data);
  }

  private async handleBadServerResponse(
    response: Response,
    url: string
  ): Promise<WebServiceClientError> {
    const status = response.status;

    if (status && status >= 500 && status < 600) {
      return {
        code: 'SERVER_ERROR',
        error: `Received a server error with HTTP status code: ${status}`,
        status,
        url,
      };
    }

    if (status && (status < 400 || status >= 600)) {
      return {
        code: 'HTTP_STATUS_CODE_ERROR',
        error: `Received an unexpected HTTP status code: ${status}`,
        status,
        url,
      };
    }

    let data;
    try {
      data = (await response.json()) as ResponseError;

      if (!data.code || !data.error) {
        return { ...invalidResponseBody, status, url };
      }
    } catch {
      return { ...invalidResponseBody, status, url };
    }

    return { ...data, status, url } as WebServiceClientError;
  }
}
