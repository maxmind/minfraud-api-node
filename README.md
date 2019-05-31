# Node.js API for MaxMind minFraud Score, Insights, and Factors

## Errors and Exceptions

Thrown by the request and transaction models:
* `ArgumentError` - Thrown when invalid data is passed to the model constructor.

## Example

```
import * as minFraud from '@maxmind/minfraud-api-node';
// const minFraud = require('@maxmind/minfraud-api-node');

// client is reusable
const client = new minFraud.Client("1234", "LICENSEKEY");

let transaction;

try {
  transaction = new minFraud.Transaction({
    // device is required
    device: new minFraud.Device({
      ipAddress: "8.8.8.8",
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
      phoneNumber: '321-321-3211',
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
      phoneNumber: '321-321-3211',
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
      issuerIdNumber: '123456',
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
      referrerUri: 'https://robots.com/swarms',
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
  })
} catch(error) {
  // handle the error
}

client.score(transaction).then(response => {
  console.log(response.riskScore) // 50
  console.log(response.ipAddress.risk) // 50
});
```
