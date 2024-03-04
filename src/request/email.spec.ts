import { ArgumentError } from '../errors';
import crypto from 'crypto';
import Email from './email';

describe('Email()', () => {
  it('throws an error if email.address is not valid', () => {
    const email = () =>
      new Email({
        address: '123',
      });
    expect(email).toThrowError(ArgumentError);
    expect(email).toThrowError('email.address');
  });

  it('throws an error if email.domain is not valid', () => {
    const email = () =>
      new Email({
        domain: '123',
      });
    expect(email).toThrowError(ArgumentError);
    expect(email).toThrowError('email.domain');
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
