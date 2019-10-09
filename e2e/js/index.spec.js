const minFraud = require('@maxmind/minfraud-api-node');

describe('client', () => {
  it('exists', () => {
    const client = new minFraud.Client('1234', 'foo');
    expect(new minFraud.Transaction({
      device: new minFraud.Device({
        ipAddress: '1.1.1.1',
      }),
    })).toHaveProperty('device');
  });
});
