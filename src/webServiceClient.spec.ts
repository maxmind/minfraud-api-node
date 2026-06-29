import * as models from './response/models/index.js';
import insights from '../fixtures/insights.json' with { type: 'json' };
import reasons from '../fixtures/reasons.json' with { type: 'json' };
import score from '../fixtures/score.json' with { type: 'json' };
import subscores from '../fixtures/subscores.json' with { type: 'json' };
import {
  ArgumentError,
  Client,
  Constants,
  Device,
  Transaction,
  TransactionReport,
  WebServiceError,
} from './index.js';
import * as webRecords from './response/web-records.js';

const baseUrl = 'https://minfraud.maxmind.com';
const auth = {
  pass: 'foo',
  user: '123',
};
const fullPath = (path: string) => `/minfraud/v2.0/${path}`;

interface CapturedRequest {
  init?: RequestInit;
  url: RequestInfo | URL;
}

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  });

// Builds a client backed by an injected fetcher driven by `handler`, capturing
// the requests the client makes so they can be asserted on. This replaces
// HTTP-level mocking: the handler returns the `Response` (or rejects) for each
// request.
const clientWith = (
  handler: (request: CapturedRequest) => Response | Promise<Response>,
  options?: { timeout?: number }
) => {
  const requests: CapturedRequest[] = [];
  const fetcher = (async (url: RequestInfo | URL, init?: RequestInit) => {
    const request = { init, url };
    requests.push(request);
    return handler(request);
  }) as typeof fetch;
  const client = new Client(auth.user, auth.pass, { fetcher, ...options });
  return { client, requests };
};

