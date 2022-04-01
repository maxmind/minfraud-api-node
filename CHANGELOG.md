CHANGELOG
=========

4.6.0
------------------

* Added `ShopifyPayments` to the `Processor` enum.

4.5.0 (2022-03-28)
------------------

* Added the input `/credit_card/country`. This is the country where the
  issuer of the card is located. This may be passed instead of the
  `/credit_card/issuer_id_number` if you do not wish to pass partial
  account numbers or if your payment processor does not provide them. You
  may provide this by providing `country` to `CreditCard`.

4.4.0 (2022-01-25)
------------------

* Added the following new values to the `Processor` enum:
  * `Boacompra`
  * `Boku`
  * `Coregateway`
  * `Fiserv`
  * `Neopay`
  * `Neosurf`
  * `Openbucks`
  * `Paysera`
  * `Payvision`
  * `Trustly`
  * `Windcave`
* Updated dependencies.
* Added mobile country code (MCC) and mobile network code (MNC) to minFraud
  Insights and Factors responses. These are available at
  `response.ipAddress.traits.mobileCountryCode` and
  `response.ipAddress.traits.mobileNetworkCode`. We expect this data to be
  available by late January, 2022.
* `creditCard.last4digits` has been deprecated in favor of `creditCard.lastDigits`
   and will be removed in a future release. `lastDigits`/`last4digits` also now
   supports two digit values in addition to the previous four digit values.
* Eight digit `creditCard.issuerIdNumber` inputs are now supported in addition to
  the previously accepted six digit `issuerIdNumber`. In most cases, you should
  send the last four digits for `creditCard.lastDigits`. If you send a
  `issuerIdNumber` that contains an eight digit IIN, and if the credit card brand
  is not one of the following, you should send the last two digits for
  `lastDigits`:
  * `Discover`
  * `JCB`
  * `Mastercard`
  * `UnionPay`
  * `Visa`

4.3.0 (2021-08-31)
------------------

* Added support for the new `test` disposition action.
* Added support for the `/disposition/rule_label` output in Score, Insights and
  Factors. This is available at `response.disposition.ruleLabel()`, and is the
  label of the custom rule that was triggered by the transaction.
* Added support for the `/credit_card/was_3d_secure_successful` input in Score,
  Insights and Factors. The input should indicate whether or not the outcome of
  3D-Secure verification (e.g. Safekey, SecureCode, Verified by Visa) was
  successful. `true` if customer verification was successful, or `false` if the
  customer failed verification. If 3-D Secure verification was not used, was
  unavailable, or resulted in another outcome other than success or failure, do
  not include this field. Use the `was3DSecureSuccessful` property in a call to
  `new minFraud.CreditCard()` to set it.

4.2.0 (2021-08-18)
------------------

* Upgrade yarn modules

4.1.0 (2021-07-09)
------------------

* Add `Datacap` to the `Processor` enum.
* Upgrade yarn modules

4.0.1 (2021-06-29)
------------------

* Fix: IP address response is optional. [Issue 515](https://github.com/maxmind/minfraud-api-node/issues/515)

4.0.0 (2021-06-21)
------------------

* **Breaking** Drop Node 10 support
* Upgrade yarn dependencies

3.4.0 (2021-04-13)
------------------

* Add the following new values to the `Processor` enum:
  * `Cardknox`
  * `Creditguard`
  * `Credorax`
  * `Dlocal`
  * `Onpay`
  * `Safecharge`
* Upgrade yarn dependencies
* Update `@maxmind/geoip2-node`. The `staticIpScore` property was
  incorrectly spelled `staticIPScore`. This is now fixed.

3.3.0 (2020-03-17)
------------------

* Upgrade yarn dependencies

3.2.0 (2020-02-16)
------------------

* Upgrade yarn dependencies

3.1.0 (2021-02-02)
------------------

* Added support for the IP address risk reasons in the minFraud Insights and
  Factors responses. This is available at `response.ipAddress.riskReasons`.
* Upgraded yarn dependencies

3.0.0 (2021-01-19)
------------------

* Added `ApplePay` and `ApsPayments` to the `Processor` enum.
* Added additional normalizing of the email address when it is sent as an
  MD5 hash instead of plain text.
* Upgrade yarn dependencies

### Breaking change

The email address field is now sent to the web service in plain text unless
you enable the new `hashAddress` option on `EmailProps`. Enabling this
option sends the MD5 hash of the address to the web service instead.
Previously the address was always sent as an MD5 hash. The new default
behavior matches that of other official minFraud API clients. Note the
email domain is always sent in plain text.

2.1.0 (2021-01-11)
------------------

* Upgrade yarn dependencies

2.0.0 (2020-11-09)
------------------

### Breaking change
`country` and `location` insights values return undefined instead of {} when empty.

1.10.0 (2020-10-14)
------------------

* Added `Tsys` to the `Processor` enum.
* The device IP address is no longer a required input.

1.9.0 (2020-09-30)
------------------

* Update `@maxmind/geoip2-node` to a version that supports
  `response.ipAddress.traits.isResidentialProxy`.

1.8.0 (2020-07-17)
------------------

* Add the following new values to the `Processor` enum:
  * `Cashfree`
  * `FirstAtlanticCommerce`
  * `Komoju`
  * `Paytm`
  * `Razorpay`
  * `Systempay`
* Add `device`, `emailLocalPart`, and `shippingAddress` to subscores

1.7.0 (2020-06-16)
------------------

* Added support for the Report Transaction API.
* Added documentation to response and request parameters

1.6.0 (2020-04-06)
------------------

* Added support for the new credit card output `/credit_card/is_business`.
  This indicates whether the card is a business card. It may be accessed via
  `response.creditCard.isBusiness` on the minFraud Insights and Factors
  response objects.

1.5.0 (2020-03-26)
------------------

* Add support for the `/email/domain/first_seen` output. This may be
  accessed via `response.email.domain.firstSeen` on the minFraud Insights
  and Factors objects.
* Add the following new values to the `Processor` enum:
  * `Cardpay`
  * `Epx`

1.4.0 (2020-02-21)
------------------

* Add support for the `/email/is_disposable` output.
* Upgrade yarn dependencies

1.3.0 (2020-01-09)
------------------

* **Drop support for Node 8.**
* Add the following new values to the `Processor` enum:
  * `Cetelem`
  * `Ecommpay`
  * `G2aPay`
  * `Mercanet`
* Upgrade yarn dependencies

1.2.0 (2019-09-24)
-----------------

* Add the following new values to the `Processor` enum:
  * `Affirm`
  * `Interac`

1.0.0 (2019-08-22)
-----------------

* Point package.json's main to dist/src/index.js

0.2.0 (2019-06-26)
------------------

* Add the following new values to the `Processor` enum:
  * `Afterpay`
  * `Dotpay`
  * `Klarna`
  * `Paysafecard`

0.1.2 (2019-06-18)
------------------

* Fix user-agent header in request

0.1.1 (2019-06-13)
------------------

* Fix Insights and Factors response

0.1.0 (2019-06-13)
------------------

* Initial release.
