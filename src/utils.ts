import camelcaseKeys = require('camelcase-keys');

export const camelizeResponse = (response: any) =>
  camelcaseKeys(response, {
    deep: true,
    exclude: [/\-/],
  });
