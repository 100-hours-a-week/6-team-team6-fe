const DIGITS_ONLY_PATTERN = /^\d+$/;

const isNumericPathParam = (value: string) => DIGITS_ONLY_PATTERN.test(value);

export { isNumericPathParam };
