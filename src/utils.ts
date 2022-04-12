import camelcaseKeys from 'camelcase-keys';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const camelizeResponse = (response: any) =>
  camelcaseKeys(response, {
    deep: true,
    exclude: [/-/],
  });
