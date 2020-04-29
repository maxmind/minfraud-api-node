type CustomInputValue = boolean | number | string | undefined;

/**
 * Custom inputs to be used in Custom Rules. In order to use custom inputs, you
 * must set them up from your account portal.
 */
export default class CustomInput {
  [key: string]: CustomInputValue;

  public constructor(key: string, value?: CustomInputValue) {
    this[key] = value;
  }
}
