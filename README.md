# Node.js API for MaxMind minFraud Score, Insights, and Factors

## Usage

```
import * as minFraud from '@maxmind/minfraud-api-node';
// const minFraud = require('@maxmind/minfraud-api-node');

const client = new minFraud.WebServiceClient("1234", "LICENSEKEY");

const transaction = new minFraud.Transaction({
  device: new minFraud.Device({
    ipAddress: "8.8.8.8",
  }),
})

client.score(transaction).then(response => {
  console.log(response.riskScore) // 50
  console.log(response.ipAddress.risk) // 50
});
```
