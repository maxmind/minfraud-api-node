import cloneDeep = require('lodash.clonedeep');
import * as nock from 'nock';
import * as insights from '../fixtures/insights.json';
import * as score from '../fixtures/score.json';
import * as subscores from '../fixtures/subscores.json';
import { Client, Device, Transaction } from './index';
import * as webRecords from './response/web-records';
import { camelizeResponse } from './utils';

const baseUrl = 'https://minfraud.maxmind.com';
const nockInstance = nock(baseUrl);
const auth = {
  pass: 'foo',
  user: '123',
};
const fullPath = (path: string) => `/minfraud/v2.0/${path}`;

const client = new Client(auth.user, auth.pass);

describe('WebServiceClient', () => {
  const factors = cloneDeep(insights) as any;
  factors.response.full.subscores = cloneDeep(subscores);

  describe('factors()', () => {
    const transaction = new Transaction({
      device: new Device({
        ipAddress: '1.1.1.1',
      }),
    });

    it('handles "full" responses', () => {
      expect.assertions(1);

      nockInstance
        .post(fullPath('factors'), factors.request.basic)
        .basicAuth(auth)
        .reply(200, factors.response.full);

      return expect(client.factors(transaction)).resolves.toEqual(
        camelizeResponse(factors.response.full)
      );
    });
  });

  describe('insights()', () => {
    const transaction = new Transaction({
      device: new Device({
        ipAddress: '1.1.1.1',
      }),
    });

    it('handles "full" responses', () => {
      expect.assertions(1);

      nockInstance
        .post(fullPath('insights'), insights.request.basic)
        .basicAuth(auth)
        .reply(200, insights.response.full);

      return expect(client.insights(transaction)).resolves.toEqual(
        camelizeResponse(insights.response.full)
      );
    });

    test.each`
      property
      ${'billing_address'}
      ${'credit_card'}
      ${'email'}
      ${'shipping_address'}
    `('handles missing response $property', ({ property }) => {
      expect.assertions(1);

      const response = cloneDeep(insights.response.full);
      delete response[property as keyof webRecords.InsightsResponse];

      nockInstance
        .post(fullPath('insights'), insights.request.basic)
        .basicAuth(auth)
        .reply(200, response);

      return expect(client.insights(transaction)).resolves.toEqual(
        camelizeResponse(response)
      );
    });
  });

  describe('score()', () => {
    const transaction = new Transaction({
      device: new Device({
        ipAddress: '1.1.1.1',
      }),
    });

    it('handles "full" responses', () => {
      expect.assertions(1);

      nockInstance
        .post(fullPath('score'), score.request.basic)
        .basicAuth(auth)
        .reply(200, score.response.full);

      return expect(client.score(transaction)).resolves.toEqual(
        camelizeResponse(score.response.full)
      );
    });

    it('handles "no disposition" responses', () => {
      expect.assertions(1);

      nockInstance
        .post(fullPath('score'), score.request.basic)
        .reply(200, score.response.noDisposition);

      return expect(client.score(transaction)).resolves.toEqual(
        camelizeResponse(score.response.noDisposition)
      );
    });

    it('handles "no warnings" responses', () => {
      expect.assertions(1);

      nockInstance
        .post(fullPath('score'), score.request.basic)
        .reply(200, score.response.noWarnings);

      return expect(client.score(transaction)).resolves.toEqual(
        camelizeResponse(score.response.noWarnings)
      );
    });
  });

  describe('error handling', () => {
    const transaction = new Transaction({
      device: new Device({
        ipAddress: '1.1.1.1',
      }),
    });

    it('handles 5xx level errors', () => {
      expect.assertions(1);

      nockInstance
        .post(fullPath('score'), score.request.basic)
        .basicAuth(auth)
        .reply(500);

      return expect(client.score(transaction)).rejects.toEqual({
        code: 'SERVER_ERROR',
        error: 'Received a server error with HTTP status code: 500',
        url: baseUrl + fullPath('score'),
      });
    });

    it('handles 3xx level errors', () => {
      expect.assertions(1);

      nockInstance
        .post(fullPath('score'), score.request.basic)
        .basicAuth(auth)
        .reply(300);

      return expect(client.score(transaction)).rejects.toEqual({
        code: 'HTTP_STATUS_CODE_ERROR',
        error: 'Received an unexpected HTTP status code: 300',
        url: baseUrl + fullPath('score'),
      });
    });

    it('handles errors with unknown payload', () => {
      expect.assertions(1);

      nockInstance
        .post(fullPath('score'), score.request.basic)
        .basicAuth(auth)
        .reply(401, { foo: 'bar' });

      return expect(client.score(transaction)).rejects.toEqual({
        code: 'INVALID_RESPONSE_BODY',
        error: 'Received an invalid or unparseable response body',
        url: baseUrl + fullPath('score'),
      });
    });

    it('handles errors with incomplete payload', () => {
      expect.assertions(1);

      nockInstance
        .post(fullPath('insights'), insights.request.basic)
        .basicAuth(auth)
        .reply(200, insights.response.incomplete);

      return expect(client.insights(transaction)).rejects.toEqual({
        code: 'INVALID_RESPONSE_BODY',
        error:
          "Received incomplete response body, could not create insights model. (Cannot read property 'is_high_risk' of undefined)",
        url: baseUrl + fullPath('insights'),
      });
    });

    it('handles general http.request errors', () => {
      const error = {
        code: 'FOO_ERR',
        message: 'some foo error',
      };

      const expected = {
        code: error.code,
        error: error.message,
        url: baseUrl + fullPath('score'),
      };

      expect.assertions(1);

      nockInstance
        .post(fullPath('score'), score.request.basic)
        .basicAuth(auth)
        .replyWithError(error);

      return expect(client.score(transaction)).rejects.toEqual(expected);
    });

    test.each`
      status | code                       | error
      ${400} | ${'IP_ADDRESS_INVALID'}    | ${'ip address invalid'}
      ${400} | ${'IP_ADDRESS_REQUIRED'}   | ${'ip address required'}
      ${400} | ${'IP_ADDRESS_RESERVED'}   | ${'ip address reserved'}
      ${400} | ${'JSON_INVALID'}          | ${'invalid json'}
      ${401} | ${'AUTHORIZATION_INVALID'} | ${'auth required'}
      ${401} | ${'LICENSE_KEY_REQUIRED'}  | ${'license key required'}
      ${401} | ${'USER_ID_REQUIRED'}      | ${'user id required'}
      ${402} | ${'INSUFFICIENT_FUNDS'}    | ${'no money!'}
      ${403} | ${'PERMISSION_REQUIRED'}   | ${'permission required'}
    `('handles $code error', ({ code, error, status }) => {
      nockInstance
        .post(fullPath('score'), score.request.basic)
        .basicAuth(auth)
        .reply(status, { code, error });
      expect.assertions(1);

      return expect(client.score(transaction)).rejects.toEqual({
        code,
        error,
        url: baseUrl + fullPath('score'),
      });
    });
  });
});
