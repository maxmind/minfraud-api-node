import * as insightsJson from '../../../fixtures/insights.json';
import { InsightsResponse } from '../web-records';
import Insights from './insights';

describe('Insights()', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let response: any;

  beforeEach(() => {
    const fixture = structuredClone(insightsJson);
    response = fixture.response.full;
  });

  it('handles empty country responses', () => {
    delete response.ip_address.country;
    const model = new Insights(response as InsightsResponse);
    expect(model.ipAddress?.country).toBeUndefined();
  });

  it('handles empty location responses', () => {
    delete response.ip_address.location;
    const model = new Insights(response as InsightsResponse);
    expect(model.ipAddress?.location).toBeUndefined();
  });

  it('handles empty IP address responses', () => {
    delete response.ip_address;
    const model = new Insights(response as InsightsResponse);
    expect(model.ipAddress).toBeUndefined();
  });

  it('allows /email/domain/first_seen to be accessed', () => {
    const model = new Insights(response as InsightsResponse);
    expect(model.email?.domain?.firstSeen).toBe('2016-01-23');
  });

  it('allows /email/domain/classification to be accessed', () => {
    const model = new Insights(response as InsightsResponse);
    expect(model.email?.domain?.classification).toBe('business');
  });

  it('allows /email/domain/risk to be accessed', () => {
    const model = new Insights(response as InsightsResponse);
    expect(model.email?.domain?.risk).toBe(15.5);
  });

  it('allows /email/domain/volume to be accessed', () => {
    const model = new Insights(response as InsightsResponse);
    expect(model.email?.domain?.volume).toBe(6300);
  });

  it('allows /email/domain/visit/status to be accessed', () => {
    const model = new Insights(response as InsightsResponse);
    expect(model.email?.domain?.visit?.status).toBe('live');
  });

  it('allows /email/domain/visit/last_visited_on to be accessed', () => {
    const model = new Insights(response as InsightsResponse);
    expect(model.email?.domain?.visit?.lastVisitedOn).toBe('2024-11-15');
  });

  it('allows /email/domain/visit/has_redirect to be accessed', () => {
    const model = new Insights(response as InsightsResponse);
    expect(model.email?.domain?.visit?.hasRedirect).toBe(false);
  });
});
