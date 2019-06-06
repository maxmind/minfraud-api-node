import * as crypto from 'crypto';

interface AccountProps {
  userId?: string;
  username?: string;
}

export default class Account {
  public userId?: string;
  public usernameMd5?: string;

  public constructor(account: AccountProps) {
    this.userId = account.userId;

    if (account.username) {
      this.usernameMd5 = crypto
        .createHash('md5')
        .update(account.username)
        .digest('hex');
    }
  }
}
