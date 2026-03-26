
const nodemailer = require('nodemailer');
const axios = require('axios');

// Send OTP via SMS using STPL API (smsnotify.one)
async function sendOtpSms(mobile, otp, purpose = 'register') {
  const smsUserId = process.env.SMS_API_USERID;
  const smsPassword = process.env.SMS_API_PASSWORD;
  const smsSenderId = process.env.SMS_API_SENDERID;

  if (!smsUserId || !smsPassword || !smsSenderId) {
    throw new Error('SMS API credentials not configured. Set SMS_API_USERID, SMS_API_PASSWORD, SMS_API_SENDERID.');
  }

  // Normalize mobile to 10 digits (strip +91, 91, or leading 0)
  let formattedMobile = mobile.replace(/\D/g, '');
  if (formattedMobile.length === 12 && formattedMobile.startsWith('91')) formattedMobile = formattedMobile.slice(2);
  if (formattedMobile.length === 11 && formattedMobile.startsWith('0')) formattedMobile = formattedMobile.slice(1);

  if (formattedMobile.length !== 10) {
    throw new Error('Invalid mobile number format');
  }

  // DLT-approved templates – must match exactly what is registered on smsnotify.one
  const message = purpose === 'reset'
    ? `Dear User, ${otp} is your OTP to reset password of your Riddhi Siddhi Trading Co account. Valid for 10 minutes. Do not share it with anyone.`
    : `Dear User, ${otp} is your OTP to register your Riddhi Siddhi Trading Co account. Valid for 10 minutes. Do not share it with anyone.`;

  const params = {
    userid: smsUserId,
    password: smsPassword,
    sendMethod: 'quick',
    mobile: formattedMobile,
    msg: message,
    senderid: smsSenderId,
    msgType: 'text',
    format: 'text',
  };

  try {
    const response = await axios.get('https://smsnotify.one/SMSApi/send', { params, timeout: 30000 });

    const responseData = typeof response.data === 'string' ? response.data : String(response.data);
    console.log(`[SMS] Sent to ${formattedMobile} | purpose=${purpose} | API response: ${responseData}`);

    // Check for failure indicators
    const isError = responseData.includes('status=failed') ||
                    responseData.includes('status=error') ||
                    responseData.includes('statusCode=4') ||
                    responseData.includes('statusCode=5');

    if (isError) {
      throw new Error(`SMS API Error: ${responseData}`);
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error(`[SMS] Failed for ${formattedMobile}:`, error.message);
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

