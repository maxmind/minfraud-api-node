import cloneDeep = require('lodash.clonedeep');
import * as insights from '../../../fixtures/insights.json';
import Insights from './insights';

describe('Insights()', () => {
  it('handles empty country responses', () => {
    let input = cloneDeep(insights) as any;
    input = input.response.full;
    delete input.ip_address.country;

    const model = new Insights(input);

    expect(model.ipAddress?.country).toBeUndefined();
  });

  it('handles empty location responses', () => {
    let input = cloneDeep(insights) as any;
    input = input.response.full;
    delete input.ip_address.location;

    const model = new Insights(input);

    expect(model.ipAddress?.location).toBeUndefined();
  });

  it('handles empty IP address responses', () => {
    let input = cloneDeep(insights) as any;
    input = input.response.full;
    delete input.ip_address;

    const model = new Insights(input);

    expect(model.ipAddress).toBeUndefined();
  });

  it('allows /email/domain/first_seen to be accessed', () => {
    let input = cloneDeep(insights) as any;
    input = input.response.full;

    const model = new Insights(input);

    expect(model.email?.domain?.firstSeen).toBe('2016-01-23');
  });
});
