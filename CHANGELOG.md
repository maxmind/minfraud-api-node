CHANGELOG
=========

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
