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
});
