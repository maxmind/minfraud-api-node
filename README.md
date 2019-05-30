# Node.js API for MaxMind minFraud Score, Insights, and Factors

## Errors and Exceptions

Thrown by the request and transaction models:
* `ArgumentError` - Thrown when invalid data is passed to the model constructor.

## Example

```
import * as minFraud from '@maxmind/minfraud-api-node';
// const minFraud = require('@maxmind/minfraud-api-node');

// client is reusable
const client = new minFraud.WebServiceClient("1234", "LICENSEKEY");

let transaction;

try {
  transaction = new minFraud.Transaction({
    device: new minFraud.Device({
      ipAddress: "8.8.8.8",
    }),
    customInputs: [
      new CustomInput('string', value),
      new CustomInput('string', value),
    ]
  })
} catch(error) {
  // handle the error
}

client.score(transaction).then(response => {
  console.log(response.riskScore) // 50
  console.log(response.ipAddress.risk) // 50
});
```
