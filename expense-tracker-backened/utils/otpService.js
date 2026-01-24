
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
  const url = `https://smsnotify.one/SMSApi/send`;
  const params = {
    userid: smsUserId,
    password: smsPassword,
    sendMethod: 'quick',
    mobile: formattedMobile,
    msg,
    senderid: smsSenderId,
    msgType: 'text',
    format: 'json', // Changed to JSON to better parse response
  };
  
  try {
    console.log(`Attempting to send OTP SMS to ${formattedMobile.slice(0, 3)}****${formattedMobile.slice(-3)}`);
    const response = await axios.get(url, { params, timeout: 30000 });
    console.log('SMS API Response:', JSON.stringify(response.data));
    
    // Check for common error responses from SMS API
    const responseData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    if (responseData.toLowerCase().includes('error') || 
        responseData.toLowerCase().includes('failed') ||
        responseData.toLowerCase().includes('invalid')) {
      console.error('SMS API returned error:', responseData);
      throw new Error(`SMS API Error: ${responseData}`);
    }
    
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