describe('WebServiceClient', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const factors = structuredClone(insights) as any;
  factors.response.full.risk_score_reasons = structuredClone(reasons);
  factors.response.full.subscores = structuredClone(subscores);

  describe('fetcher option', () => {
    it('uses the injected fetcher with the correct method, path, body, and auth', async () => {
      const { client, requests } = clientWith(() =>
        jsonResponse(200, score.response.full)
      );
      const transaction = new Transaction({
        device: new Device({ ipAddress: '1.1.1.1' }),
      });

      const got = await client.score(transaction);

      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe(`${baseUrl}${fullPath('score')}`);
      expect(requests[0].init!.method).toBe('POST');
      expect(requests[0].init!.body).toBe(transaction.toString());
      const headers = requests[0].init!.headers as Record<string, string>;
      expect(headers.Authorization).toBe(
        'Basic ' + btoa(`${auth.user}:${auth.pass}`)
      );
      expect(headers['User-Agent']).toMatch(/^minfraud-api-node\//);
      expect(got.riskScore).toEqual(0.01);
    });

    it('treats a null options argument like no options', () => {
      // A JS caller may pass an explicit null; it must not crash the
      // constructor (typeof null === 'object').
      expect(
        () => new Client(auth.user, auth.pass, null as unknown as undefined)
      ).not.toThrow();
    });

    it('rejects a legacy positional host argument', () => {
      // The old constructor took (accountID, licenseKey, timeout, host); a
      // fourth argument now indicates an out-of-date call site.
      expect(
        () => new Client(auth.user, auth.pass, 3000, 'proxy.example' as never)
      ).toThrow(ArgumentError);
    });

    it('sends requests to the configured host', async () => {
      const ip = '1.1.1.1';
      const requests: { url: RequestInfo | URL }[] = [];
      const fetcher = ((url: RequestInfo | URL) => {
        requests.push({ url });
        return Promise.resolve(jsonResponse(200, score.response.full));
      }) as typeof fetch;
      const client = new Client(auth.user, auth.pass, {
        fetcher,
        host: 'sandbox.example',
      });

      await client.score(
        new Transaction({ device: new Device({ ipAddress: ip }) })
      );

      expect(requests[0].url).toBe(
        'https://sandbox.example/minfraud/v2.0/score'
      );
    });

    it.each([
      ['host', { host: null }],
      ['timeout', { timeout: null }],
      ['fetcher', { fetcher: null }],
    ])('rejects a null %s option', (_name, options) => {
      expect(() => new Client(auth.user, auth.pass, options as never)).toThrow(
        ArgumentError
      );
    });
  });

  describe('factors()', () => {
    const transaction = new Transaction({
      device: new Device({
        ipAddress: '1.1.1.1',
      }),
    });

    it('handles "full" responses', async () => {
      expect.assertions(180);

      const { client } = clientWith(() =>
        jsonResponse(200, factors.response.full)
      );

      const got: models.Factors = await client.factors(transaction);

      expect(got.id).toEqual('5bc5d6c2-b2c8-40af-87f4-6d61af86b6ae');
      expect(got.riskScore).toEqual(0.01);
      expect(got.fundsRemaining).toEqual(25);
      expect(got.queriesRemaining).toEqual(1666);

      expect(got.ipAddress?.risk).toEqual(0.01);
      expect(got.ipAddress?.riskReasons?.[0].code).toEqual('ANONYMOUS_IP');
      expect(got.ipAddress?.riskReasons?.[0].reason).toEqual(
        'The IP address belongs to an anonymous network. See /ip_address/traits for more details.'
      );
      expect(got.ipAddress?.riskReasons?.[1].code).toEqual(
        'MINFRAUD_NETWORK_ACTIVITY'
      );
      expect(got.ipAddress?.riskReasons?.[1].reason).toEqual(
        'Suspicious activity has been seen on this IP address across minFraud customers.'
      );

      expect(got.ipAddress?.city?.confidence).toEqual(25);
      expect(got.ipAddress?.city?.geonameId).toEqual(54321);
      expect(got.ipAddress?.city?.names?.de).toEqual('Los Angeles');
      expect(got.ipAddress?.city?.names?.en).toEqual('Los Angeles');
      expect(got.ipAddress?.city?.names?.es).toEqual('Los Ángeles');
      expect(got.ipAddress?.city?.names?.fr).toEqual('Los Angeles');
      expect(got.ipAddress?.city?.names?.ja).toEqual('ロサンゼルス市');
      expect(got.ipAddress?.city?.names['pt-BR']).toEqual('Los Angeles');
      expect(got.ipAddress?.city?.names?.ru).toEqual('Лос-Анджелес');
      expect(got.ipAddress?.city?.names['zh-CN']).toEqual('洛杉矶');

      expect(got.ipAddress?.continent?.code).toEqual('NA');
      expect(got.ipAddress?.continent?.geonameId).toEqual(123456);
      expect(got.ipAddress?.continent?.names?.de).toEqual('Nordamerika');
      expect(got.ipAddress?.continent?.names?.en).toEqual('North America');
      expect(got.ipAddress?.continent?.names?.es).toEqual('América del Norte');
      expect(got.ipAddress?.continent?.names?.fr).toEqual('Amérique du Nord');
      expect(got.ipAddress?.continent?.names?.ja).toEqual('北アメリカ');
      expect(got.ipAddress?.continent?.names['pt-BR']).toEqual(
        'América do Norte'
      );
      expect(got.ipAddress?.continent?.names?.ru).toEqual('Северная Америка');
      expect(got.ipAddress?.continent?.names['zh-CN']).toEqual('北美洲');

      expect(got.ipAddress?.country?.confidence).toEqual(75);
      expect(got.ipAddress?.country?.geonameId).toEqual(6252001);
      expect(got.ipAddress?.country?.isHighRisk).toEqual(true);
      expect(got.ipAddress?.country?.isInEuropeanUnion).toEqual(true);
      expect(got.ipAddress?.country?.isoCode).toEqual('US');
      expect(got.ipAddress?.country?.names?.de).toEqual('USA');
      expect(got.ipAddress?.country?.names?.en).toEqual('United States');
      expect(got.ipAddress?.country?.names?.es).toEqual('Estados Unidos');
      expect(got.ipAddress?.country?.names?.fr).toEqual('États-Unis');
      expect(got.ipAddress?.country?.names?.ja).toEqual('アメリカ合衆国');
      expect(got.ipAddress?.country?.names['pt-BR']).toEqual('Estados Unidos');
      expect(got.ipAddress?.country?.names?.ru).toEqual('США');
      expect(got.ipAddress?.country?.names['zh-CN']).toEqual('美国');

      expect(got.ipAddress?.location?.accuracyRadius).toEqual(20);
      expect(got.ipAddress?.location?.averageIncome).toEqual(50321);
      expect(got.ipAddress?.location?.latitude).toEqual(37.6293);
      expect(got.ipAddress?.location?.localTime).toEqual(
        '2015-04-26T01:37:17-08:00'
      );
      expect(got.ipAddress?.location?.longitude).toEqual(-122.1163);
      expect(got.ipAddress?.location?.metroCode).toEqual(807);
      expect(got.ipAddress?.location?.populationDensity).toEqual(7122);
      expect(got.ipAddress?.location?.timeZone).toEqual('America/Los_Angeles');

      expect(got.ipAddress?.postal?.code).toEqual('90001');
      expect(got.ipAddress?.postal?.confidence).toEqual(10);

      expect(got.ipAddress?.registeredCountry?.geonameId).toEqual(6252001);
      expect(got.ipAddress?.registeredCountry?.isInEuropeanUnion).toEqual(true);
      expect(got.ipAddress?.registeredCountry?.isoCode).toEqual('US');
      expect(got.ipAddress?.registeredCountry?.names?.de).toEqual('USA');
      expect(got.ipAddress?.registeredCountry?.names?.en).toEqual(
        'United States'
      );
      expect(got.ipAddress?.registeredCountry?.names?.es).toEqual(
        'Estados Unidos'
      );
      expect(got.ipAddress?.registeredCountry?.names?.fr).toEqual('États-Unis');
      expect(got.ipAddress?.registeredCountry?.names?.ja).toEqual(
        'アメリカ合衆国'
      );
      expect(got.ipAddress?.registeredCountry?.names['pt-BR']).toEqual(
        'Estados Unidos'
      );
      expect(got.ipAddress?.registeredCountry?.names?.ru).toEqual('США');
      expect(got.ipAddress?.registeredCountry?.names['zh-CN']).toEqual('美国');
      expect(got.ipAddress?.representedCountry?.geonameId).toEqual(6252001);
      expect(got.ipAddress?.representedCountry?.isInEuropeanUnion).toEqual(
        true
      );
      expect(got.ipAddress?.representedCountry?.isoCode).toEqual('US');
      expect(got.ipAddress?.representedCountry?.names?.de).toEqual('USA');
      expect(got.ipAddress?.representedCountry?.names?.en).toEqual(
        'United States'
      );
      expect(got.ipAddress?.representedCountry?.names?.es).toEqual(
        'Estados Unidos'
      );
      expect(got.ipAddress?.representedCountry?.names?.fr).toEqual(
        'États-Unis'
      );
      expect(got.ipAddress?.representedCountry?.names?.ja).toEqual(
        'アメリカ合衆国'
      );
      expect(got.ipAddress?.representedCountry?.names['pt-BR']).toEqual(
        'Estados Unidos'
      );
      expect(got.ipAddress?.representedCountry?.names?.ru).toEqual('США');
      expect(got.ipAddress?.representedCountry?.names['zh-CN']).toEqual('美国');
      expect(got.ipAddress?.representedCountry?.type).toEqual('military');

      expect(got.ipAddress?.subdivisions?.[0].confidence).toEqual(50);
      expect(got.ipAddress?.subdivisions?.[0].geonameId).toEqual(5332921);
      expect(got.ipAddress?.subdivisions?.[0].isoCode).toEqual('CA');
      expect(got.ipAddress?.subdivisions?.[0].names?.de).toEqual('Kalifornien');
      expect(got.ipAddress?.subdivisions?.[0].names?.en).toEqual('California');
      expect(got.ipAddress?.subdivisions?.[0].names?.es).toEqual('California');
      expect(got.ipAddress?.subdivisions?.[0].names?.fr).toEqual('Californie');
      expect(got.ipAddress?.subdivisions?.[0].names?.ja).toEqual(
        'カリフォルニア'
      );
      expect(got.ipAddress?.subdivisions?.[0].names?.ru).toEqual('Калифорния');
      expect(got.ipAddress?.subdivisions?.[0].names['zh-CN']).toEqual('加州');

      expect(got.ipAddress?.traits?.autonomousSystemNumber).toEqual(1239);
      expect(got.ipAddress?.traits?.autonomousSystemOrganization).toEqual(
        'Linkem IR WiMax Network'
      );
      expect(got.ipAddress?.traits?.domain).toEqual('example.com');
      expect(got.ipAddress?.traits?.ipAddress).toEqual('1.2.3.0/24');
      expect(got.ipAddress?.traits?.isAnonymous).toEqual(true);
      expect(got.ipAddress?.traits?.isAnonymousProxy).toEqual(true);
      expect(got.ipAddress?.traits?.isAnonymousVpn).toEqual(true);
      expect(got.ipAddress?.traits?.isHostingProvider).toEqual(true);
      expect(got.ipAddress?.traits?.isLegitimateProxy).toEqual(false);
      expect(got.ipAddress?.traits?.isPublicProxy).toEqual(true);
      expect(got.ipAddress?.traits?.isResidentialProxy).toEqual(false);
      expect(got.ipAddress?.traits?.isSatelliteProvider).toEqual(true);
      expect(got.ipAddress?.traits?.isTorExitNode).toEqual(true);
      expect(got.ipAddress?.traits?.isp).toEqual('Linkem spa');
      expect(got.ipAddress?.traits?.organization).toEqual(
        'Linkem IR WiMax Network'
      );
      expect(got.ipAddress?.traits?.userType).toEqual('traveler');

      expect(got.creditCard?.issuer?.name).toEqual('Bank of America');
      expect(got.creditCard?.issuer?.matchesProvidedName).toEqual(true);
      expect(got.creditCard?.issuer?.phoneNumber).toEqual('800-732-9194');
      expect(got.creditCard?.issuer?.matchesProvidedPhoneNumber).toEqual(true);
      expect(got.creditCard?.brand).toEqual('Visa');
      expect(got.creditCard?.country).toEqual('US');
      expect(got.creditCard?.isBusiness).toEqual(true);
      expect(got.creditCard?.isIssuedInBillingAddressCountry).toEqual(true);
      expect(got.creditCard?.isPrepaid).toEqual(true);
      expect(got.creditCard?.isVirtual).toEqual(true);
      expect(got.creditCard?.type).toEqual('credit');

      expect(got.device?.confidence).toEqual(99);
      expect(got.device?.id).toEqual('7835b099-d385-4e5b-969e-7df26181d73b');
      expect(got.device?.lastSeen).toEqual('2016-06-08T14:16:38Z');
      expect(got.device?.localTime).toEqual('2018-01-02T10:40:11-08:00');

      expect(got.email?.domain?.firstSeen).toEqual('2016-01-23');
      expect(got.email?.domain?.classification).toEqual('business');
      expect(got.email?.domain?.risk).toEqual(15.5);
      expect(got.email?.domain?.volume).toEqual(6300);
      expect(got.email?.domain?.visit?.status).toEqual('live');
      expect(got.email?.domain?.visit?.lastVisitedOn).toEqual('2024-11-15');
      expect(got.email?.domain?.visit?.hasRedirect).toEqual(false);
      expect(got.email?.firstSeen).toEqual('2016-02-03');
      expect(got.email?.isDisposable).toEqual(false);
      expect(got.email?.isFree).toEqual(false);
      expect(got.email?.isHighRisk).toEqual(true);

      expect(got.shippingAddress?.isHighRisk).toEqual(true);
      expect(got.shippingAddress?.isPostalInCity).toEqual(true);
      expect(got.shippingAddress?.latitude).toEqual(37.632);
      expect(got.shippingAddress?.longitude).toEqual(-122.313);
      expect(got.shippingAddress?.distanceToIpLocation).toEqual(15);
      expect(got.shippingAddress?.distanceToBillingAddress).toEqual(22);
      expect(got.shippingAddress?.isInIpCountry).toEqual(true);

      expect(got.shippingPhone?.country).toEqual('CA');
      expect(got.shippingPhone?.isVoip).toEqual(true);
      expect(got.shippingPhone?.matchesPostal).toEqual(true);
      expect(got.shippingPhone?.networkOperator).toEqual(
        'Telus Mobility-SVR/2'
      );
      expect(got.shippingPhone?.numberType).toEqual('mobile');

      expect(got.billingAddress?.isPostalInCity).toEqual(true);
      expect(got.billingAddress?.latitude).toEqual(37.545);
      expect(got.billingAddress?.longitude).toEqual(-122.421);
      expect(got.billingAddress?.distanceToIpLocation).toEqual(100);
      expect(got.billingAddress?.isInIpCountry).toEqual(true);

      expect(got.billingPhone?.country).toEqual('US');
      expect(got.billingPhone?.isVoip).toEqual(false);
      expect(got.billingPhone?.matchesPostal).toEqual(true);
      expect(got.billingPhone?.networkOperator).toEqual('Verizon/1');
      expect(got.billingPhone?.numberType).toEqual('fixed');

      expect(got.disposition?.action).toEqual('accept');
      expect(got.disposition?.reason).toEqual('default');
      expect(got.disposition?.ruleLabel).toEqual('the label');

      expect(got.warnings?.[0].code).toEqual('INPUT_INVALID');
      expect(got.warnings?.[0].warning).toEqual(
        'Encountered value at /shipping/city that does not meet the required constraints'
      );
      expect(got.warnings?.[0].inputPointer).toEqual('/shipping/city');

      expect(got.riskScoreReasons).toHaveLength(4);
      expect(got.riskScoreReasons?.[0].multiplier).toEqual(45);
      expect(got.riskScoreReasons?.[0].reasons).toHaveLength(1);
      expect(got.riskScoreReasons?.[0].reasons[0].code).toEqual('ANONYMOUS_IP');
      expect(got.riskScoreReasons?.[0].reasons[0].reason).toEqual(
        'Risk due to IP being an Anonymous IP'
      );

      expect(got?.subscores?.avsResult).toEqual(0.01);
      expect(got?.subscores?.billingAddress).toEqual(0.02);
      expect(got?.subscores?.billingAddressDistanceToIpLocation).toEqual(0.03);
      expect(got?.subscores?.browser).toEqual(0.04);
      expect(got?.subscores?.chargeback).toEqual(0.05);
      expect(got?.subscores?.country).toEqual(0.06);
      expect(got?.subscores?.countryMismatch).toEqual(0.07);
      expect(got?.subscores?.cvvResult).toEqual(0.08);
      expect(got?.subscores?.device).toEqual(0.58);
      expect(got?.subscores?.emailAddress).toEqual(0.09);
      expect(got?.subscores?.emailDomain).toEqual(0.1);
      expect(got?.subscores?.emailLocalPart).toEqual(0.19);
      expect(got?.subscores?.emailTenure).toEqual(0.11);
      expect(got?.subscores?.ipTenure).toEqual(0.12);
      expect(got?.subscores?.issuerIdNumber).toEqual(0.13);
      expect(got?.subscores?.orderAmount).toEqual(0.14);
      expect(got?.subscores?.phoneNumber).toEqual(0.15);
      expect(got?.subscores?.shippingAddress).toEqual(0.99);
      expect(got?.subscores?.shippingAddressDistanceToIpLocation).toEqual(0.16);
      expect(got?.subscores?.timeOfDay).toEqual(0.17);
    });
  });

  describe('insights()', () => {
    const transaction = new Transaction({
      device: new Device({
        ipAddress: '1.1.1.1',
      }),
    });

    it('handles "full" responses', async () => {
      expect.assertions(155);

      const { client } = clientWith(() =>
        jsonResponse(200, insights.response.full)
      );

      const got: models.Insights = await client.insights(transaction);

      expect(got.id).toEqual('5bc5d6c2-b2c8-40af-87f4-6d61af86b6ae');
      expect(got.riskScore).toEqual(0.01);
      expect(got.fundsRemaining).toEqual(25);
      expect(got.queriesRemaining).toEqual(1666);

      expect(got.ipAddress?.risk).toEqual(0.01);
      expect(got.ipAddress?.riskReasons?.[0].code).toEqual('ANONYMOUS_IP');
      expect(got.ipAddress?.riskReasons?.[0].reason).toEqual(
        'The IP address belongs to an anonymous network. See /ip_address/traits for more details.'
      );
      expect(got.ipAddress?.riskReasons?.[1].code).toEqual(
        'MINFRAUD_NETWORK_ACTIVITY'
      );
      expect(got.ipAddress?.riskReasons?.[1].reason).toEqual(
        'Suspicious activity has been seen on this IP address across minFraud customers.'
      );

      expect(got.ipAddress?.city?.confidence).toEqual(25);
      expect(got.ipAddress?.city?.geonameId).toEqual(54321);
      expect(got.ipAddress?.city?.names?.de).toEqual('Los Angeles');
      expect(got.ipAddress?.city?.names?.en).toEqual('Los Angeles');
      expect(got.ipAddress?.city?.names?.es).toEqual('Los Ángeles');
      expect(got.ipAddress?.city?.names?.fr).toEqual('Los Angeles');
      expect(got.ipAddress?.city?.names?.ja).toEqual('ロサンゼルス市');
      expect(got.ipAddress?.city?.names['pt-BR']).toEqual('Los Angeles');
      expect(got.ipAddress?.city?.names?.ru).toEqual('Лос-Анджелес');
      expect(got.ipAddress?.city?.names['zh-CN']).toEqual('洛杉矶');

      expect(got.ipAddress?.continent?.code).toEqual('NA');
      expect(got.ipAddress?.continent?.geonameId).toEqual(123456);
      expect(got.ipAddress?.continent?.names?.de).toEqual('Nordamerika');
      expect(got.ipAddress?.continent?.names?.en).toEqual('North America');
      expect(got.ipAddress?.continent?.names?.es).toEqual('América del Norte');
      expect(got.ipAddress?.continent?.names?.fr).toEqual('Amérique du Nord');
      expect(got.ipAddress?.continent?.names?.ja).toEqual('北アメリカ');
      expect(got.ipAddress?.continent?.names['pt-BR']).toEqual(
        'América do Norte'
      );
      expect(got.ipAddress?.continent?.names?.ru).toEqual('Северная Америка');
      expect(got.ipAddress?.continent?.names['zh-CN']).toEqual('北美洲');

      expect(got.ipAddress?.country?.confidence).toEqual(75);
      expect(got.ipAddress?.country?.geonameId).toEqual(6252001);
      expect(got.ipAddress?.country?.isHighRisk).toEqual(true);
      expect(got.ipAddress?.country?.isInEuropeanUnion).toEqual(true);
      expect(got.ipAddress?.country?.isoCode).toEqual('US');
      expect(got.ipAddress?.country?.names?.de).toEqual('USA');
      expect(got.ipAddress?.country?.names?.en).toEqual('United States');
      expect(got.ipAddress?.country?.names?.es).toEqual('Estados Unidos');
      expect(got.ipAddress?.country?.names?.fr).toEqual('États-Unis');
      expect(got.ipAddress?.country?.names?.ja).toEqual('アメリカ合衆国');
      expect(got.ipAddress?.country?.names['pt-BR']).toEqual('Estados Unidos');
      expect(got.ipAddress?.country?.names?.ru).toEqual('США');
      expect(got.ipAddress?.country?.names['zh-CN']).toEqual('美国');

      expect(got.ipAddress?.location?.accuracyRadius).toEqual(20);
      expect(got.ipAddress?.location?.averageIncome).toEqual(50321);
      expect(got.ipAddress?.location?.latitude).toEqual(37.6293);
      expect(got.ipAddress?.location?.localTime).toEqual(
        '2015-04-26T01:37:17-08:00'
      );
      expect(got.ipAddress?.location?.longitude).toEqual(-122.1163);
      expect(got.ipAddress?.location?.metroCode).toEqual(807);
      expect(got.ipAddress?.location?.populationDensity).toEqual(7122);
      expect(got.ipAddress?.location?.timeZone).toEqual('America/Los_Angeles');

      expect(got.ipAddress?.postal?.code).toEqual('90001');
      expect(got.ipAddress?.postal?.confidence).toEqual(10);

      expect(got.ipAddress?.registeredCountry?.geonameId).toEqual(6252001);
      expect(got.ipAddress?.registeredCountry?.isInEuropeanUnion).toEqual(true);
      expect(got.ipAddress?.registeredCountry?.isoCode).toEqual('US');
      expect(got.ipAddress?.registeredCountry?.names?.de).toEqual('USA');
      expect(got.ipAddress?.registeredCountry?.names?.en).toEqual(
        'United States'
      );
      expect(got.ipAddress?.registeredCountry?.names?.es).toEqual(
        'Estados Unidos'
      );
      expect(got.ipAddress?.registeredCountry?.names?.fr).toEqual('États-Unis');
      expect(got.ipAddress?.registeredCountry?.names?.ja).toEqual(
        'アメリカ合衆国'
      );
      expect(got.ipAddress?.registeredCountry?.names['pt-BR']).toEqual(
        'Estados Unidos'
      );
      expect(got.ipAddress?.registeredCountry?.names?.ru).toEqual('США');
      expect(got.ipAddress?.registeredCountry?.names['zh-CN']).toEqual('美国');
      expect(got.ipAddress?.representedCountry?.geonameId).toEqual(6252001);
      expect(got.ipAddress?.representedCountry?.isInEuropeanUnion).toEqual(
        true
      );
      expect(got.ipAddress?.representedCountry?.isoCode).toEqual('US');
      expect(got.ipAddress?.representedCountry?.names?.de).toEqual('USA');
      expect(got.ipAddress?.representedCountry?.names?.en).toEqual(
        'United States'
      );
      expect(got.ipAddress?.representedCountry?.names?.es).toEqual(
        'Estados Unidos'
      );
      expect(got.ipAddress?.representedCountry?.names?.fr).toEqual(
        'États-Unis'
      );
      expect(got.ipAddress?.representedCountry?.names?.ja).toEqual(
        'アメリカ合衆国'
      );
      expect(got.ipAddress?.representedCountry?.names['pt-BR']).toEqual(
        'Estados Unidos'
      );
      expect(got.ipAddress?.representedCountry?.names?.ru).toEqual('США');
      expect(got.ipAddress?.representedCountry?.names['zh-CN']).toEqual('美国');
      expect(got.ipAddress?.representedCountry?.type).toEqual('military');

      expect(got.ipAddress?.subdivisions?.[0].confidence).toEqual(50);
      expect(got.ipAddress?.subdivisions?.[0].geonameId).toEqual(5332921);
      expect(got.ipAddress?.subdivisions?.[0].isoCode).toEqual('CA');
      expect(got.ipAddress?.subdivisions?.[0].names?.de).toEqual('Kalifornien');
      expect(got.ipAddress?.subdivisions?.[0].names?.en).toEqual('California');
      expect(got.ipAddress?.subdivisions?.[0].names?.es).toEqual('California');
      expect(got.ipAddress?.subdivisions?.[0].names?.fr).toEqual('Californie');
      expect(got.ipAddress?.subdivisions?.[0].names?.ja).toEqual(
        'カリフォルニア'
      );
      expect(got.ipAddress?.subdivisions?.[0].names?.ru).toEqual('Калифорния');
      expect(got.ipAddress?.subdivisions?.[0].names['zh-CN']).toEqual('加州');

      expect(got.ipAddress?.traits?.autonomousSystemNumber).toEqual(1239);
      expect(got.ipAddress?.traits?.autonomousSystemOrganization).toEqual(
        'Linkem IR WiMax Network'
      );
      expect(got.ipAddress?.traits?.domain).toEqual('example.com');
      expect(got.ipAddress?.traits?.ipAddress).toEqual('1.2.3.0/24');
      expect(got.ipAddress?.traits?.isAnonymous).toEqual(true);
      expect(got.ipAddress?.traits?.isAnonymousProxy).toEqual(true);
      expect(got.ipAddress?.traits?.isAnonymousVpn).toEqual(true);
      expect(got.ipAddress?.traits?.isHostingProvider).toEqual(true);
      expect(got.ipAddress?.traits?.isLegitimateProxy).toEqual(false);
      expect(got.ipAddress?.traits?.isPublicProxy).toEqual(true);
      expect(got.ipAddress?.traits?.isResidentialProxy).toEqual(false);
      expect(got.ipAddress?.traits?.isSatelliteProvider).toEqual(true);
      expect(got.ipAddress?.traits?.isTorExitNode).toEqual(true);
      expect(got.ipAddress?.traits?.isp).toEqual('Linkem spa');
      expect(got.ipAddress?.traits?.organization).toEqual(
        'Linkem IR WiMax Network'
      );
      expect(got.ipAddress?.traits?.userType).toEqual('traveler');

      expect(got.creditCard?.issuer?.name).toEqual('Bank of America');
      expect(got.creditCard?.issuer?.matchesProvidedName).toEqual(true);
      expect(got.creditCard?.issuer?.phoneNumber).toEqual('800-732-9194');
      expect(got.creditCard?.issuer?.matchesProvidedPhoneNumber).toEqual(true);
      expect(got.creditCard?.brand).toEqual('Visa');
      expect(got.creditCard?.country).toEqual('US');
      expect(got.creditCard?.isBusiness).toEqual(true);
      expect(got.creditCard?.isIssuedInBillingAddressCountry).toEqual(true);
      expect(got.creditCard?.isPrepaid).toEqual(true);
      expect(got.creditCard?.isVirtual).toEqual(true);
      expect(got.creditCard?.type).toEqual('credit');

      expect(got.device?.confidence).toEqual(99);
      expect(got.device?.id).toEqual('7835b099-d385-4e5b-969e-7df26181d73b');
      expect(got.device?.lastSeen).toEqual('2016-06-08T14:16:38Z');
      expect(got.device?.localTime).toEqual('2018-01-02T10:40:11-08:00');

      expect(got.email?.domain?.firstSeen).toEqual('2016-01-23');
      expect(got.email?.domain?.classification).toEqual('business');
      expect(got.email?.domain?.risk).toEqual(15.5);
      expect(got.email?.domain?.volume).toEqual(6300);
      expect(got.email?.domain?.visit?.status).toEqual('live');
      expect(got.email?.domain?.visit?.lastVisitedOn).toEqual('2024-11-15');
      expect(got.email?.domain?.visit?.hasRedirect).toEqual(false);
      expect(got.email?.firstSeen).toEqual('2016-02-03');
      expect(got.email?.isDisposable).toEqual(false);
      expect(got.email?.isFree).toEqual(false);
      expect(got.email?.isHighRisk).toEqual(true);

      expect(got.shippingAddress?.isHighRisk).toEqual(true);
      expect(got.shippingAddress?.isPostalInCity).toEqual(true);
      expect(got.shippingAddress?.latitude).toEqual(37.632);
      expect(got.shippingAddress?.longitude).toEqual(-122.313);
      expect(got.shippingAddress?.distanceToIpLocation).toEqual(15);
      expect(got.shippingAddress?.distanceToBillingAddress).toEqual(22);
      expect(got.shippingAddress?.isInIpCountry).toEqual(true);

      expect(got.shippingPhone?.country).toEqual('CA');
      expect(got.shippingPhone?.isVoip).toEqual(true);
      expect(got.shippingPhone?.matchesPostal).toEqual(true);
      expect(got.shippingPhone?.networkOperator).toEqual(
        'Telus Mobility-SVR/2'
      );
      expect(got.shippingPhone?.numberType).toEqual('mobile');

      expect(got.billingAddress?.isPostalInCity).toEqual(true);
      expect(got.billingAddress?.latitude).toEqual(37.545);
      expect(got.billingAddress?.longitude).toEqual(-122.421);
      expect(got.billingAddress?.distanceToIpLocation).toEqual(100);
      expect(got.billingAddress?.isInIpCountry).toEqual(true);

      expect(got.billingPhone?.country).toEqual('US');
      expect(got.billingPhone?.isVoip).toEqual(false);
      expect(got.billingPhone?.matchesPostal).toEqual(true);
      expect(got.billingPhone?.networkOperator).toEqual('Verizon/1');
      expect(got.billingPhone?.numberType).toEqual('fixed');

      expect(got.disposition?.action).toEqual('accept');
      expect(got.disposition?.reason).toEqual('default');
      expect(got.disposition?.ruleLabel).toEqual('the label');

      expect(got.warnings?.[0].code).toEqual('INPUT_INVALID');
      expect(got.warnings?.[0].warning).toEqual(
        'Encountered value at /shipping/city that does not meet the required constraints'
      );
      expect(got.warnings?.[0].inputPointer).toEqual('/shipping/city');
    });

    test.each`
      property
      ${'billing_address'}
      ${'credit_card'}
      ${'email'}
      ${'shipping_address'}
    `('handles missing response $property', async ({ property }) => {
      const response = structuredClone(insights.response.full);
      delete response[property as keyof webRecords.InsightsResponse];

      const { client } = clientWith(() => jsonResponse(200, response));

      const got: models.Insights = await client.insights(transaction);

      switch (property) {
        case 'billing_address':
          expect.assertions(140);
          break;
        case 'credit_card':
          expect.assertions(134);
          break;
        case 'email':
          expect.assertions(134);
          break;
        case 'shipping_address':
          expect.assertions(138);
          break;
      }

      if (property != 'billing_address') {
        expect(got.billingAddress?.isPostalInCity).toEqual(true);
        expect(got.billingAddress?.latitude).toEqual(37.545);
        expect(got.billingAddress?.longitude).toEqual(-122.421);
        expect(got.billingAddress?.distanceToIpLocation).toEqual(100);
        expect(got.billingAddress?.isInIpCountry).toEqual(true);
      }

      if (property != 'credit_card') {
        expect(got.creditCard?.issuer?.name).toEqual('Bank of America');
        expect(got.creditCard?.issuer?.matchesProvidedName).toEqual(true);
        expect(got.creditCard?.issuer?.phoneNumber).toEqual('800-732-9194');
        expect(got.creditCard?.issuer?.matchesProvidedPhoneNumber).toEqual(
          true
        );
        expect(got.creditCard?.brand).toEqual('Visa');
        expect(got.creditCard?.country).toEqual('US');
        expect(got.creditCard?.isBusiness).toEqual(true);
        expect(got.creditCard?.isIssuedInBillingAddressCountry).toEqual(true);
        expect(got.creditCard?.isPrepaid).toEqual(true);
        expect(got.creditCard?.isVirtual).toEqual(true);
        expect(got.creditCard?.type).toEqual('credit');
      }

      if (property != 'email') {
        expect(got.email?.domain?.firstSeen).toEqual('2016-01-23');
        expect(got.email?.domain?.classification).toEqual('business');
        expect(got.email?.domain?.risk).toEqual(15.5);
        expect(got.email?.domain?.volume).toEqual(6300);
        expect(got.email?.domain?.visit?.status).toEqual('live');
        expect(got.email?.domain?.visit?.lastVisitedOn).toEqual('2024-11-15');
        expect(got.email?.domain?.visit?.hasRedirect).toEqual(false);
        expect(got.email?.firstSeen).toEqual('2016-02-03');
        expect(got.email?.isDisposable).toEqual(false);
        expect(got.email?.isFree).toEqual(false);
        expect(got.email?.isHighRisk).toEqual(true);
      }

      if (property != 'shipping_address') {
        expect(got.shippingAddress?.isHighRisk).toEqual(true);
        expect(got.shippingAddress?.isPostalInCity).toEqual(true);
        expect(got.shippingAddress?.latitude).toEqual(37.632);
        expect(got.shippingAddress?.longitude).toEqual(-122.313);
        expect(got.shippingAddress?.distanceToIpLocation).toEqual(15);
        expect(got.shippingAddress?.distanceToBillingAddress).toEqual(22);
        expect(got.shippingAddress?.isInIpCountry).toEqual(true);
      }

      expect(got.id).toEqual('5bc5d6c2-b2c8-40af-87f4-6d61af86b6ae');
      expect(got.riskScore).toEqual(0.01);
      expect(got.fundsRemaining).toEqual(25);
      expect(got.queriesRemaining).toEqual(1666);

      expect(got.ipAddress?.risk).toEqual(0.01);
      expect(got.ipAddress?.riskReasons?.[0].code).toEqual('ANONYMOUS_IP');
      expect(got.ipAddress?.riskReasons?.[0].reason).toEqual(
        'The IP address belongs to an anonymous network. See /ip_address/traits for more details.'
      );
      expect(got.ipAddress?.riskReasons?.[1].code).toEqual(
        'MINFRAUD_NETWORK_ACTIVITY'
      );
      expect(got.ipAddress?.riskReasons?.[1].reason).toEqual(
        'Suspicious activity has been seen on this IP address across minFraud customers.'
      );

      expect(got.ipAddress?.city?.confidence).toEqual(25);
      expect(got.ipAddress?.city?.geonameId).toEqual(54321);
      expect(got.ipAddress?.city?.names?.de).toEqual('Los Angeles');
      expect(got.ipAddress?.city?.names?.en).toEqual('Los Angeles');
      expect(got.ipAddress?.city?.names?.es).toEqual('Los Ángeles');
      expect(got.ipAddress?.city?.names?.fr).toEqual('Los Angeles');
      expect(got.ipAddress?.city?.names?.ja).toEqual('ロサンゼルス市');
      expect(got.ipAddress?.city?.names['pt-BR']).toEqual('Los Angeles');
      expect(got.ipAddress?.city?.names?.ru).toEqual('Лос-Анджелес');
      expect(got.ipAddress?.city?.names['zh-CN']).toEqual('洛杉矶');

      expect(got.ipAddress?.continent?.code).toEqual('NA');
      expect(got.ipAddress?.continent?.geonameId).toEqual(123456);
      expect(got.ipAddress?.continent?.names?.de).toEqual('Nordamerika');
      expect(got.ipAddress?.continent?.names?.en).toEqual('North America');
      expect(got.ipAddress?.continent?.names?.es).toEqual('América del Norte');
      expect(got.ipAddress?.continent?.names?.fr).toEqual('Amérique du Nord');
      expect(got.ipAddress?.continent?.names?.ja).toEqual('北アメリカ');
      expect(got.ipAddress?.continent?.names['pt-BR']).toEqual(
        'América do Norte'
      );
      expect(got.ipAddress?.continent?.names?.ru).toEqual('Северная Америка');
      expect(got.ipAddress?.continent?.names['zh-CN']).toEqual('北美洲');

      expect(got.ipAddress?.country?.confidence).toEqual(75);
      expect(got.ipAddress?.country?.geonameId).toEqual(6252001);
      expect(got.ipAddress?.country?.isHighRisk).toEqual(true);
      expect(got.ipAddress?.country?.isInEuropeanUnion).toEqual(true);
      expect(got.ipAddress?.country?.isoCode).toEqual('US');
      expect(got.ipAddress?.country?.names?.de).toEqual('USA');
      expect(got.ipAddress?.country?.names?.en).toEqual('United States');
      expect(got.ipAddress?.country?.names?.es).toEqual('Estados Unidos');
      expect(got.ipAddress?.country?.names?.fr).toEqual('États-Unis');
      expect(got.ipAddress?.country?.names?.ja).toEqual('アメリカ合衆国');
      expect(got.ipAddress?.country?.names['pt-BR']).toEqual('Estados Unidos');
      expect(got.ipAddress?.country?.names?.ru).toEqual('США');
      expect(got.ipAddress?.country?.names['zh-CN']).toEqual('美国');

      expect(got.ipAddress?.location?.accuracyRadius).toEqual(20);
      expect(got.ipAddress?.location?.averageIncome).toEqual(50321);
      expect(got.ipAddress?.location?.latitude).toEqual(37.6293);
      expect(got.ipAddress?.location?.localTime).toEqual(
        '2015-04-26T01:37:17-08:00'
      );
      expect(got.ipAddress?.location?.longitude).toEqual(-122.1163);
      expect(got.ipAddress?.location?.metroCode).toEqual(807);
      expect(got.ipAddress?.location?.populationDensity).toEqual(7122);
      expect(got.ipAddress?.location?.timeZone).toEqual('America/Los_Angeles');

      expect(got.ipAddress?.postal?.code).toEqual('90001');
      expect(got.ipAddress?.postal?.confidence).toEqual(10);

      expect(got.ipAddress?.registeredCountry?.geonameId).toEqual(6252001);
      expect(got.ipAddress?.registeredCountry?.isInEuropeanUnion).toEqual(true);
      expect(got.ipAddress?.registeredCountry?.isoCode).toEqual('US');
      expect(got.ipAddress?.registeredCountry?.names?.de).toEqual('USA');
      expect(got.ipAddress?.registeredCountry?.names?.en).toEqual(
        'United States'
      );
      expect(got.ipAddress?.registeredCountry?.names?.es).toEqual(
        'Estados Unidos'
      );
      expect(got.ipAddress?.registeredCountry?.names?.fr).toEqual('États-Unis');
      expect(got.ipAddress?.registeredCountry?.names?.ja).toEqual(
        'アメリカ合衆国'
      );
      expect(got.ipAddress?.registeredCountry?.names['pt-BR']).toEqual(
        'Estados Unidos'
      );
      expect(got.ipAddress?.registeredCountry?.names?.ru).toEqual('США');
      expect(got.ipAddress?.registeredCountry?.names['zh-CN']).toEqual('美国');
      expect(got.ipAddress?.representedCountry?.geonameId).toEqual(6252001);
      expect(got.ipAddress?.representedCountry?.isInEuropeanUnion).toEqual(
        true
      );
      expect(got.ipAddress?.representedCountry?.isoCode).toEqual('US');
      expect(got.ipAddress?.representedCountry?.names?.de).toEqual('USA');
      expect(got.ipAddress?.representedCountry?.names?.en).toEqual(
        'United States'
      );
      expect(got.ipAddress?.representedCountry?.names?.es).toEqual(
        'Estados Unidos'
      );
      expect(got.ipAddress?.representedCountry?.names?.fr).toEqual(
        'États-Unis'
      );
      expect(got.ipAddress?.representedCountry?.names?.ja).toEqual(
        'アメリカ合衆国'
      );
      expect(got.ipAddress?.representedCountry?.names['pt-BR']).toEqual(
        'Estados Unidos'
      );
      expect(got.ipAddress?.representedCountry?.names?.ru).toEqual('США');
      expect(got.ipAddress?.representedCountry?.names['zh-CN']).toEqual('美国');
      expect(got.ipAddress?.representedCountry?.type).toEqual('military');

      expect(got.ipAddress?.subdivisions?.[0].confidence).toEqual(50);
      expect(got.ipAddress?.subdivisions?.[0].geonameId).toEqual(5332921);
      expect(got.ipAddress?.subdivisions?.[0].isoCode).toEqual('CA');
      expect(got.ipAddress?.subdivisions?.[0].names?.de).toEqual('Kalifornien');
      expect(got.ipAddress?.subdivisions?.[0].names?.en).toEqual('California');
      expect(got.ipAddress?.subdivisions?.[0].names?.es).toEqual('California');
      expect(got.ipAddress?.subdivisions?.[0].names?.fr).toEqual('Californie');
      expect(got.ipAddress?.subdivisions?.[0].names?.ja).toEqual(
        'カリフォルニア'
      );
      expect(got.ipAddress?.subdivisions?.[0].names?.ru).toEqual('Калифорния');
      expect(got.ipAddress?.subdivisions?.[0].names['zh-CN']).toEqual('加州');

      expect(got.ipAddress?.traits?.autonomousSystemNumber).toEqual(1239);
      expect(got.ipAddress?.traits?.autonomousSystemOrganization).toEqual(
        'Linkem IR WiMax Network'
      );
      expect(got.ipAddress?.traits?.domain).toEqual('example.com');
      expect(got.ipAddress?.traits?.ipAddress).toEqual('1.2.3.0/24');
      expect(got.ipAddress?.traits?.isAnonymous).toEqual(true);
      expect(got.ipAddress?.traits?.isAnonymousProxy).toEqual(true);
      expect(got.ipAddress?.traits?.isAnonymousVpn).toEqual(true);
      expect(got.ipAddress?.traits?.isHostingProvider).toEqual(true);
      expect(got.ipAddress?.traits?.isLegitimateProxy).toEqual(false);
      expect(got.ipAddress?.traits?.isPublicProxy).toEqual(true);
      expect(got.ipAddress?.traits?.isResidentialProxy).toEqual(false);
      expect(got.ipAddress?.traits?.isSatelliteProvider).toEqual(true);
      expect(got.ipAddress?.traits?.isTorExitNode).toEqual(true);
      expect(got.ipAddress?.traits?.isp).toEqual('Linkem spa');
      expect(got.ipAddress?.traits?.organization).toEqual(
        'Linkem IR WiMax Network'
      );
      expect(got.ipAddress?.traits?.userType).toEqual('traveler');

      expect(got.device?.confidence).toEqual(99);
      expect(got.device?.id).toEqual('7835b099-d385-4e5b-969e-7df26181d73b');
      expect(got.device?.lastSeen).toEqual('2016-06-08T14:16:38Z');
      expect(got.device?.localTime).toEqual('2018-01-02T10:40:11-08:00');

      expect(got.disposition?.action).toEqual('accept');
      expect(got.disposition?.reason).toEqual('default');
      expect(got.disposition?.ruleLabel).toEqual('the label');

      expect(got.warnings?.[0].code).toEqual('INPUT_INVALID');
      expect(got.warnings?.[0].warning).toEqual(
        'Encountered value at /shipping/city that does not meet the required constraints'
      );
      expect(got.warnings?.[0].inputPointer).toEqual('/shipping/city');
    });
  });

  describe('score()', () => {
    const transaction = new Transaction({
      device: new Device({
        ipAddress: '1.1.1.1',
      }),
    });

    it('handles "full" responses', async () => {
      expect.assertions(11);

      const { client } = clientWith(() =>
        jsonResponse(200, score.response.full)
      );

      const got: models.Score = await client.score(transaction);

      expect(got?.id).toEqual('5bc5d6c2-b2c8-40af-87f4-6d61af86b6ae');
      expect(got?.riskScore).toEqual(0.01);
      expect(got?.fundsRemaining).toEqual(25);
      expect(got?.queriesRemaining).toEqual(5000);
      expect(got?.ipAddress?.risk).toEqual(0.01);
      expect(got?.disposition?.action).toEqual('accept');
      expect(got?.disposition?.reason).toEqual('default');
      expect(got?.disposition?.ruleLabel).toEqual('the label');
      expect(got?.warnings?.[0].code).toEqual('INPUT_INVALID');
      expect(got?.warnings?.[0].warning).toEqual(
        'Encountered value at /shipping/city that does not meet the required constraints'
      );
      expect(got?.warnings?.[0].inputPointer).toEqual('/shipping/city');
    });

    it('handles "no disposition" responses', async () => {
      expect.assertions(8);

      const { client } = clientWith(() =>
        jsonResponse(200, score.response.noDisposition)
      );

      const got: models.Score = await client.score(transaction);

      expect(got?.id).toEqual('5bc5d6c2-b2c8-40af-87f4-6d61af86b6ae');
      expect(got?.riskScore).toEqual(0.01);
      expect(got?.fundsRemaining).toEqual(25);
      expect(got?.queriesRemaining).toEqual(5000);
      expect(got?.ipAddress?.risk).toEqual(0.01);
      expect(got?.warnings?.[0].code).toEqual('INPUT_INVALID');
      expect(got?.warnings?.[0].warning).toEqual(
        'Encountered value at /shipping/city that does not meet the required constraints'
      );
      expect(got?.warnings?.[0].inputPointer).toEqual('/shipping/city');
    });

    it('handles "no disposition rule_label" responses', async () => {
      expect.assertions(10);

      const { client } = clientWith(() =>
        jsonResponse(200, score.response.noDispositionRuleLabel)
      );

      const got: models.Score = await client.score(transaction);

      expect(got?.id).toEqual('5bc5d6c2-b2c8-40af-87f4-6d61af86b6ae');
      expect(got?.riskScore).toEqual(0.01);
      expect(got?.fundsRemaining).toEqual(25);
      expect(got?.queriesRemaining).toEqual(5000);
      expect(got?.ipAddress?.risk).toEqual(0.01);
      expect(got?.disposition?.action).toEqual('accept');
      expect(got?.disposition?.reason).toEqual('default');
      expect(got?.warnings?.[0].code).toEqual('INPUT_INVALID');
      expect(got?.warnings?.[0].warning).toEqual(
        'Encountered value at /shipping/city that does not meet the required constraints'
      );
      expect(got?.warnings?.[0].inputPointer).toEqual('/shipping/city');
    });

    it('handles "no warnings" responses', async () => {
      expect.assertions(8);

      const { client } = clientWith(() =>
        jsonResponse(200, score.response.noWarnings)
      );

      const got: models.Score = await client.score(transaction);

      expect(got?.id).toEqual('5bc5d6c2-b2c8-40af-87f4-6d61af86b6ae');
      expect(got?.riskScore).toEqual(0.01);
      expect(got?.fundsRemaining).toEqual(25);
      expect(got?.queriesRemaining).toEqual(5000);
      expect(got?.ipAddress?.risk).toEqual(0.01);
      expect(got?.disposition?.action).toEqual('accept');
      expect(got?.disposition?.reason).toEqual('default');
      expect(got?.disposition?.ruleLabel).toEqual('the label');
    });
  });

  describe('reportTransaction', () => {
    it('handles bare minimum request', async () => {
      const report = new TransactionReport({
        ipAddress: '1.1.1.1',
        tag: Constants.Tag.CHARGEBACK,
      });

      expect.assertions(1);

      const { client } = clientWith(() => new Response(null, { status: 204 }));

      await expect(client.reportTransaction(report)).resolves.toBeUndefined();
    });

    it('handles a "full" request', async () => {
      const report = new TransactionReport({
        chargebackCode: 'foobar',
        ipAddress: '1.1.1.1',
        maxmindId: '1234',
        minfraudId: '1234',
        notes: 'hello world',
        tag: Constants.Tag.CHARGEBACK,
        transactionId: 'what the',
      });

      expect.assertions(1);

      const { client } = clientWith(() => new Response(null, { status: 204 }));

      await expect(client.reportTransaction(report)).resolves.toBeUndefined();
    });
  });

  describe('error handling', () => {
    const transaction = new Transaction({
      device: new Device({
        ipAddress: '1.1.1.1',
      }),
    });

    const expectError = async (
      promise: Promise<unknown>,
      expected: {
        code: string;
        error: string;
        status?: number;
        url: string;
        // Whether the error's `cause` should be present or absent.
        cause?: 'defined' | 'undefined';
      }
    ): Promise<WebServiceError> => {
      const { cause, ...fields } = expected;
      const err = await promise.then(
        () => {
          throw new Error('expected the request to reject');
        },
        (e: unknown) => e
      );
      expect(err).toBeInstanceOf(WebServiceError);
      const webServiceError = err as WebServiceError;
      expect(webServiceError).toMatchObject(fields);
      // The `error` property is retained as an alias of `message`.
      expect(webServiceError.message).toBe(expected.error);
      // Assert `status` explicitly (toMatchObject ignores extra own
      // properties), so a regression leaking a `status` onto a network-error
      // path is caught.
      expect(webServiceError.status).toBe(expected.status);
      if (cause === 'defined') {
        expect(webServiceError.cause).toBeDefined();
      }
      if (cause === 'undefined') {
        expect(webServiceError.cause).toBeUndefined();
      }
      return webServiceError;
    };

    it('handles timeouts', async () => {
      // The handler rejects only when the request signal aborts, which the
      // client's timeout triggers — exercising the real timeout signal and the
      // NETWORK_TIMEOUT mapping without a wall-clock delay.
      const { client } = clientWith(
        (request) =>
          new Promise<Response>((_resolve, reject) => {
            request.init?.signal?.addEventListener('abort', () =>
              reject((request.init!.signal as AbortSignal).reason)
            );
          }),
        { timeout: 10 }
      );

      // The underlying abort/timeout error is preserved as the cause.
      await expectError(client.score(transaction), {
        code: 'NETWORK_TIMEOUT',
        error: 'The request timed out',
        url: baseUrl + fullPath('score'),
        cause: 'defined',
      });
    });

    it('handles 5xx level errors', async () => {
      const { client } = clientWith(() => new Response(null, { status: 500 }));

      await expectError(client.score(transaction), {
        code: 'SERVER_ERROR',
        error: 'Received a server error with HTTP status code: 500',
        status: 500,
        url: baseUrl + fullPath('score'),
        cause: 'undefined',
      });
    });

    it('handles 3xx level errors', async () => {
      const { client } = clientWith(() => new Response(null, { status: 300 }));

      await expectError(client.score(transaction), {
        code: 'HTTP_STATUS_CODE_ERROR',
        error: 'Received an unexpected HTTP status code: 300',
        status: 300,
        url: baseUrl + fullPath('score'),
        cause: 'undefined',
      });
    });

    it('handles errors with unknown payload', async () => {
      const { client } = clientWith(() => jsonResponse(401, { foo: 'bar' }));

      await expectError(client.score(transaction), {
        code: 'INVALID_RESPONSE_BODY',
        error: 'Received an invalid or unparseable response body',
        status: 401,
        url: baseUrl + fullPath('score'),
        cause: 'undefined',
      });
    });

    test.each`
      description              | payload
      ${'a non-string code'}   | ${{ code: 123, error: 'an error' }}
      ${'a non-string error'}  | ${{ code: 'A_CODE', error: {} }}
      ${'empty string fields'} | ${{ code: '', error: '' }}
    `(
      'treats $description as an invalid response body',
      async ({ payload }) => {
        const { client } = clientWith(() => jsonResponse(400, payload));

        await expectError(client.score(transaction), {
          code: 'INVALID_RESPONSE_BODY',
          error: 'Received an invalid or unparseable response body',
          status: 400,
          url: baseUrl + fullPath('score'),
          cause: 'undefined',
        });
      }
    );

    it('preserves the cause for invalid response bodies', async () => {
      const { client } = clientWith(
        () => new Response('this is not json', { status: 200 })
      );

      const err = await expectError(client.score(transaction), {
        code: 'INVALID_RESPONSE_BODY',
        error: 'Received an invalid or unparseable response body',
        url: baseUrl + fullPath('score'),
        cause: 'defined',
      });
      // The JSON parse error is preserved as the cause. (instanceof Error is
      // unreliable here: under --experimental-vm-modules the parse error is
      // created in a different realm than this test file.)
      expect((err.cause as Error).message).toEqual(expect.any(String));
    });

    it('preserves the cause when an error response body is not JSON', async () => {
      const { client } = clientWith(
        () => new Response('this is not json', { status: 401 })
      );

      const err = await expectError(client.score(transaction), {
        code: 'INVALID_RESPONSE_BODY',
        error: 'Received an invalid or unparseable response body',
        status: 401,
        url: baseUrl + fullPath('score'),
        cause: 'defined',
      });
      // The parse failure on a non-2xx response is preserved as the cause.
      expect((err.cause as Error).message).toEqual(expect.any(String));
    });

    it('handles general fetch errors', async () => {
      const error = 'general error';

      const { client } = clientWith(() => Promise.reject(new Error(error)));

      const err = await expectError(client.score(transaction), {
        code: 'FETCH_ERROR',
        error: `Error - ${error}`,
        url: baseUrl + fullPath('score'),
        cause: 'defined',
      });
      // The original fetch error is preserved as the cause.
      expect(err.cause).toBeInstanceOf(Error);
      expect((err.cause as Error).message).toBe(error);
    });

    it('includes the underlying cause in the FETCH_ERROR message', async () => {
      const fetchError = Object.assign(new TypeError('fetch failed'), {
        cause: new Error('connect ECONNREFUSED 1.2.3.4:443'),
      });

      const { client } = clientWith(() => Promise.reject(fetchError));

      const err = await expectError(client.score(transaction), {
        code: 'FETCH_ERROR',
        error: 'TypeError - fetch failed: connect ECONNREFUSED 1.2.3.4:443',
        url: baseUrl + fullPath('score'),
        cause: 'defined',
      });
      // The original error (with its own cause) is still attached.
      expect((err.cause as Error).message).toBe('fetch failed');
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
    `('handles $code error', async ({ code, error, status }) => {
      const { client } = clientWith(() =>
        jsonResponse(status, { code, error })
      );

      await expectError(client.score(transaction), {
        code,
        error,
        status,
        url: baseUrl + fullPath('score'),
        cause: 'undefined',
      });
    });
  });
});
