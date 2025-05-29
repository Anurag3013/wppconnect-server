// Simple test to verify phone number formatting
const { contactToArray } = require('./dist/util/functions.js');

console.log('🧪 Testing Phone Number Formatting Fix...\n');

// Test cases
const testCases = [
  // Single phone numbers
  {
    input: '5521999999999',
    expected: '5521999999999@c.us',
    type: 'Standard format',
  },
  {
    input: '+5521999999999',
    expected: '5521999999999@c.us',
    type: 'With plus sign',
  },
  {
    input: '55 21 99999-9999',
    expected: '5521999999999@c.us',
    type: 'With spaces and dash',
  },
  {
    input: '(21) 99999-9999',
    expected: '21999999999@c.us',
    type: 'With parentheses',
  },
  {
    input: '+55 (21) 99999-9999',
    expected: '5521999999999@c.us',
    type: 'Full format',
  },

  // Array of phone numbers
  {
    input: ['5521999999999', '+5521888888888', '55 21 77777-7777'],
    expected: [
      '5521999999999@c.us',
      '5521888888888@c.us',
      '5521777777777@c.us',
    ],
    type: 'Array of mixed formats',
  },

  // Group numbers
  {
    input: '120363043968123456',
    expected: '120363043968123456@g.us',
    type: 'Group',
    isGroup: true,
  },

  // Newsletter
  {
    input: '5521999999999',
    expected: '5521999999999@newsletter',
    type: 'Newsletter',
    isNewsletter: true,
  },
];

console.log('📋 Test Results:\n');

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  try {
    const result = contactToArray(
      testCase.input,
      testCase.isGroup || false,
      testCase.isNewsletter || false,
      testCase.isLid || false
    );

    const passed =
      JSON.stringify(result) ===
      JSON.stringify(
        Array.isArray(testCase.expected)
          ? testCase.expected
          : [testCase.expected]
      );

    console.log(`${index + 1}. ${testCase.type}`);
    console.log(`   Input: ${JSON.stringify(testCase.input)}`);
    console.log(`   Expected: ${JSON.stringify(testCase.expected)}`);
    console.log(`   Got: ${JSON.stringify(result)}`);
    console.log(`   Result: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);

    if (passed) passedTests++;
  } catch (error) {
    console.log(`${index + 1}. ${testCase.type}`);
    console.log(`   Input: ${JSON.stringify(testCase.input)}`);
    console.log(`   Error: ${error.message}`);
    console.log(`   Result: ❌ ERROR\n`);
  }
});

console.log(`📊 Summary: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log(
    '🎉 All tests passed! Phone number formatting is working correctly.'
  );
  console.log('\n✅ The fix should resolve the issue where:');
  console.log('   - Phone numbers were being corrupted');
  console.log('   - Messages were going to invalid numbers');
  console.log('   - Saved contacts were not being recognized');
} else {
  console.log('❌ Some tests failed. The phone formatting needs more work.');
}

console.log('\n🔧 Next steps:');
console.log('1. Build the project: npm run build:js');
console.log('2. Restart the server: npm start');
console.log('3. Test with real phone numbers in Swagger UI');
console.log('4. Verify messages go to correct saved contacts');
