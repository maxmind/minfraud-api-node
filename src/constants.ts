export enum EventType {
  AccountCreation = 'account_creation',
  AccountLogin = 'account_login',
  EmailChange = 'email_change',
  PasswordReset = 'password_reset',
  PayoutChange = 'payout_change',
  Purchase = 'purchase',
  RecurringPurchase = 'recurring_purchase',
  Referral = 'referral',
  Survey = 'survey',
}

export enum DeliverySpeed {
  SameDay = 'same_day',
  Overnight = 'overnight',
  Expedited = 'expedited',
  Standard = 'standard',
}

export enum Processor {
  Adyen = 'adyen',
  Affirm = 'affirm',
  Afterpay = 'afterpay',
  Altapay = 'altapay',
  AmazonPayments = 'amazon_payments',
  AmericanExpressPaymentGateway = 'american_express_payment_gateway',
  ApplePay = 'apple_pay',
  ApsPayments = 'aps_payments',
  Authorizenet = 'authorizenet',
  Balanced = 'balanced',
  Beanstream = 'beanstream',
  Bluepay = 'bluepay',
  Bluesnap = 'bluesnap',
  Boacompra = 'boacompra',
  Boku = 'boku',
  Bpoint = 'bpoint',
  Braintree = 'braintree',
  Cardknox = 'cardknox',
  Cardpay = 'cardpay',
  Cashfree = 'cashfree',
  Ccavenue = 'ccavenue',
  Ccnow = 'ccnow',
  Cetelem = 'cetelem',
  ChasePaymentech = 'chase_paymentech',
  CheckoutCom = 'checkout_com',
  Cielo = 'cielo',
  Collector = 'collector',
  Commdoo = 'commdoo',
  Compropago = 'compropago',
  ConceptPayments = 'concept_payments',
  Conekta = 'conekta',
  Coregateway = 'coregateway',
  Creditguard = 'creditguard',
  Credorax = 'credorax',
  CtPayments = 'ct_payments',
  Cuentadigital = 'cuentadigital',
  Curopayments = 'curopayments',
  Cybersource = 'cybersource',
  Dalenys = 'dalenys',
  Dalpay = 'dalpay',
  Datacap = 'datacap',
  Datacash = 'datacash',
  Dibs = 'dibs',
  DigitalRiver = 'digital_river',
  Dlocal = 'dlocal',
  Dotpay = 'dotpay',
  Ebs = 'ebs',
  Ecomm365 = 'ecomm365',
  Ecommpay = 'ecommpay',
  Elavon = 'elavon',
  Emerchantpay = 'emerchantpay',
  Epay = 'epay',
  Epayco = 'epayco',
  EprocessingNetwork = 'eprocessing_network',
  Epx = 'epx',
  Eway = 'eway',
  Exact = 'exact',
  FirstAtlanticCommerce = 'first_atlantic_commerce',
  FirstData = 'first_data',
  Fiserv = 'fiserv',
  G2aPay = 'g2a_pay',
  GlobalPayments = 'global_payments',
  Gocardless = 'gocardless',
  GooglePay = 'google_pay',
  Heartland = 'heartland',
  Hipay = 'hipay',
  Ingenico = 'ingenico',
  Interac = 'interac',
  Internetsecure = 'internetsecure',
  IntuitQuickbooksPayments = 'intuit_quickbooks_payments',
  Iugu = 'iugu',
  Klarna = 'klarna',
  Komoju = 'komoju',
  LemonWay = 'lemon_way',
  MastercardPaymentGateway = 'mastercard_payment_gateway',
  Mercadopago = 'mercadopago',
  Mercanet = 'mercanet',
  MerchantEsolutions = 'merchant_esolutions',
  Mirjeh = 'mirjeh',
  Mollie = 'mollie',
  MonerisSolutions = 'moneris_solutions',
  Neopay = 'neopay',
  Neosurf = 'neosurf',
  Nmi = 'nmi',
  Oceanpayment = 'oceanpayment',
  Oney = 'oney',
  Onpay = 'onpay',
  Openbucks = 'openbucks',
  Openpaymx = 'openpaymx',
  OptimalPayments = 'optimal_payments',
  Orangepay = 'orangepay',
  Other = 'other',
  PacnetServices = 'pacnet_services',
  Payconex = 'payconex',
  Payeezy = 'payeezy',
  Payfast = 'payfast',
  Paygate = 'paygate',
  Paylike = 'paylike',
  PaymentExpress = 'payment_express',
  Paymentwall = 'paymentwall',
  Payone = 'payone',
  Paypal = 'paypal',
  Payplus = 'payplus',
  Paysafecard = 'paysafecard',
  Paysera = 'paysera',
  Paystation = 'paystation',
  Paytm = 'paytm',
  Paytrace = 'paytrace',
  Paytrail = 'paytrail',
  Payture = 'payture',
  Payulatam = 'payulatam',
  Payvision = 'payvision',
  Payu = 'payu',
  Payway = 'payway',
  Payza = 'payza',
  Pinpayments = 'pinpayments',
  Placetopay = 'placetopay',
  Posconnect = 'posconnect',
  PrincetonPaymentSolutions = 'princeton_payment_solutions',
  Psigate = 'psigate',
  PxpFinancial = 'pxp_financial',
  Qiwi = 'qiwi',
  Quickpay = 'quickpay',
  Raberil = 'raberil',
  Razorpay = 'razorpay',
  Rede = 'rede',
  Redpagos = 'redpagos',
  Rewardspay = 'rewardspay',
  Safecharge = 'safecharge',
  Sagepay = 'sagepay',
  Securetrading = 'securetrading',
  ShopifyPayments = 'shopify_payments',
  SimplifyCommerce = 'simplify_commerce',
  Skrill = 'skrill',
  Smartcoin = 'smartcoin',
  Smartdebit = 'smartdebit',
  SolidtrustPay = 'solidtrust_pay',
  SpsDecidir = 'sps_decidir',
  Stripe = 'stripe',
  Synapsefi = 'synapsefi',
  Systempay = 'systempay',
  Telerecargas = 'telerecargas',
  Towah = 'towah',
  TransactPro = 'transact_pro',
  Trustly = 'trustly',
  Trustpay = 'trustpay',
  Tsys = 'tsys',
  UsaEpay = 'usa_epay',
  Vantiv = 'vantiv',
  Verepay = 'verepay',
  Vericheck = 'vericheck',
  Vindicia = 'vindicia',
  VirtualCardServices = 'virtual_card_services',
  Vme = 'vme',
  Vpos = 'vpos',
  Windcave = 'windcave',
  Wirecard = 'wirecard',
  Worldpay = 'worldpay',
}

export enum Tag {
  CHARGEBACK = 'chargeback',
  NOT_FRAUD = 'not_fraud',
  SPAM_OR_ABUSE = 'spam_or_abuse',
  SUSPECTED_FRAUD = 'suspected_fraud',
}
