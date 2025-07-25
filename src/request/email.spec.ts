import { ArgumentError } from '../errors';
import crypto from 'crypto';
import Email from './email';

describe('Email()', () => {
  it('throws an error if email.address is not valid', () => {
    const email = () =>
      new Email({
        address: '123',
      });
    expect(email).toThrow(ArgumentError);
    expect(email).toThrow('email.address');
  });

  it('email.address with trailing period is not valid', () => {
    const email = () =>
      new Email({
        address: 'foo@example.com.',
      });
    expect(email).toThrow(ArgumentError);
    expect(email).toThrow('email.address');
  });

  it('email.address with multiple trailing periods is not valid', () => {
    const email = () =>
      new Email({
        address: 'foo@example.com...',
      });
    expect(email).toThrow(ArgumentError);
    expect(email).toThrow('email.address');
  });

  it('throws an error if email.domain is not valid', () => {
    const email = () =>
      new Email({
        domain: '123',
      });
    expect(email).toThrow(ArgumentError);
    expect(email).toThrow('email.domain');
  });

  it('constructs', () => {
    expect(() => {
      new Email({
        address: 'foo@bar.com',
        domain: 'bar.com',
      });
    }).not.toThrow();
  });

  it('constructs without email.address', () => {
    expect(() => {
      new Email({
        domain: 'bar.com',
      });
    }).not.toThrow();
  });

  it('sets email.address', () => {
    const email = new Email({
      address: 'foo@bar.com',
      domain: 'bar.com',
    });

    expect(email.address).toBe('foo@bar.com');
    expect(email.domain).toBe('bar.com');
  });

  it('hashes email.address', () => {
    const email = new Email({
      address: 'foo@bar.com',
      domain: 'bar.com',
      hashAddress: true,
    });

    expect(email.address).toBe('f3ada405ce890b6f8204094deb12d8a8');
    expect(email.domain).toBe('bar.com');
  });

  it('sets email.domain if email.address is given', () => {
    const email = new Email({
      address: 'foo@bar.com',
    });

    expect(email.domain).toBe('bar.com');
  });

  const md5 = (s: string): string => {
    return crypto.createHash('md5').update(s).digest('hex');
  };

  const normalizeTests = [
    {
      email: 'test@maxmind.com',
      md5: '977577b140bfb7c516e4746204fbdb01',
      domain: 'maxmind.com',
    },
    {
      email: 'Test@maxmind.com',
      md5: '977577b140bfb7c516e4746204fbdb01',
      domain: 'maxmind.com',
    },
    // '  Test@maxmind.com' is rejected as invalid.
    {
      email: 'Test+alias@maxmind.com',
      md5: '977577b140bfb7c516e4746204fbdb01',
      domain: 'maxmind.com',
    },
    {
      email: 'Test+007+008@maxmind.com',
      md5: '977577b140bfb7c516e4746204fbdb01',
      domain: 'maxmind.com',
    },
    {
      email: 'Test+@maxmind.com',
      md5: '977577b140bfb7c516e4746204fbdb01',
      domain: 'maxmind.com',
    },
    // 'Test@maxmind.com.' is rejected as invalid.
    {
      email: '+@maxmind.com',
      md5: 'aa57884e48f0dda9fc6f4cb2bffb1dd2',
      domain: 'maxmind.com',
    },
    // 'Test@ maxmind.com' is rejected as invalid.
    {
      email: 'Test+foo@yahoo.com',
      md5: 'a5f830c699fd71ad653aa59fa688c6d9',
      domain: 'yahoo.com',
    },
    {
      email: 'Test-foo@yahoo.com',
      md5: '88e478531ab3bc303f1b5da82c2e9bbb',
      domain: 'yahoo.com',
    },
    {
      email: 'Test-foo-foo2@yahoo.com',
      md5: '88e478531ab3bc303f1b5da82c2e9bbb',
      domain: 'yahoo.com',
    },
    {
      email: 'Test-foo@gmail.com',
      md5: '6f3ff986fa5e830dbbf08a942777a17c',
      domain: 'gmail.com',
    },
    {
      email: 'test@gmail.com',
      md5: '1aedb8d9dc4751e229a335e371db8058',
      domain: 'gmail.com',
    },
    {
      email: 'test@gamil.com',
      md5: '1aedb8d9dc4751e229a335e371db8058',
      domain: 'gamil.com',
    },
    {
      email: 'test@bücher.com',
      md5: '24948acabac551360cd510d5e5e2b464',
      domain: 'bücher.com',
    },
    {
      email: 'Test+alias@Bücher.com',
      md5: '24948acabac551360cd510d5e5e2b464',
      domain: 'Bücher.com',
    },
    // 'test' is rejected as invalid.
    // 'test@' is rejected as invalid.
    // 'test@.' is rejected as invalid.
    {
      email: 'foo@googlemail.com',
      md5: md5('foo@gmail.com'),
      domain: 'googlemail.com',
    },
    {
      email: 'foo.bar.baz@gmail.com',
      md5: md5('foobarbaz@gmail.com'),
      domain: 'gmail.com',
    },
    {
      email: 'alias@user.fastmail.com',
      md5: md5('user@fastmail.com'),
      domain: 'user.fastmail.com',
    },
    {
      email: 'foo@bar.example.com',
      md5: md5('foo@bar.example.com'),
      domain: 'bar.example.com',
    },
    {
      email: 'foo-bar@ymail.com',
      md5: md5('foo@ymail.com'),
      domain: 'ymail.com',
    },
    {
      email: 'foo@example.com.com',
      md5: md5('foo@example.com'),
      domain: 'example.com.com',
    },
    {
      email: 'foo@example.comfoo',
      md5: md5('foo@example.comfoo'),
      domain: 'example.comfoo',
    },
    {
      email: 'foo@example.cam',
      md5: md5('foo@example.cam'),
      domain: 'example.cam',
    },
    {
      email: 'foo@10000gmail.com',
      md5: md5('foo@gmail.com'),
      domain: '10000gmail.com',
    },
    {
      email: 'foo@example.comcom',
      md5: md5('foo@example.com'),
      domain: 'example.comcom',
    },
    {
      email: 'example@bu\u0308cher.com',
      md5: '2b21bc76dab3c8b1622837c1d698936c',
      domain: 'bu\u0308cher.com',
    },
    {
      email: 'example@b\u00FCcher.com',
      md5: '2b21bc76dab3c8b1622837c1d698936c',
      domain: 'b\u00FCcher.com',
    },
    {
      email: 'bu\u0308cher@example.com',
      md5: '53550c712b146287a2d0dd30e5ed6f4b',
      domain: 'example.com',
    },
    {
      email: 'b\u00FCcher@example.com',
      md5: '53550c712b146287a2d0dd30e5ed6f4b',
      domain: 'example.com',
    },
  ];

  test.each(normalizeTests)('%p', (arg) => {
    const email = new Email({
      address: arg.email,
      hashAddress: true,
    });

    expect(email.address).toBe(arg.md5);
    expect(email.domain).toBe(arg.domain);
  });
});
