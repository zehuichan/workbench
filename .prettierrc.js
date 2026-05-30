export default {
  endOfLine: 'auto',
  overrides: [
    {
      files: ['*.json5'],
      options: {
        quoteProps: 'preserve',
        singleQuote: false,
      },
    },
  ],
  proseWrap: 'never',
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
};
