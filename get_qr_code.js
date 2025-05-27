const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:21465';
const SESSION = 'MYSESSION';
const SECRET_KEY = 'THISISMYSECURETOKEN';

async function getQRCode() {
  try {
    console.log('🚀 Getting QR Code for WhatsApp Connection...\n');

    // Step 1: Generate Token
    console.log('1. Generating token...');
    const tokenResponse = await axios.post(
      `${BASE_URL}/api/${SESSION}/${SECRET_KEY}/generate-token`
    );
    console.log('✅ Token generated successfully');

    const token = tokenResponse.data.token;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Step 2: Start Session with waitQrCode=true
    console.log('\n2. Starting session and waiting for QR code...');
    const sessionResponse = await axios.post(
      `${BASE_URL}/api/${SESSION}/start-session`,
      {
        waitQrCode: true,
      },
      { headers }
    );

    console.log('✅ Session started');

    // Step 3: Wait a moment for QR generation
    console.log('\n3. Waiting for QR code generation...');
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

    // Step 4: Get QR Code as image
    console.log('\n4. Fetching QR code...');
    try {
      const qrResponse = await axios.get(
        `${BASE_URL}/api/${SESSION}/qrcode-session`,
        {
          headers,
          responseType: 'arraybuffer',
        }
      );

      // Save QR code as image file
      fs.writeFileSync('qrcode.png', qrResponse.data);
      console.log('✅ QR Code saved as qrcode.png');
      console.log('📱 Open qrcode.png to scan with WhatsApp');
    } catch (qrError) {
      console.log('⚠️ QR Code not ready as image, trying JSON response...');

      // Try to get QR code data as JSON
      const qrJsonResponse = await axios.get(
        `${BASE_URL}/api/${SESSION}/status-session`,
        { headers }
      );

      if (qrJsonResponse.data.qrcode) {
        console.log('✅ QR Code available in base64 format');
        console.log(
          '🔗 QR Code base64 (first 100 chars):',
          qrJsonResponse.data.qrcode.substring(0, 100) + '...'
        );

        // Save base64 QR code as HTML file for easy viewing
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>WhatsApp QR Code</title>
    <style>
        body { text-align: center; font-family: Arial, sans-serif; padding: 20px; }
        img { max-width: 400px; border: 2px solid #25D366; border-radius: 10px; }
        .instructions { margin: 20px 0; color: #666; }
    </style>
</head>
<body>
    <h1>📱 WhatsApp QR Code</h1>
    <div class="instructions">
        <p>1. Open WhatsApp on your phone</p>
        <p>2. Go to Settings > Linked Devices</p>
        <p>3. Tap "Link a Device"</p>
        <p>4. Scan this QR code</p>
    </div>
    <img src="${qrJsonResponse.data.qrcode}" alt="WhatsApp QR Code" />
    <p><small>Session: ${SESSION}</small></p>
</body>
</html>`;

        fs.writeFileSync('qrcode.html', htmlContent);
        console.log('✅ QR Code saved as qrcode.html');
        console.log('🌐 Open qrcode.html in your browser to scan');
      } else {
        console.log(
          '❌ QR Code not available yet. Session status:',
          qrJsonResponse.data.status
        );
      }
    }

    // Step 5: Monitor connection status
    console.log('\n5. Monitoring connection status...');
    console.log('⏳ Waiting for WhatsApp scan... (will check every 5 seconds)');

    let attempts = 0;
    const maxAttempts = 12; // 1 minute total

    const checkConnection = async () => {
      try {
        const statusResponse = await axios.get(
          `${BASE_URL}/api/${SESSION}/check-connection-session`,
          { headers }
        );

        if (statusResponse.data.status === true) {
          console.log('🎉 SUCCESS! WhatsApp connected successfully!');
          console.log('✅ You can now use the messaging APIs');
          return true;
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(
              `⏳ Still waiting... (attempt ${attempts}/${maxAttempts})`
            );
            setTimeout(checkConnection, 5000);
          } else {
            console.log('⏰ Timeout reached. QR code may have expired.');
            console.log(
              '💡 Try running this script again to get a fresh QR code.'
            );
          }
        }
      } catch (error) {
        console.log(
          '⚠️ Connection check failed:',
          error.response?.data?.message || error.message
        );
      }
    };

    setTimeout(checkConnection, 5000);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure the server is running (npm start)');
    console.log('2. Check if port 21465 is available');
    console.log('3. Try clearing session data: rm -rf userDataDir/');
  }
}

// Run the script
getQRCode();
