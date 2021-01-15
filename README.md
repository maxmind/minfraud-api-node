# Node.js API for MaxMind minFraud Score, Insights, and Factors

## Description

This package provides an API for the [MaxMind minFraud Score, Insights,
Factors, and Report Transaction web services](https://dev.maxmind.com/minfraud/).

## Requirements

MaxMind has tested this API with Node.js versions 10 and 12.  We aim to support
active LTS versions of Node.js, as well as the latest stable release.

## Installation

```
yarn add @maxmind/minfraud-api-node
```

If you are not able to use `yarn`, you may also use `npm`:

```
npm install @maxmind/minfraud-api-node
```

## API Documentation

Documentation for this API can be found [here](https://maxmind.github.io/minfraud-api-node/)

## Usage

To use this API, first create a new `Client` object. The constructor
takes your MaxMind account ID and license key. For example:

```js
const client = new minFraud.Client("1234", "LICENSEKEY");
```

Then create a new `Transaction` object. This represents the transaction that
you are sending to minFraud. Each transaction property is instantiated by creating
a new instance of each property's class.  For example:

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

If the request fails, an error object will be returned in the catch in the form
of:

```js
{
  code: string
  error: string
  url: string
}
```

### Reporting a transaction using the Report Transactions API

MaxMind encourages the use of this API, as data received through this channel
is continually used to improve the accuracy of our fraud detection algorithms.

To use the Report Transactions API, create a new `TransactionReport` object. An
IP address and a valid tag are required key values.  Additional key values may
also be set, as documented below.

See the API documentation for more details.

```js
  const transactionReport = new minFraud.TransactionReport({
    ipAddress: '81.2.69.160',
    tag: minFraud.Constants.Tag.NOT_FRAUD,

    // The following key/values are not mandatory but are encouraged
    chargebackCode: 'the string provided by your payment processor indicating
    the reason for the chargeback',
    maxmindId: '12345678',
    minfraudId: '58fa38d8-4b87-458b-a22b-f00eda1aa20d',
    notes: 'some notes',
    transactionId: 'the transaction ID you originally passed to minFraud',
  });

  client.reportTransaction(transactionReport).then(() => ...);
```

If the request succeeds, no data is returned in the Promise.

If the request fails, an error object will be returned in the catch in the
form of:

```js
{
  code: string
  error: string
  url: string
}
```

## Errors and Exceptions

Thrown by the request and transaction models:
* `ArgumentError` - Thrown when invalid data is passed to the Transaction
and Transaction property constructors.

In addition to the [response errors](https://dev.maxmind.com/minfraud/#Errors)
returned by the web API, we also return:

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
```

## Example

```js
import { URL } from 'url'; // Used for `order.referrerUri
import * as minFraud from '@maxmind/minfraud-api-node';
// const minFraud = require('@maxmind/minfraud-api-node');

// client is reusable
const client = new minFraud.Client("1234", "LICENSEKEY");

let transaction;

try {
  transaction = new minFraud.Transaction({
    device: new minFraud.Device({
      ipAddress: "81.2.69.160",
    }),
    event: new minFraud.Event({
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
      last4digits: '1234',
      token: 'a_token',
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
[our support page](https://www.maxmind.com/en/support).

## Contributing

Patches and pull requests are encouraged. Please include unit tests whenever
possible.

## Versioning

This API uses [Semantic Versioning](https://semver.org/).

## Copyright and License

This software is Copyright (c) 2019-2021 by MaxMind, Inc.

This is free software, licensed under the Apache License, Version 2.0.
