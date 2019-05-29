import Account from './account';

describe('Account()', () => {
  it('creates `usernameMd5` from `username` if it exists', () => {
    const account = new Account({
      username: 'foo',
    });

    const noUser = new Account({
      userId: '123',
    });

    expect(account.usernameMd5).toEqual('acbd18db4cc2f85cedef654fccc4a4d8');
    expect(noUser.usernameMd5).toBeUndefined();
  });
});
