type CustomInputValue = boolean | number | string | undefined;

export default class CustomInput {
  [key: string]: CustomInputValue;

  public constructor(key: string, value?: CustomInputValue) {
    this[key] = value;
  }
}
