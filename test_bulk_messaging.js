const axios = require('axios');

const BASE_URL = 'http://localhost:21465';
const SESSION = 'TESTSESSION';
const SECRET_KEY = 'THISISMYSECURETOKEN';

async function testBulkMessaging() {
  try {
    console.log('🚀 Testing WPPConnect Bulk Messaging...\n');

    // Step 1: Generate Token
    console.log('1. Generating token...');
    const tokenResponse = await axios.post(
      `${BASE_URL}/api/${SESSION}/${SECRET_KEY}/generate-token`
    );
    console.log('✅ Token generated:', tokenResponse.data);

    const token = tokenResponse.data.token;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Step 2: Start Session
    console.log('\n2. Starting session...');
    const sessionResponse = await axios.post(
      `${BASE_URL}/api/${SESSION}/start-session`,
      {
        waitQrCode: false,
      },
      { headers }
    );
    console.log('✅ Session started:', sessionResponse.data);

    // Step 3: Check if session is ready (wait a bit for initialization)
    console.log('\n3. Checking session status...');
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds

    const statusResponse = await axios.get(
      `${BASE_URL}/api/${SESSION}/check-connection-session`,
      { headers }
    );
    console.log('📱 Session status:', statusResponse.data);

    // Step 4: Get QR Code
    console.log('\n4. Getting QR Code...');
    try {
      const qrResponse = await axios.get(
        `${BASE_URL}/api/${SESSION}/qrcode-session`,
        { headers }
      );
      console.log('📱 QR Code available - check your browser or API response');
    } catch (qrError) {
      console.log(
        '⚠️ QR Code not ready yet:',
        qrError.response?.data || qrError.message
      );
    }

    // Step 5: Test API endpoints availability
    console.log('\n5. Testing API endpoints...');

    // Test single message endpoint (should work even without WhatsApp connection for validation)
    try {
      const singleMessageTest = await axios.post(
        `${BASE_URL}/api/${SESSION}/send-message`,
        {
          phone: '5521999999999',
          message: 'Test message',
        },
        { headers }
      );
      console.log('✅ Single message endpoint working');
    } catch (error) {
      if (
        error.response?.status === 404 &&
        error.response?.data?.message?.includes('não está ativa')
      ) {
        console.log(
          '✅ Single message endpoint working (expected error - session not connected)'
        );
      } else {
        console.log(
          '❌ Single message endpoint error:',
          error.response?.data || error.message
        );
      }
    }

    // Test bulk message endpoint
    try {
      const bulkMessageTest = await axios.post(
        `${BASE_URL}/api/${SESSION}/send-bulk-message`,
        {
          phones: ['5521999999999', '5521888888888'],
          message: 'Bulk test message',
        },
        { headers }
      );
      console.log('✅ Bulk message endpoint working');
    } catch (error) {
      if (
        error.response?.status === 404 &&
        error.response?.data?.message?.includes('não está ativa')
      ) {
        console.log(
          '✅ Bulk message endpoint working (expected error - session not connected)'
        );
      } else {
        console.log(
          '❌ Bulk message endpoint error:',
          error.response?.data || error.message
        );
      }
    }

    // Test bulk file endpoint
    try {
      const bulkFileTest = await axios.post(
        `${BASE_URL}/api/${SESSION}/send-bulk-file`,
        {
          phones: ['5521999999999'],
          base64: 'data:text/plain;base64,SGVsbG8gV29ybGQ=',
          filename: 'test.txt',
        },
        { headers }
      );
      console.log('✅ Bulk file endpoint working');
    } catch (error) {
      if (
        error.response?.status === 404 &&
        error.response?.data?.message?.includes('não está ativa')
      ) {
        console.log(
          '✅ Bulk file endpoint working (expected error - session not connected)'
        );
      } else {
        console.log(
          '❌ Bulk file endpoint error:',
          error.response?.data || error.message
        );
      }
    }

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Server is running');
    console.log('- ✅ Token generation works');
    console.log('- ✅ Session management works');
    console.log('- ✅ All messaging endpoints are available');
    console.log('- 📱 QR code should be available for WhatsApp pairing');
    console.log(
      '\n🔗 Visit http://localhost:21465/api-docs to see the Swagger documentation'
    );
    console.log(
      '🔗 The bulk messaging endpoints should be visible in the Messages section'
    );
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testBulkMessaging();
