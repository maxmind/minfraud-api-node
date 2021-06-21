import camelcaseKeys from 'camelcase-keys';

export const camelizeResponse = (response: any) =>
  camelcaseKeys(response, {
    deep: true,
    exclude: [/\-/],
  });
