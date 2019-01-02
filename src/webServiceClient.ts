export default class WebServiceClient {
  private accountID: string;
  private licenseKey: string;
  private timeout: number;

  public constructor(accountID: string, licenseKey: string, timeout = 3000) {
    this.accountID = accountID;
    this.licenseKey = licenseKey;
    this.timeout = timeout;
  }
}
