export const validFormData = {
  email: 'john.doe@example.com',
  phone: '1234567890',
  zip: '12345',
};

export const invalidEmailFormats = [
  'invalid-email',
  'invalid@',
  '@invalid.com',
  'invalid@.com',
  'invalid@com',
  '',
];

export const invalidZipCodes = [
  '1234', // 4 digits
  '123456', // 6 digits
  'abcd', // non-digits
  '1234a', // contains letters
  '12-45', // contains dash
  '',
];

export const invalidPhoneNumbers = [
  '123456789', // 9 digits
  '12345678901', // 11 digits
  'abcd', // non-digits
  '123-456-7890', // contains dashes
  '(123)456-7890', // contains parentheses/dashes
  '123 456 7890', // contains spaces
  '',
];
