
const nodemailer = require('nodemailer');
const axios = require('axios');

// Send OTP via SMS using STPL API
async function sendOtpSms(mobile, otp) {
  // Use environment variables for SMS API credentials (fallback to hardcoded for backward compatibility)
  const smsUserId = process.env.SMS_API_USERID || 'riddhisiddhi';
  const smsPassword = process.env.SMS_API_PASSWORD || 'eNyv6gCE';
  const smsSenderId = process.env.SMS_API_SENDERID || 'RIDSID';
  
  // Ensure mobile number is properly formatted (10 digits for India)
  const formattedMobile = mobile.replace(/\D/g, '').slice(-10);
  
  if (formattedMobile.length !== 10) {
    console.error('Invalid mobile number format:', mobile);
    throw new Error('Invalid mobile number format');
  }
  
  const msg = `Dear user, ${otp} is your OTP to verify your DailyCashBook account. This OTP is valid for 5 minutes. Do not share it with anyone. - DailyCashBook Team`;
  
  // Build URL with query string directly (like the working API example)
  const baseUrl = 'https://smsnotify.one/SMSApi/send';
  const queryParams = new URLSearchParams({
    userid: smsUserId,
    password: smsPassword,
    sendMethod: 'quick',
    mobile: formattedMobile,
    msg: msg,
    senderid: smsSenderId,
    msgType: 'text',
    format: 'text'
  });
  
  const fullUrl = `${baseUrl}?${queryParams.toString()}`;
  
  try {
    console.log(`Attempting to send OTP SMS to ${formattedMobile.slice(0, 3)}****${formattedMobile.slice(-3)}`);
    console.log('SMS API URL (masked):', fullUrl.replace(smsPassword, '***'));
    
    const response = await axios.get(fullUrl, { timeout: 30000 });
    console.log('SMS API Response:', response.data);
    
    // Parse the SMS API response - format=text returns string like:
    // "SimpleMessageSuccessResponse [status=success, statusCode=200, reason=success, ...]"
    const responseData = typeof response.data === 'string' ? response.data : String(response.data);
    
    // Check for success indicators
    const isSuccess = responseData.includes('status=success') || 
                      responseData.includes('statusCode=200') ||
                      responseData.includes('reason=success');
    
    // Check for actual failure indicators
    const isError = responseData.includes('status=failed') || 
                    responseData.includes('status=error') ||
                    responseData.includes('statusCode=4') ||  // 4xx errors
                    responseData.includes('statusCode=5');    // 5xx errors
    
    if (isError && !isSuccess) {
      console.error('SMS API returned error:', responseData);
      throw new Error(`SMS API Error: ${responseData}`);
    }
    
    console.log('SMS sent successfully!');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error sending OTP SMS:', error.response?.data || error.message);
    console.error('SMS API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(email, otp) {
  await transporter.sendMail({
    to: email,
    subject: 'Your OTP for Registration',
    html: `<p>Your OTP is <strong>${otp}</strong>. It expires in <b>5&nbsp;minutes</b>.</p>`,
  });
}

module.exports = { generateOTP, sendOtpEmail, sendOtpSms };
