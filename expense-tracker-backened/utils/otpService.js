
const nodemailer = require('nodemailer');
const axios = require('axios');

// Send OTP via SMS using STPL API
async function sendOtpSms(mobile, otp) {
  const smsUserId = process.env.SMS_API_USERID;
  const smsPassword = process.env.SMS_API_PASSWORD;
  const smsSenderId = process.env.SMS_API_SENDERID;

  if (!smsUserId || !smsPassword || !smsSenderId) {
    throw new Error('SMS API credentials not configured');
  }
  
  // Ensure mobile number is properly formatted (10 digits for India)
  const formattedMobile = mobile.replace(/\D/g, '').slice(-10);
  
  if (formattedMobile.length !== 10) {
    throw new Error('Invalid mobile number format');
  }
  
  // NOTE: This message uses the DLT-approved template registered with STPL.\n  // Changing the text will cause SMS delivery to fail. To update branding,\n  // register a new template with the STPL portal first.\n  const msg = `Dear user, ${otp} is your OTP to login to Riddhi Siddhi Trading Co. mobile app. This OTP is valid for 15 minutes. Do not share it with anyone. Login at http://riddhisiddhitrading.co.in/index.html`;
  
  // Build URL manually - Don't encode the entire message, just spaces and special chars
  const baseUrl = 'https://smsnotify.one/SMSApi/send';
  // Encode only spaces to %20, keep commas and other chars as-is to match approved template
  const encodedMsg = msg.replace(/ /g, '%20');
  const fullUrl = `${baseUrl}?userid=${smsUserId}&password=${smsPassword}&sendMethod=quick&mobile=${formattedMobile}&msg=${encodedMsg}&senderid=${smsSenderId}&msgType=text&format=text`;
  
  try {
    const response = await axios.get(fullUrl, { timeout: 30000 });
    
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
      throw new Error(`SMS API Error: ${responseData}`);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
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
