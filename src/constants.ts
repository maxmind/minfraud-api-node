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
