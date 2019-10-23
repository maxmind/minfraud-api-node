import * as http from 'http';
import * as https from 'https';
import { version } from '../package.json';
import Transaction from './request/transaction';
import * as models from './response/models';
import { WebServiceClientError } from './types';

interface ResponseError {
  code?: string;
  error?: string;
}

type servicePath = 'factors' | 'insights' | 'score';

export default class WebServiceClient {
  private accountID: string;
  private host: string;
  private licenseKey: string;
  private timeout: number;

  public constructor(accountID: string, licenseKey: string, timeout = 3000) {
    this.accountID = accountID;
    this.licenseKey = licenseKey;
    this.timeout = timeout;
    this.host = 'minfraud.maxmind.com';
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

  private responseFor<T>(
    path: servicePath,
    postData: string,
    modelClass: any
  ): Promise<T> {
    const parsedPath = `/minfraud/v2.0/${path}`;
    const url = `https://${this.host}${parsedPath}`;

    const options = {
      auth: `${this.accountID}:${this.licenseKey}`,
      headers: {
        Accept: 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Content-Type': 'application/json',
        'User-Agent': `minfraud-api-node/${version}`,
      },
      host: this.host,
      method: 'POST',
      path: parsedPath,
      timeout: this.timeout,
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, response => {
        let data = '';

        response.on('data', chunk => {
          data += chunk;
        });

        response.on('end', () => {
          try {
            data = JSON.parse(data);
          } catch {
            return reject(this.handleError({}, response, url));
          }

          if (response.statusCode && response.statusCode !== 200) {
            return reject(
              this.handleError(data as ResponseError, response, url)
            );
          }
          try {
            return resolve(new modelClass(data));
          } catch (error) {
            const responseData: ResponseError = {
              code: 'INVALID_RESPONSE_BODY',
              error: `Received incomplete response body, could not create ${path} model. (${error.message})`,
            };
            return reject(this.handleError(responseData, response, url));
          }
        });
      });

      req.on('error', (err: NodeJS.ErrnoException) => {
        return reject({
          code: err.code,
          error: err.message,
          url,
        } as WebServiceClientError);
      });

      req.write(postData);

      req.end();
    });
  }

  private handleError(
    data: ResponseError,
    response: http.IncomingMessage,
    url: string
  ): WebServiceClientError {
    if (
      response.statusCode &&
      response.statusCode >= 500 &&
      response.statusCode < 600
    ) {
      return {
        code: 'SERVER_ERROR',
        error: `Received a server error with HTTP status code: ${response.statusCode}`,
        url,
      };
    }

    if (
      response.statusCode &&
      response.statusCode !== 200 &&
      (response.statusCode < 400 || response.statusCode >= 600)
    ) {
      return {
        code: 'HTTP_STATUS_CODE_ERROR',
        error: `Received an unexpected HTTP status code: ${response.statusCode}`,
        url,
      };
    }

    if (!data.code || !data.error) {
      return {
        code: 'INVALID_RESPONSE_BODY',
        error: 'Received an invalid or unparseable response body',
        url,
      };
    }

    return { ...data, url } as WebServiceClientError;
  }
}
