# Node.js API for MaxMind minFraud

## Description

This package provides a server-side API for the [MaxMind minFraud Score,
Insights, Factors, and Report Transaction web
services](https://dev.maxmind.com/minfraud/).

**This package will not work client-side.**

## Requirements

MaxMind has tested this API with Node.js versions 22 and 24. We aim to support
active or maintained LTS versions of Node.js.

## Installation

```
npm install @maxmind/minfraud-api-node
```

You can also use `yarn` or `pnpm`.

## API Documentation

Documentation for this API can be found [here](https://maxmind.github.io/minfraud-api-node/)

## Usage

To use this API, first create a new `Client` object. The constructor
takes your MaxMind account ID and license key. For example:

```js
const client = new minFraud.Client("1234", "LICENSEKEY");
```

The constructor also takes an optional third argument: an options object with
`timeout` (milliseconds, default `3000`), `host` (default `minfraud.maxmind.com`),
and `fetcher` (a custom `fetch` implementation, e.g. to route requests through a
proxy or custom dispatcher). If you would like to use the Sandbox environment,
set `host` to `sandbox.maxmind.com`:

```js
const client = new minFraud.Client("1234", "LICENSEKEY", { host: 'sandbox.maxmind.com' });
```

For backward compatibility, a number may be passed as the third argument and is
treated as the `timeout`, though this is deprecated.

Then create a new `Transaction` object. This represents the transaction that
you are sending to minFraud. Each transaction property is instantiated by creating
a new instance of each property's class. For example:

```js
const transaction = new minFraud.Transaction({
  device: new minFraud.Device({
    ipAddress: '81.2.69.160',
  }),
  email: new minFraud.Email({
    address: 'foo@bar.com',
    domain: 'bar.com',
  }),
});
```

If Transaction instantiation fails, an `ArgumentError` is thrown. This is usually
due to invalid property values.

After creating the Transaction object, you can send a Score, Insights, or Factors
request, which returns a Promise that contains the corresponding model:

```js
// minFraud Score
client.score(transaction).then(scoreResponse => ...);

// minFraud Insights
client.insights(transaction).then(insightsResponse => ...);

// minFraud Factors
client.factors(transaction).then(factorsResponse => ...);
```

If the request fails, the returned promise rejects with a `WebServiceError`.
This extends the built-in `Error` and has the following shape:

```js
{
  code: string
  error: string
  status?: number
  url: string
  cause?: unknown // the underlying error, when one exists
}
```

`error` is also available as the standard `Error` `message`, and when the
failure was caused by another error (for example, a network failure), the
original error is available as `cause`.

### Reporting a transaction using the Report Transactions API

MaxMind encourages the use of this API, as data received through this channel
is continually used to improve the accuracy of our fraud detection algorithms.

To use the Report Transactions API, create a new `TransactionReport` object. A
valid tag and at least one of the following are required parameters:
IP address, maxmind ID, minfraud ID, or transaction ID. Additional key values
may also be set, as documented below.

See the API documentation for more details.

```js
  const transactionReport = new minFraud.TransactionReport({
    tag: minFraud.Constants.Tag.NOT_FRAUD,

    // The following key/values are not mandatory but are encouraged
    chargebackCode: 'the string provided by your payment processor indicating the reason for the chargeback',
    ipAddress: '81.2.69.160',
    maxmindId: '12345678',
    minfraudId: '58fa38d8-4b87-458b-a22b-f00eda1aa20d',
    notes: 'some notes',
    transactionId: 'the transaction ID you originally passed to minFraud',
  });

  client.reportTransaction(transactionReport).then(() => ...);
```

If the request succeeds, no data is returned in the Promise.

If the request fails, the returned promise rejects with a `WebServiceError`
(see above for its shape).

## Errors and Exceptions

Thrown by the request and transaction models:
* `ArgumentError` - Thrown when invalid data is passed to the Transaction
and Transaction property constructors.

Web service failures reject with a `WebServiceError`, which extends `Error`.
It exposes `code`, `error`, an optional `status`, `url`, and, when the failure
was caused by another error, the standard `cause` property. Both
`ArgumentError` and `WebServiceError` (along with the `WebServiceClientError`
type) are exported from the package.

In addition to the [response errors](https://dev.maxmind.com/minfraud/api-documentation/responses/?lang=en#errors)
returned by the web API, we also return these `code` values:

```js
{
  code: 'SERVER_ERROR',
  error: <string>
}

{
  code: 'HTTP_STATUS_CODE_ERROR',
  error: <string>
}

{
  code: 'INVALID_RESPONSE_BODY',
  error: <string>
}

{
  code: 'NETWORK_TIMEOUT',
  error: <string>
}

{
  code: 'FETCH_ERROR',
  error: <string>
}
```

For `FETCH_ERROR`, the `error` message includes the underlying failure reason
(for example, a DNS or connection error) when one is available, and the
original error is also attached as `cause`.

## Example

```js
import * as minFraud from '@maxmind/minfraud-api-node';

// client is reusable
const client = new minFraud.Client("1234", "LICENSEKEY");

let transaction;

try {
  transaction = new minFraud.Transaction({
    device: new minFraud.Device({
      ipAddress: "81.2.69.160",
      trackingToken: "abc123",
    }),
    event: new minFraud.Event({
      party: minFraud.Constants.EventParty.Customer,
      shopId: 'shop',
      time: new Date(Date.now()),
      transactionId: 'txn1234',
      type: minFraud.Constants.EventType.PayoutChange,
    }),
    account: new minFraud.Account({
      userId: 'user123',
      username: 'userperson',
    }),
    email: new minFraud.Email({
      address: 'foo@bar.com',
      domain: 'bar.com',
    }),
    billing: new minFraud.Billing({
      address: '123 Robot Ave.',
      address2: 'Suite 10011',
      city: 'Waltham',
      company: 'Robots Inc.',
      country: 'US',
      firstName: 'Robot',
      lastName: 'Bar',
      phoneCountryCode: '1',
      phoneNumber: '123-456-1234',
      postal: '12345',
      region: 'MA',
    }),
    shipping: new minFraud.Shipping({
      address: '123 Robot Ave.',
      address2: 'Suite 10011',
      city: 'Waltham',
      company: 'Robots Inc.',
      country: 'US',
      deliverySpeed: minFraud.Constants.DeliverySpeed.Expedited,
      firstName: 'Robot',
      lastName: 'Bar',
      phoneCountryCode: '1',
      phoneNumber: '123-456-0000',
      postal: '12345',
      region: 'MA',
    }),
    payment: new minFraud.Payment({
      declineCode: 'A',
      method: minFraud.Constants.PaymentMethod.Card,
      processor: minFraud.Constants.Processor.ConceptPayments,
      wasAuthorized: true,
    }),
    creditCard: new minFraud.CreditCard({
      avsResult: 'A',
      bankName: 'Foo Bank',
      bankPhoneCountryCode: '1',
      bankPhoneNumber: '123-123-1234',
      cvvResult: 'B',
      issuerIdNumber: '411111',
      lastDigits: '1234',
      token: 'a_token',
      was3DSecureSuccessful: true,
    }),
    order: new minFraud.Order({
      affiliateId: 'robotnet',
      amount: 22.99,
      currency: 'USD',
      discountCode: 'COUPONS',
      hasGiftMessage: true,
      isGift: true,
      referrerUri: new URL('https://robots.com/swarms'),
      subaffiliateId: 'swarm',
    }),
    shoppingCart: [
      new minFraud.ShoppingCartItem({
        category: 'screws',
        itemId: 'sc123',
        price: 9.99,
        quantity: 100,
      }),
      new minFraud.ShoppingCartItem({
        category: 'screws',
        itemId: 'sc123',
        price: 9.99,
        quantity: 100,
      }),
    ],
    customInputs: [
      new minFraud.CustomInput('key', 'value'),
      new minFraud.CustomInput('key_2', true),
      new minFraud.CustomInput('key_3', 100),
    ]
  });
} catch(error) {
  // handle the error
}

client.score(transaction as minFraud.Transaction).then(response => {
  console.log(response.riskScore) // 50
  console.log(response.ipAddress.risk) // 50
});
```

## Support

Please report all issues with this code using the
[GitHub issue tracker](https://github.com/maxmind/minfraud-api-node/issues).

If you are having an issue with the minFraud service that is not specific
to the client API, please see
[our support page](https://support.maxmind.com/knowledge-base).

## Contributing

Patches and pull requests are encouraged. Please include unit tests whenever
possible.

## Versioning

This API uses [Semantic Versioning](https://semver.org/).

## Copyright and License

This software is Copyright (c) 2019-2026 by MaxMind, Inc.

This is free software, licensed under the Apache License, Version 2.0.
