module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Custom rules to prevent mock data
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/^(lorem|ipsum|mock|fake|placeholder|sample|dummy|admin123|your-.*-key|sk-.*-here)$/i]',
        message: 'Mock/placeholder data detected. Use real data or add TODO comment.',
      },
      {
        selector: 'TemplateLiteral[quasis.0.value.raw*="lorem"]',
        message: 'Mock/placeholder data detected. Use real data or add TODO comment.',
      },
      {
        selector: 'TemplateLiteral[quasis.0.value.raw*="mock"]',
        message: 'Mock/placeholder data detected. Use real data or add TODO comment.',
      },
      {
        selector: 'TemplateLiteral[quasis.0.value.raw*="admin123"]',
        message: 'Mock/placeholder data detected. Use real data or add TODO comment.',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        'no-restricted-syntax': 'off', // Allow mock data in test files
      },
    },
  ],
}
